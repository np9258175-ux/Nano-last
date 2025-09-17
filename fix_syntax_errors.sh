#!/bin/bash

echo "🔍 Check and fix JavaScript syntax errors..."

# Check all HTML and JS files
for file in *.html *.js; do
    if [ -f "$file" ]; then
        echo "Check file: $file"
        
        # Fix wrong object expansion syntax
        if grep -q "user = { \.existingUserData, \.user }" "$file"; then
            echo " ❌ The wrong object expansion syntax found, is being fixed..."
            sed -i '' 's/user = { \.existingUserData, \.user };/user = { ...existingUserData, ...user };/g' "$file"
            echo " ✅ Fixed object expansion syntax"
        fi
        
        # Check for incomplete attribute access
        if grep -q "document\.querySelector.*\.$" "$file"; then
            echo " ❌ Incomplete attribute access was found, it needs to be repaired manually"
            grep -n "document\.querySelector.*\.$" "$file"
        fi
        
        # Check for other possible syntax errors
        if grep -q "{ \." "$file" | grep -v "{ \.\.\." ; then
            echo " ⚠️ Found possible syntax errors:"
            grep -n "{ \." "$file" | grep -v "{ \.\.\."
        fi
    fi
done

echo "🎯 The grammar check is completed!"