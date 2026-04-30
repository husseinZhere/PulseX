#!/bin/bash
# Quick script to check enhanced training status

echo "🔍 Enhanced Training Status Check"
echo "=================================="
echo ""

# Check if training is running
PID=$(pgrep -f train_enhanced.py)

if [ -n "$PID" ]; then
    echo "✅ Training is RUNNING (PID: $PID)"
    echo ""
    
    # Show elapsed time
    ELAPSED=$(ps -p $PID -o etime= | tr -d ' ')
    echo "⏱️  Elapsed Time: $ELAPSED"
    echo ""
    
    # Show recent progress from log
    if [ -f training_enhanced.log ]; then
        echo "📊 Latest Progress:"
        echo "------------------"
        
        # Show epoch info
        grep -E "Epoch [0-9]+/[0-9]+" training_enhanced.log | tail -1
        
        # Show latest accuracy
        grep "Val Acc:" training_enhanced.log | tail -1
        
        # Show best result
        grep "NEW BEST" training_enhanced.log | tail -1
        
        echo ""
        echo "💡 Monitor live with:"
        echo "   tail -f training_enhanced.log"
        echo ""
        echo "💡 Or use:"
        echo "   watch -n 5 'tail -20 training_enhanced.log'"
    fi
else
    echo "❌ Training NOT running"
    echo ""
    
    # Check if completed
    if [ -f models/binary_metadata.json ]; then
        if grep -q "Enhanced" models/binary_metadata.json; then
            ACC=$(python3 -c "import json; print(json.load(open('models/binary_metadata.json'))['accuracy']*100)")
            echo "✅ Training may have completed"
            echo "📊 Accuracy: ${ACC}%"
        fi
    fi
    
    echo ""
    echo "💡 Start training with:"
    echo "   cd ai-service && nohup python3 train_enhanced.py > training_enhanced.log 2>&1 &"
fi

echo ""
echo "=================================="
