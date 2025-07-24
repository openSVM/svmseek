#!/bin/bash
# Cross-platform APK size validation script
# Supports different stat command formats across various runners

set -e

APK_FILE="$1"
MIN_SIZE_MB="${2:-1}"  # Default 1MB minimum

if [ -z "$APK_FILE" ]; then
    echo "Usage: $0 <apk-file> [min-size-mb]"
    exit 1
fi

if [ ! -f "$APK_FILE" ]; then
    echo "ERROR: APK file not found: $APK_FILE"
    exit 1
fi

# Function to get file size in bytes - works across different systems
get_file_size() {
    local file="$1"
    local size=0
    
    # Try different stat command formats
    if command -v stat >/dev/null 2>&1; then
        # macOS/BSD format
        if size=$(stat -f%z "$file" 2>/dev/null); then
            echo "$size"
            return 0
        fi
        
        # Linux/GNU format
        if size=$(stat -c%s "$file" 2>/dev/null); then
            echo "$size"
            return 0
        fi
    fi
    
    # Fallback: use ls command (less reliable but widely available)
    if command -v ls >/dev/null 2>&1; then
        size=$(ls -l "$file" | awk '{print $5}')
        if [ "$size" -gt 0 ] 2>/dev/null; then
            echo "$size"
            return 0
        fi
    fi
    
    # Final fallback: use wc -c
    if command -v wc >/dev/null 2>&1; then
        size=$(wc -c < "$file" 2>/dev/null || echo "0")
        echo "$size"
        return 0
    fi
    
    echo "0"
    return 1
}

# Get APK size
APK_SIZE=$(get_file_size "$APK_FILE")
MIN_SIZE=$((MIN_SIZE_MB * 1024 * 1024))

echo "Checking APK size for: $APK_FILE"
echo "APK size: $APK_SIZE bytes ($(( APK_SIZE / 1024 / 1024 ))MB)"
echo "Minimum required: $MIN_SIZE bytes (${MIN_SIZE_MB}MB)"

if [ "$APK_SIZE" -lt "$MIN_SIZE" ]; then
    echo "ERROR: APK size ($APK_SIZE bytes) is below minimum threshold (${MIN_SIZE_MB}MB)"
    echo "This may indicate build issues or corrupted APK"
    exit 1
fi

if [ "$APK_SIZE" -eq 0 ]; then
    echo "ERROR: APK file is empty or could not determine size"
    exit 1
fi

echo "✓ APK size validation passed"
exit 0