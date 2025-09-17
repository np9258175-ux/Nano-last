# History loading prompt improvements

## 🎯 Improvement goals

In order to make the "Loading" prompt more stable and silky, avoid repeated loading and flickering problems.

## 🔧 Three minimum changes

### **1. Avoid repeated triggering of loadUserHistory()**

**Problem Description: **
Two loads will be triggered after logging in:
- `loadUserHistory() is automatically called once in `updateLoginUI()`
- In the process of `loginUser()`, `await loadUserHistory()` was once again

**Solution: **
Delete the call in `updateLoginUI()` to keep UI updates decoupled from data loading.

**Code modification: **
```javascript
function updateLoginUI() {
    // ... Other codes ...
    
    // 🚀 Remove duplicate calls: keep UI updates decoupled from data loading
    // History loading is managed uniformly by loginUser() process
    // loadUserHistory(); // Deleted
}
```

** Advantages: **
- Avoid duplicate loading
- Keep the focus apart
- Unified data loading management

### **2. Prevent concurrent loading from causing "chrysanthemum flickering"**

**Problem Description: **
If `loadUserHistory()` is called multiple times, it will cause the load prompt to flash.

**Solution: **
Add a lightweight reentry lock to ensure that it only runs once at the same time.

**Code modification: **
```javascript
// Lightweight reentry lock to prevent concurrent loading
let _loadingHistory = false;

async function loadUserHistory() {
    if (!currentUser) {
        return;
    }
    
    // 🚀 Prevent concurrent loading from causing "chrysanthemum flickering"
    if (_loadingHistory) {
        console.log('History is loading, skip repeated calls');
        return;
    }
    _loadingHistory = true;
    
    try {
        // ... Loading logic ...
    } finally {
        // Whether it is successful or failed, you must hide the history loading prompt
        hideHistoryLoading();
        _loadingHistory = false; // 🚀 Release the reentry lock
    }
}
```

** Advantages: **
- Prevent duplicate loading
- Avoid flickering problems
- Lightweight implementation

### **3. Force close the load prompt when logging out**

**Problem Description: **
If the user is on the History page and is loading, a loading prompt may remain when logging out.

**Solution: **
Force close the load prompt at the beginning of `googleLogout()` as a bottom-up mechanism.

### **4. Automatically display load status when switching to History**

**Problem Description: **
Sometimes users log in and stop at Editor first, and click History after a few hundred milliseconds. If the data is still in sync/request at this time, the "Loading" status should be automatically displayed.

**Solution: **
Add a check in the `switchMainTab()` function to automatically display the load status when switching to History.

### **5. Optimization of anti-flashing mechanism**

**Problem Description: **
When the data returns very quickly (< 300ms), the loading prompt will flash by, affecting the user experience.

**Solution: **
Adds a "anti-flashing" timing for `showHistoryLoading()` and `hideHistoryLoading()` at a minimum display of 300ms.

### **6. Syntax Error Fix**

**Problem Description: **
The `googleLogout` function is incorrectly nested inside the `loginUser` function, resulting in syntax errors and scripts not being executed normally.

**Solution: **
Fixed the indentation of the `googleLogout` function to make sure it is a standalone top-level function.

**Code modification: **
```javascript
function googleLogout() {
    // 🚀 Set the logout flag to prevent race conditions
    isLoggingOut = true;
    
    // 🚀 Add an era stamp to automatically invalidate all old login processes
    authEpoch++;
    
    // 🚀 Bottom: Force close the load prompt to avoid residual
    const loading = document.getElementById('history-loading');
    const list = document.getElementById('history-list');
    if (loading) {
        loading.style.display = 'none';
        console.log('Forced to close the history loading prompt');
    }
    if (list) {
        list.style.display = 'block';
        console.log('Restore history list display');
    }
    
    // ... Other logout logic ...
}
```

**Code modification: **
```javascript
function switchMainTab(tabId, event) {
    // ... Your original switching logic ...
    
    // 🚀 When switching to History, check whether it is still in synchronization/request, and "Loading" is automatically displayed
    if (tabId === 'history') {
        if (_loadingHistory || window.isHistorySyncing) {
            console.log('History is detected that it is still in synchronization, and the load status is automatically displayed');
            showHistoryLoading();
        }
    }
}
```

**Code modification: **
```javascript
let _loadingShowTime = 0; // Record the load start time

function showHistoryLoading() {
    // ... Status check ...
    
    if (historyLoading && historyList) {
        // 🚀 Record the display start time, used to prevent flickering
        _loadingShowTime = Date.now();
        
        historyLoading.style.display = 'block';
        historyList.style.display = 'none';
        // ...
    }
}

