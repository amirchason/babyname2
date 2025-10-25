#!/bin/bash

# Optimize baby GIFs for web use
# Reduces file size while maintaining quality

SOURCE_DIR="/storage/emulated/0/Download/babygif/yes"
DEST_DIR="/data/data/com.termux/files/home/proj/babyname2/public/assets/baby-gifs"

echo "🎬 OPTIMIZING BABY GIFS FOR WEB"
echo "================================"
echo ""

# Create destination directory
mkdir -p "$DEST_DIR"

# Check if gifsicle is installed
if ! command -v gifsicle &> /dev/null; then
    echo "📦 Installing gifsicle for GIF optimization..."
    pkg install gifsicle -y
fi

echo "📂 Source: $SOURCE_DIR"
echo "📁 Destination: $DEST_DIR"
echo ""

# Counter
count=0
total_original=0
total_optimized=0

# Process each GIF
for gif in "$SOURCE_DIR"/*.gif; do
    if [ -f "$gif" ]; then
        count=$((count + 1))
        filename=$(basename "$gif")

        # Create clean filename: baby-1.gif, baby-2.gif, etc.
        clean_name="baby-${count}.gif"
        dest_path="$DEST_DIR/$clean_name"

        # Get original size
        original_size=$(stat -c%s "$gif")
        original_mb=$(echo "scale=2; $original_size / 1048576" | bc)
        total_original=$(echo "$total_original + $original_size" | bc)

        echo "🎨 Processing: $filename"
        echo "   Original: ${original_mb}MB"

        # Optimize with gifsicle:
        # -O3: Maximum optimization
        # --colors 128: Reduce to 128 colors (from 256)
        # --lossy=80: Slight lossy compression
        # --resize-fit 200x200: Max dimensions 200x200
        gifsicle -O3 --colors 128 --lossy=80 --resize-fit 200x200 "$gif" -o "$dest_path" 2>/dev/null

        if [ $? -eq 0 ]; then
            optimized_size=$(stat -c%s "$dest_path")
            optimized_mb=$(echo "scale=2; $optimized_size / 1048576" | bc)
            total_optimized=$(echo "$total_optimized + $optimized_size" | bc)

            reduction=$(echo "scale=1; ($original_size - $optimized_size) * 100 / $original_size" | bc)

            echo "   ✅ Optimized: ${optimized_mb}MB (${reduction}% smaller)"
            echo "   Saved as: $clean_name"
        else
            echo "   ❌ Failed to optimize"
        fi

        echo ""
    fi
done

# Summary
echo "================================"
echo "📊 OPTIMIZATION SUMMARY"
echo "================================"
echo "Total GIFs processed: $count"

total_original_mb=$(echo "scale=2; $total_original / 1048576" | bc)
total_optimized_mb=$(echo "scale=2; $total_optimized / 1048576" | bc)
total_reduction=$(echo "scale=1; ($total_original - $total_optimized) * 100 / $total_original" | bc)

echo "Original total: ${total_original_mb}MB"
echo "Optimized total: ${total_optimized_mb}MB"
echo "Total reduction: ${total_reduction}%"
echo ""
echo "✅ Done! GIFs ready at: $DEST_DIR"
