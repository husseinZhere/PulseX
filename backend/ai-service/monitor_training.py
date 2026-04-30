#!/usr/bin/env python3
"""Monitor training progress"""

import time
import json
from pathlib import Path

model_metadata_path = Path("models/binary_metadata.json")
output_log = Path("training_output.log")

print("🔍 Monitoring training progress...\n")
print("Press Ctrl+C to stop monitoring\n")

try:
    last_size = 0
    while True:
        # Check if metadata exists (training complete)
        if model_metadata_path.exists():
            with open(model_metadata_path) as f:
                metadata = json.load(f)
            
            print("\n" + "="*60)
            print("🎉 TRAINING COMPLETE!")
            print("="*60)
            print(f"Final Accuracy: {metadata['accuracy']*100:.2f}%")
            print(f"Epochs: {metadata.get('epochs', 'N/A')}")
            print(f"Training Date: {metadata.get('training_date', 'N/A')}")
            
            if 'history' in metadata:
                history = metadata['history']
                print(f"\nBest Training Accuracy: {max(history.get('train_acc', [0]))*100:.2f}%")
                print(f"Best Validation Accuracy: {max(history.get('val_acc', [0]))*100:.2f}%")
                print(f"Best F1 Score: {max(history.get('val_f1', [0])):.4f}")
            
            print("\n✅ Model saved to: models/xray_binary_model.pth")
            print("✅ Metadata saved to: models/binary_metadata.json")
            print("✅ Confusion matrix: models/confusion_matrix.png")
            print("✅ Training history: models/training_history.png")
            break
        
        # Show tail of log file if it changed
        if output_log.exists():
            current_size = output_log.stat().st_size
            if current_size > last_size:
                with open(output_log) as f:
                    f.seek(max(0, current_size - 2000))  # Last 2KB
                    content = f.read()
                    lines = content.split('\n')
                    print('\n'.join(lines[-10:]))  # Last 10 lines
                last_size = current_size
        
        time.sleep(10)  # Check every 10 seconds

except KeyboardInterrupt:
    print("\n\n⏸️  Monitoring stopped")
    print("Training is still running in background")
    print(f"Check full log: cat {output_log.absolute()}")