function hideHistoryLoading() {
    // ... Status check ...
    
    if (historyLoading && historyList) {
        // 🚀 Anti-flashing: Make sure that the loading prompt is displayed at least 300ms
        const showDuration = Date.now() - _loadingShowTime;
        const minShowTime = 300; // Minimum display of 300ms
        
        if (_loadingShowTime > 0 && showDuration < minShowTime) {
            const remainingTime = minShowTime - showDuration;
            setTimeout(() => {
                // Hide delay to ensure minimum display time
                if (!isLoggingOut && currentUser && historyLoading && historyList) {
                    historyLoading.style.display = 'none';
                    historyList.style.display = 'block';
                }
                _loadingShowTime = 0;
            }, remainingTime);
        } else {
            // Hide immediately
            historyLoading.style.display = 'none';
            historyList.style.display = 'block';
            _loadingShowTime = 0;
        }
    }
}
```
**Code modification: **
```javascript
// Before fixing (error nesting):
async function loginUser(user) {
    // ... Login logic ...
}
        function googleLogout() { // ❌ Error indentation, nested in loginUser
            // ... Logout logic ...
        }

// After fixing (correct independent function):
async function loginUser(user) {
    // ... Login logic ...
}

function googleLogout() { // ✅ Correct indentation, independent function
    // ... Logout logic ...
}
```

** Advantages: **
- Bottom protection
- Avoid residuals in extreme states
- Ensure the consistency of interface status

** Advantages: **
- The user experience is smoother
- Automatically detect synchronization status
- Avoid user confusion

** Advantages: **
- Avoid fast flickering
- Provide a more stable visual experience
- Intelligent delay mechanism

** Advantages: **
- Fixed serious syntax errors
- Ensure the script is executed normally
- Clear function structure

## 🧪 Test function

### **Test page function**
- `testHistoryLoading()` - Test basic loading prompts to show/hide
- `testHistoryLoadingLock()` - Test reentry lock mechanism
- `testHistoryTabSwitch()` - Test the loading status when switching to History tags
- `testAntiFlicker()` - Test anti-flash mechanism

### **Test scenario**
1. **Repeat call test**: Verify whether the reentry lock prevents duplicate loading
2. **Login out test**: Verify whether the load prompt is forced to be closed when logging out
3. **Concurrent Test**: Verify whether multiple simultaneous calls are processed correctly
4. **Tag switching test**: Verify whether the load status is automatically displayed when switching to History
5. **Anti-flash test**: Verify whether it is delayed at least 300ms when hiding quickly

## 📊 Improved effects

### **Before improvement**
- ❌Triggered loading after login
- ❌ "Chrysanthemums" may appear
- ❌ Residual loading prompts may be left when logging out

### ** Improved**
- ✅ Loading is triggered only once after logging in
- ✅ Stable "Loading History..." prompt
- ✅ Forced to close all loading status when logging out
- ✅ Fully compatible with existing Abort/epoch logic
- ✅ Automatically display loading status when switching to History
- ✅ Anti-flashing mechanism ensures a minimum display of 300ms
- ✅ Fix syntax errors, script execution normally

## 🔮 Technical Principles

### **Reentry lock mechanism**
- Use the boolean flag `_loadingHistory` to prevent repeated entry
- Make sure the lock is released in the `finally` block
- Lightweight implementation without affecting performance

### **Status Management**
- Decoupling of UI updates and data loading
- Unified data loading process management
- The bottom-up mechanism ensures consistency of state

### **Compatibility Guarantee**
- Compatible with the existing `isLoggingOut` logo
- Compatible with the `authEpoch` mechanism
- Does not affect existing error handling logic

## 📝 Summary

Through these six key changes, we achieved:

1. **Avoid duplicate loading**: Keep UI updates decoupled from data loading
2. **Prevent flashing**: Re-enter the lock to ensure stable display of loading prompts
3. **Base protection**: Force shutdown of all loading status when logging out
4. **Intelligent state detection**: Automatically display load status when switching to History
5. **Anti-flashing mechanism**: Make sure that the loading prompt is displayed at least 300ms, and avoid flashing.
6. **Syntax error fix**: Fix function nesting problem and ensure that the script executes normally

These improvements make history loading tips more stable and silky, improving user experience while maintaining code simplicity and maintainability. In particular, anti-flash mechanism and syntax repair solve key user experience and functional problems.