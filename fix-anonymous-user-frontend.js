// Front-end repair: Support unlogged users to save and view history
// This file contains repair code that needs to be added to index.html

// 1. Modify the saveHistoryToSupabase function
async function saveHistoryToSupabase(historyItem) {
    if (!config) {
        console.log('Configuration not loaded, history synchronization skipped');
        return false;
    }
    
    try {
        let response;
        
        if (currentUser) {
            // Logged in users use the original API
            response = await fetch('/api/user-history-unified', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'user-id': currentUser.id
                },
                body: JSON.stringify({
                    type: historyItem.type,
                    prompt: historyItem.prompt,
                    result_image: historyItem.resultImage,
                    input_images: historyItem.inputImages,
                    user_id: currentUser.id
                })
            });
        } else {
            //Unlogged in user uses new anonymous API
            response = await fetch('/api/save-anonymous-history', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type: historyItem.type,
                    prompt: historyItem.prompt,
                    result_image: historyItem.resultImage,
                    input_images: historyItem.inputImages
                })
            });
        }
        
        const result = await response.json();
        
        if (!response.ok) {
            console.error('Failed to save history:', result.error);
            return false;
        }
        
        // Return the inserted data
        return result.data && result.data[0] ? result.data[0] : false;
        
    } catch (error) {
        console.error('History save error:', error);
        return false;
    }
}

// 2. Modify the loadUserHistory function
async function loadUserHistory() {
    if (!config) {
        console.log('Configuration not loaded, history loading skipped');
        return;
    }
    
    try {
        let response;
        
        if (currentUser) {
            //Load personal history by logged in
            response = await fetch(`/api/user-history-unified?user_id=${currentUser.id}&simple=true`, {
                method: 'GET',
                headers: {
                    'user-id': currentUser.id
                }
            });
        } else {
            //Unlogged user loads anonymous history
            response = await fetch('/api/get-anonymous-history?simple=true', {
                method: 'GET'
            });
        }
        
        const result = await response.json();
        
        if (!response.ok) {
            console.error('Loading history failed:', result.error);
            return;
        }
        
        if (result.data && Array.isArray(result.data)) {
            userHistory = result.data.map(item => ({
                id: item.id,
                type: item.type,
                prompt: item.prompt,
                resultImage: item.result_image,
                inputImages: item.input_images,
                createdAt: item.created_at,
                userInfo: {
                    name: item.user_name || 'Anonymous User',
                    email: item.user_email || 'Not logged in',
                    avatar: item.user_avatar || null
                }
            }));
            
            console.log('History loaded successfully, quantity:', userHistory.length);
            renderHistory();
        }
        
    } catch (error) {
        console.error('Load history error:', error);
    }
}

// 3. Modify the saveUserHistory function
async function saveUserHistory(historyItem) {
    console.log('Save history:', historyItem);
    
    // Generate a unique ID (if not already)
    if (!historyItem.id) {
        historyItem.id = 'temp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    // Set creation time
    if (!historyItem.createdAt) {
        historyItem.createdAt = new Date().toISOString();
    }
    
    // Add to local array
    userHistory.unshift(historyItem);
    console.log('After adding to userHistory, the length becomes:', userHistory.length);
    
    // Save to localStorage (if enabled)
    saveUserHistoryToStorage();
    
    // Save to the backend at the same time (regardless of logging in or not)
    if (config) {
        console.log('Synchronize history to backend...');
        try {
            const backendData = await saveHistoryToSupabase(historyItem);
            if (backendData && backendData.id) {
                // Update the local history item's ID to the real ID returned by the backend
                historyItem.id = backendData.id;
                console.log('The local history ID has been updated to backend ID:', backendData.id);
                
                // Resave to localStorage to ensure the ID is synchronized
                saveUserHistoryToStorage();
                
                console.log('History has been synchronized to the backend');
            } else {
                console.warn('History synchronization failed to be synchronized to the backend, but saved to localStorage');
            }
        } catch (error) {
            console.error('Backend synchronization error:', error);
        }
    }
    
    console.log('Save history completed:', historyItem);
    
    // Update display
    renderHistory();
}

// 4. Modify page initialization logic
async function initializePage() {
    console.log('=== page initialization start ===');
    
    try {
        // Load configuration
        await loadConfig();
        
        // Initialize Supabase
        await initializeSupabase();
        
        // Check whether there is saved user information
        const savedUser = localStorage.getItem('nanoBananaUser');
        if (savedUser) {
            try {
                const user = JSON.parse(savedUser);
                currentUser = user;
                console.log('Recover user information from localStorage:', user.id);
                
                // Update UI display
                updateLoginUI();
                
                // Show history main tab page
                document.getElementById('history-main-tab').style.display = 'inline-block';
                
                // Load user history
                await loadUserHistory();
            } catch (error) {
                console.error('Recovering user information failed:', error);
                localStorage.removeItem('nanoBananaUser');
            }
        } else {
            // The unlogged user also loads anonymous history
            console.log('User not logged in, anonymous history is loaded');
            await loadUserHistory();
        }
        
        console.log('=== Page initialization is completed ===');
        
    } catch (error) {
        console.error('Page initialization failed:', error);
    }
}

// 5. Modify the history display logic
function renderHistory() {
    const historyList = document.getElementById('history-list');
    if (!historyList) return;
    
    if (userHistory.length === 0) {
        historyList.innerHTML = `
            <div class="no-history">
                <p>${currentUser ? 'You haven't generated an image yet' : 'You haven't generated an image yet (not logged in)'}</p>
                <p class="history-hint">${currentUser ? 'Start generate your first image! ' : 'Start generate your first image! After logging in, you can synchronize to the cloud. '}</p>
            </div>
        `;
        return;
    }
    
    historyList.innerHTML = userHistory.map(item => `
        <div class="history-item" data-id="${item.id}">
            <div class="history-content">
                <div class="history-image">
                    <img src="${item.resultImage}" alt="Generated Image" loading="lazy">
                </div>
                <div class="history-details">
                    <div class="history-prompt">${item.prompt}</div>
                    <div class="history-meta">
                        <span class="history-type">${getTypeDisplayName(item.type)}</span>
                        <span class="history-time">${formatTime(item.createdAt)}</span>
                        ${item.userInfo ? `<span class="history-user">${item.userInfo.name}</span>` : ''}
                    </div>
                </div>
            </div>
            <div class="history-actions">
                <button onclick="downloadImage('${item.resultImage}', '${item.prompt}')" class="btn-download">Download</button>
                <button onclick="deleteHistoryItem('${item.id}')" class="btn-delete">Delete</button>
            </div>
        </div>
    `).join('');
}

// 6. Add type display name function
function getTypeDisplayName(type) {
    const typeMap = {
        'text-to-image': 'text generation',
        'image-edit': 'image editing',
        'multi-image': 'multi-image'
    };
    return typeMap[type] || type;
}

// 7. Add time formatting function
function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) { // Within 1 minute
        return 'just';
    } else if (diff < 3600000) { // Within 1 hour
        return Math.floor(diff / 60000) + 'minute ago';
    } else if (diff < 86400000) { // Within 1 day
        return Math.floor(diff / 3600000) + 'hour ago';
    } else {
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    }
}