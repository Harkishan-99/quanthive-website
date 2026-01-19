#!/bin/bash
# Asset Compression Script for QuantHive Website
# Run this script after installing required tools:
#   - ImageMagick: sudo apt install imagemagick
#   - cwebp: sudo apt install webp
#   - ffmpeg: sudo apt install ffmpeg

set -e

ASSETS_DIR="public/assets"
BACKUP_DIR="public/assets/originals"

echo "=== QuantHive Asset Compression Script ==="
echo ""

# Check for required tools
check_tool() {
    if ! command -v $1 &> /dev/null; then
        echo "WARNING: $1 not found. Install with: $2"
        return 1
    fi
    return 0
}

echo "Checking required tools..."
TOOLS_OK=true
check_tool "convert" "sudo apt install imagemagick" || TOOLS_OK=false
check_tool "cwebp" "sudo apt install webp" || TOOLS_OK=false
check_tool "ffmpeg" "sudo apt install ffmpeg" || TOOLS_OK=false

if [ "$TOOLS_OK" = false ]; then
    echo ""
    echo "Please install missing tools and run again."
    exit 1
fi

echo "All tools available!"
echo ""

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Function to compress image
compress_image() {
    local src=$1
    local max_width=$2
    local quality=$3
    local filename=$(basename "$src")
    local ext="${filename##*.}"
    local name="${filename%.*}"

    if [ -f "$src" ]; then
        echo "Compressing: $filename"

        # Backup original
        cp "$src" "$BACKUP_DIR/$filename"

        # Get current size
        local old_size=$(du -h "$src" | cut -f1)

        # Compress based on format
        if [ "$ext" = "jpg" ] || [ "$ext" = "jpeg" ]; then
            convert "$src" -resize "${max_width}>" -quality $quality "$src"
        elif [ "$ext" = "png" ]; then
            # Convert PNG to WebP for better compression
            cwebp -q $quality -resize $max_width 0 "$src" -o "${src%.*}.webp"
            echo "  -> Converted to WebP: ${name}.webp"
        elif [ "$ext" = "webp" ]; then
            # Re-compress WebP
            local temp_file=$(mktemp).png
            convert "$src" "$temp_file"
            cwebp -q $quality -resize $max_width 0 "$temp_file" -o "$src"
            rm "$temp_file"
        fi

        # Get new size
        local new_size=$(du -h "$src" | cut -f1)
        echo "  $old_size -> $new_size"
    else
        echo "File not found: $src"
    fi
}

# Function to compress video
compress_video() {
    local src=$1
    local filename=$(basename "$src")

    if [ -f "$src" ]; then
        echo "Compressing video: $filename"

        # Backup original
        cp "$src" "$BACKUP_DIR/$filename"

        local old_size=$(du -h "$src" | cut -f1)
        local temp_file="${src}.temp.mp4"

        # Compress to 1080p with CRF 23 (high quality)
        ffmpeg -y -i "$src" \
            -vf "scale=1920:1080:force_original_aspect_ratio=decrease" \
            -c:v libx264 -crf 23 -preset slow \
            -an \
            "$temp_file" 2>/dev/null

        mv "$temp_file" "$src"

        local new_size=$(du -h "$src" | cut -f1)
        echo "  $old_size -> $new_size"
    else
        echo "File not found: $src"
    fi
}

# Function to extract video poster
extract_poster() {
    local src=$1
    local output=$2

    if [ -f "$src" ]; then
        echo "Extracting poster frame from video..."
        ffmpeg -y -i "$src" -vframes 1 -q:v 2 "$output" 2>/dev/null
        # Apply same hue-rotate filter as CSS
        convert "$output" -modulate 100,100,50 "$output"
        echo "  Created: $output"
    fi
}

echo "=== Starting Compression ==="
echo ""

# Compress About page images (HIGH QUALITY - 85-90%)
echo "--- About Page Images ---"
compress_image "$ASSETS_DIR/img5.webp" 1600 85
compress_image "$ASSETS_DIR/img4.webp" 1600 85
compress_image "$ASSETS_DIR/img3.webp" 1600 85

# Compress large background images (HIGH QUALITY)
echo ""
echo "--- Background Images ---"
compress_image "$ASSETS_DIR/bg.jpg" 1920 85
compress_image "$ASSETS_DIR/contact_page_bkg.png" 1920 85
compress_image "$ASSETS_DIR/b1a1i2.png" 1600 85

# Compress video (HIGH QUALITY - CRF 23)
echo ""
echo "--- Video ---"
compress_video "$ASSETS_DIR/bkg_video_five.mp4"

# Extract poster frame
echo ""
echo "--- Video Poster ---"
extract_poster "$ASSETS_DIR/bkg_video_five.mp4" "$ASSETS_DIR/video-poster.jpg"

echo ""
echo "=== Compression Complete ==="
echo "Original files backed up to: $BACKUP_DIR"
echo ""
echo "Before/After comparison:"
du -sh "$BACKUP_DIR"/* 2>/dev/null | while read size file; do
    filename=$(basename "$file")
    if [ -f "$ASSETS_DIR/$filename" ]; then
        new_size=$(du -h "$ASSETS_DIR/$filename" | cut -f1)
        echo "  $filename: $size -> $new_size"
    fi
done
