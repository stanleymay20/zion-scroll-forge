#!/bin/bash

# Fix All Merge Conflicts Script
# This script automatically resolves merge conflicts by keeping HEAD version

echo "🔧 Starting merge conflict resolution..."

# Find all files with merge conflicts
FILES_WITH_CONFLICTS=$(git diff --name-only --diff-filter=U 2>/dev/null)

if [ -z "$FILES_WITH_CONFLICTS" ]; then
    echo "✅ No git-tracked merge conflicts found. Checking for conflict markers..."
    
    # Search for conflict markers in all files
    FILES_WITH_MARKERS=$(grep -rl "<<<<<<< HEAD" . --exclude-dir={node_modules,dist,coverage,.git,build} 2>/dev/null || true)
    
    if [ -z "$FILES_WITH_MARKERS" ]; then
        echo "✅ No merge conflict markers found!"
        exit 0
    fi
    
    echo "Found conflict markers in files. Resolving..."
    
    for file in $FILES_WITH_MARKERS; do
        echo "Processing: $file"
        
        # Remove conflict markers and keep HEAD version
        sed -i '/<<<<<<< HEAD/,/=======/!b; /<<<<<<< HEAD/d; /=======/d' "$file"
        sed -i '/>>>>>>> /d' "$file"
        
        echo "  ✓ Resolved: $file"
    done
else
    echo "Found git merge conflicts. Resolving..."
    
    for file in $FILES_WITH_CONFLICTS; do
        echo "Processing: $file"
        
        # Accept HEAD version (ours)
        git checkout --ours "$file"
        git add "$file"
        
        echo "  ✓ Resolved: $file"
    done
fi

echo ""
echo "✅ All merge conflicts resolved!"
echo ""
echo "Next steps:"
echo "1. Review the changes"
echo "2. Run tests to ensure everything works"
echo "3. Commit the resolved conflicts"
