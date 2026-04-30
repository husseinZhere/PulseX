#!/usr/bin/env python3
"""Wait for training to complete and show results"""

import time
import json
import subprocess
from pathlib import Path

print("⏳ Waiting for training to complete...")
print("This usually takes 10-15 minutes for 15 epochs\n")

metadata_path = Path("/home/youssef/Downloads/project_graduation_frist_step-master/ai-service/models/binary_metadata.json")
training_started = time.time()

# Wait for training to complete
while True:
    # Check if process is still running
    result = subprocess.run(
        ["pgrep", "-f", "train_xray_model.py"],
        capture_output=True,
        text=True
    )
    
    elapsed = time.time() - training_started
    mins = int(elapsed / 60)
    secs = int(elapsed % 60)
    
    if not result.stdout.strip():
        # Process ended
        print(f"\n✅ Training process completed after {mins}m {secs}s")
        break
    else:
        print(f"\r⏱️  Elapsed: {mins:02d}:{secs:02d} | PID: {result.stdout.strip()} | Status: Training...", end="", flush=True)
        time.sleep(5)

# Check results
print("\n\n" + "="*60)
print(" 🎯 TRAINING RESULTS")
print("="*60 + "\n")

if metadata_path.exists():
    with open(metadata_path) as f:
        metadata = json.load(f)
    
    print(f"✅ Model: {metadata.get('model_name', 'N/A')}")
    print(f"✅ Final Accuracy: {metadata.get('accuracy', 0)*100:.2f}%")
    print(f"✅ Dataset: {metadata.get('dataset', 'N/A')}")
    print(f"✅ Architecture: {metadata.get('architecture', 'N/A')}")
    print(f"✅ Training Date: {metadata.get('training_date', 'N/A')}")
    print(f"✅ Epochs: {metadata.get('epochs', 'N/A')}")
    print(f"✅ Batch Size: {metadata.get('batch_size', 'N/A')}")
    print(f"✅ Learning Rate: {metadata.get('learning_rate', 'N/A')}")
    
    if 'history' in metadata:
        history = metadata['history']
        print(f"\n📊 Training History:")
        print(f"  Best Train Accuracy: {max(history.get('train_acc', [0]))*100:.2f}%")
        print(f"  Best Val Accuracy: {max(history.get('val_acc', [0]))*100:.2f}%")
        print(f"  Best F1 Score: {max(history.get('val_f1', [0])):.4f}")
        print(f"  Final Train Loss: {history.get('train_loss', [0])[-1]:.4f}")
    
    print(f"\n📁 Generated Files:")
    print(f"  ✅ models/xray_binary_model.pth")
    print(f"  ✅ models/binary_metadata.json")
    print(f"  ✅ models/confusion_matrix.png")
    print(f"  ✅ models/training_history.png")
    
    print(f"\n🚀 Model is ready to use!")
    print(f"   Restart the server to use the new trained model")
    
else:
    print("❌ Training metadata not found")
    print("   Check training_output.log for errors")

print("\n" + "="*60)
