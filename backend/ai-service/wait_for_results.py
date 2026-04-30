#!/usr/bin/env python3
"""
Wait for training to complete and show final results
"""

import time
import subprocess
import json
from pathlib import Path

log_file = Path("/home/youssef/Downloads/project_graduation_frist_step-master/ai-service/training_enhanced.log")
metadata_file = Path("/home/youssef/Downloads/project_graduation_frist_step-master/ai-service/models/binary_metadata.json")

print("⏳ Monitoring Enhanced Training...")
print("="*70)
print("Target: 95%+ Accuracy | Device: CUDA GPU | Epochs: 20")
print("="*70 + "\n")

start_time = time.time()
last_epoch = 0

while True:
    # Check if process is running
    result = subprocess.run(["pgrep", "-f", "train_enhanced.py"], 
                          capture_output=True, text=True)
    
    elapsed_mins = int((time.time() - start_time) / 60)
    
    if result.stdout.strip():
        # Still running - show progress
        if log_file.exists():
            with open(log_file) as f:
                content = f.read()
            
            # Find current epoch
            import re
            epochs = re.findall(r'Epoch (\d+)/20', content)
            if epochs:
                current_epoch = int(epochs[-1])
                
                if current_epoch != last_epoch:
                    # New epoch completed
                    last_epoch = current_epoch
                    
                    # Show results
                    lines = content.split('\n')
                    for i, line in enumerate(lines):
                        if f'Epoch {current_epoch} Results:' in line:
                            print(f"\n{'='*70}")
                            print(f"✅ Epoch {current_epoch}/20 Complete ({elapsed_mins} mins elapsed)")
                            print(f"{'='*70}")
                            
                            # Show next 6 lines (metrics)
                            for j in range(i+1, min(i+7, len(lines))):
                                if lines[j].strip():
                                    print(lines[j])
                            break
                
                print(f"\r🔄 Training... Epoch {current_epoch}/20 | {elapsed_mins} min elapsed", 
                      end='', flush=True)
        
        time.sleep(10)  # Check every 10 seconds
    
    else:
        # Training stopped
        print(f"\n\n{'='*70}")
        print(f"⏹️  Training Completed! ({elapsed_mins} minutes total)")
        print(f"{'='*70}\n")
        
        # Show final results
        if metadata_file.exists():
            with open(metadata_file) as f:
                meta = json.load(f)
            
            if 'Enhanced' in meta.get('model_name', ''):
                acc = meta.get('accuracy', 0) * 100
                f1 = meta.get('f1_score', 0)
                epochs_trained = meta.get('epochs_trained', 0)
                
                print("📊 FINAL RESULTS:")
                print(f"   🎯 Accuracy: {acc:.2f}%")
                print(f"   🎯 F1 Score: {f1:.4f}")
                print(f"   📈 Epochs Trained: {epochs_trained}")
                print(f"   🔧 Optimizer: {meta.get('optimizer', 'N/A')}")
                print(f"   📅 Date: {meta.get('training_date', 'N/A')}")
                
                print(f"\n📁 Generated Files:")
                print(f"   ✓ models/xray_binary_model.pth (trained model)")
                print(f"   ✓ models/binary_metadata.json (metrics)")
                print(f"   ✓ models/confusion_matrix.png")
                print(f"   ✓ models/training_history.png")
                
                print(f"\n{'='*70}")
                
                if acc >= 95:
                    print("🏆🏆🏆 SUCCESS! 95%+ ACCURACY ACHIEVED! 🏆🏆🏆")
                elif acc >= 90:
                    print(f"✅ Excellent! {acc:.2f}% accuracy achieved!")
                elif acc >= 85:
                    print(f"✅ Good! {acc:.2f}% accuracy achieved!")
                else:
                    print(f"⚠️  Got {acc:.2f}%. Target was 95%+")
                
                print(f"{'='*70}\n")
                
                print("🚀 Next Steps:")
                print("   1. Restart the API server to use the new model")
                print("   2. Test with: python3 test_trained_model.py")
                print("   3. Check graphs: models/training_history.png")
                
            else:
                print("⚠️  Metadata not updated. Check training_enhanced.log for errors")
        else:
            print("❌ No metadata file found. Training may have failed.")
        
        print(f"\n{'='*70}")
        break

print("\nDone!")
