#!/bin/bash
# Download Chest X-ray Pneumonia dataset from Kaggle

echo "🔽 Downloading Chest X-ray Pneumonia Dataset from Kaggle..."
echo ""

# Check if kaggle is installed
if ! command -v kaggle &> /dev/null; then
    echo "❌ Kaggle CLI not found. Installing..."
    pip install kaggle
fi

# Check for Kaggle credentials
if [ ! -f ~/.kaggle/kaggle.json ]; then
    echo "❌ Kaggle credentials not found!"
    echo ""
    echo "Please setup Kaggle API credentials:"
    echo "1. Go to https://www.kaggle.com/settings"
    echo "2. Click 'Create New API Token'"
    echo "3. Move the downloaded kaggle.json to ~/.kaggle/"
    echo "4. Run: chmod 600 ~/.kaggle/kaggle.json"
    echo "5. Run this script again"
    exit 1
fi

# Create download directory
DOWNLOAD_DIR="$HOME/Downloads/chest_xray"
mkdir -p "$DOWNLOAD_DIR"

cd "$DOWNLOAD_DIR" || exit

# Download dataset
echo "📥 Downloading dataset..."
kaggle datasets download -d paultimothymooney/chest-xray-pneumonia

# Unzip
if [ -f chest-xray-pneumonia.zip ]; then
    echo "📦 Extracting dataset..."
    unzip -q chest-xray-pneumonia.zip
    rm chest-xray-pneumonia.zip
    
    echo ""
    echo "✅ Dataset downloaded and extracted to: $DOWNLOAD_DIR"
    echo ""
    echo "Dataset structure:"
    tree -L 2 "$DOWNLOAD_DIR" 2>/dev/null || ls -la "$DOWNLOAD_DIR"
    
    echo ""
    echo "🚀 Ready to train! Run:"
    echo "   cd ai-service"
    echo "   python3 train_xray_model.py"
else
    echo "❌ Download failed!"
fi
