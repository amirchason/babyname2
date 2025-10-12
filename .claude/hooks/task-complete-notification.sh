#!/data/data/com.termux/files/usr/bin/bash

# Task Completion Notification Hook
# Runs when Claude finishes responding (Stop event)

# Read JSON input from stdin
input=$(cat)

# Extract session info
session_id=$(echo "$input" | jq -r '.session_id // "unknown"')
hook_event=$(echo "$input" | jq -r '.hook_event_name // "Stop"')

# Get timestamp
timestamp=$(date '+%H:%M:%S')

# Check if we're already in a stop hook (prevent infinite loops)
stop_hook_active=$(echo "$input" | jq -r '.stop_hook_active // false')

if [ "$stop_hook_active" = "true" ]; then
    exit 0
fi

# Try Termux:API notification (will fail silently if API app not installed)
(termux-notification \
    --title "✅ Claude Task Complete" \
    --content "Task finished at $timestamp" \
    --id "claude-task-$session_id" \
    --priority high \
    --sound \
    --vibrate "100,100" && \
 termux-toast "✅ Claude task complete" -s) &>/dev/null && exit 0

# Fallback: Terminal notification
echo ""
echo "════════════════════════════════════════"
echo "  ✅ CLAUDE TASK COMPLETE"
echo "  Time: $timestamp"
echo "════════════════════════════════════════"
echo ""

# Log to file
mkdir -p "$CLAUDE_PROJECT_DIR/.claude/logs"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Task completed (Session: ${session_id:0:8})" >> "$CLAUDE_PROJECT_DIR/.claude/logs/task-completions.log"

exit 0
