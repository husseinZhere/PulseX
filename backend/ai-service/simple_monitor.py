#!/usr/bin/env python3
import time
import subprocess
import re
from pathlib import Path

log_file = Path("/home/youssef/Downloads/project_graduation_frist_step-master/ai-service/training_enhanced.log")

print("🔍 بدء المراقبة...")
print("="*60)

last_epoch = 0

for i in range(15):  # 15 minutes max
    # Check if running
    result = subprocess.run(["pgrep", "-f", "train_enhanced"], 
                          capture_output=True, text=True)
    
    if not result.stdout.strip():
        print("\n⏹️  التدريب انتهى!")
        break
    
    # Read progress
    if log_file.exists():
        content = log_file.read_text()
        epochs = re.findall(r'Epoch (\d+) Results:', content)
        
        if len(epochs) > last_epoch:
            last_epoch = len(epochs)
            epoch_num = epochs[-1]
            
            print(f"\n✅ Epoch {epoch_num}/20 اكتمل!")
            
            lines = content.split('\n')
            for i, line in enumerate(lines):
                if f'Epoch {epoch_num} Results:' in line:
                    for j in range(i+1, min(i+6, len(lines))):
                        if 'Acc:' in lines[j] or 'F1' in lines[j] or 'BEST' in lines[j]:
                            print(f"  {lines[j].strip()}")
                    break
    
    print(f"\r⏳ {i+1}/15 min", end='', flush=True)
    time.sleep(60)

# Final results
print("\n\n" + "="*60)
import json
meta_file = Path("/home/youssef/Downloads/project_graduation_frist_step-master/ai-service/models/binary_metadata.json")

if meta_file.exists():
    meta = json.load(open(meta_file))
    if 'Enhanced' in meta.get('model_name', ''):
        acc = meta['accuracy'] * 100
        print(f"🎯 Accuracy: {acc:.2f}%")
        if acc >= 95:
            print("🏆 نجحنا!")
print("="*60)
