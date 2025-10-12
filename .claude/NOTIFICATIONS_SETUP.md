# Task Completion Notifications Setup

## ✅ What's Already Configured

Your project is now set up to notify you when Claude finishes tasks!

### Current Setup

1. **Hook Installed**: `.claude/hooks/task-complete-notification.sh`
2. **Hook Registered**: In `.claude/settings.local.json` under `hooks.Stop`
3. **Fallback Mode**: Works without Termux:API (terminal notifications + log file)

## 🔔 Current Behavior

**Right now** (without Termux:API):
- ✅ Terminal notification appears when task completes
- ✅ Task completions logged to `.claude/logs/task-completions.log`
- ⚠️ No Android push notifications (requires Termux:API)

**After installing Termux:API**:
- ✅ Android push notification with sound and vibration
- ✅ Toast message at bottom of screen
- ✅ Terminal notification
- ✅ Task log file

## 📱 How to Enable Android Notifications (Optional)

To get real Android notifications, install **Termux:API**:

### Option 1: F-Droid (Recommended)
1. Install F-Droid app from https://f-droid.org
2. Open F-Droid
3. Search for "Termux:API"
4. Install it
5. Restart Claude Code session

### Option 2: GitHub Release
1. Download from: https://github.com/termux/termux-api/releases
2. Install the APK
3. Grant notification permissions
4. Restart Claude Code session

### Option 3: Build from Source
```bash
# Clone and build
git clone https://github.com/termux/termux-api
cd termux-api
./gradlew assembleDebug
# Install the resulting APK
```

## 🧪 Testing

### Test the Hook Manually
```bash
cd /data/data/com.termux/files/home/proj/babyname2
export CLAUDE_PROJECT_DIR=$(pwd)
echo '{"session_id":"test","hook_event_name":"Stop","stop_hook_active":false}' | ./.claude/hooks/task-complete-notification.sh
```

You should see:
```
════════════════════════════════════════
  ✅ CLAUDE TASK COMPLETE
  Time: HH:MM:SS
════════════════════════════════════════
```

### Test in Real Usage

**After restarting Claude Code**, ask Claude anything:
```
"What is 2 + 2?"
```

When Claude finishes responding, you'll see the notification!

## 🔍 Viewing Task History

Check your task completion log:
```bash
cat .claude/logs/task-completions.log
```

## ⚙️ Customization

Edit `.claude/hooks/task-complete-notification.sh` to customize:

### Change Notification Title
```bash
--title "Your Custom Title"
```

### Change Terminal Message
```bash
echo "  🎉 YOUR CUSTOM MESSAGE"
```

### Disable Logging
Comment out:
```bash
# echo "[...] Task completed..." >> "$CLAUDE_PROJECT_DIR/.claude/logs/task-completions.log"
```

### Add More Info
```bash
# Extract more from JSON input
tool_name=$(echo "$input" | jq -r '.tool_name // "unknown"')
echo "  Tool: $tool_name"
```

## 🚀 Activating the Hook

**IMPORTANT**: Restart Claude Code for changes to take effect!

```bash
# Exit current session (Ctrl+D or type 'exit')
# Then restart
claude
```

Or use `/hooks` menu to review and apply without full restart.

## 📊 Hook Events You Can Use

### Current: `Stop` - When Claude finishes responding
Already configured! ✅

### Other Available Events:

**PostToolUse** - After any tool is used:
```json
"PostToolUse": [
  {
    "matcher": "Write|Edit",
    "hooks": [{
      "type": "command",
      "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/file-modified.sh"
    }]
  }
]
```

**SubagentStop** - When a subagent finishes:
```json
"SubagentStop": [
  {
    "hooks": [{
      "type": "command",
      "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/subagent-done.sh"
    }]
  }
]
```

## ⚠️ Troubleshooting

### Hook not firing?
1. **Restart Claude Code** - Changes require session restart
2. Check registration: `/hooks` command
3. Verify script is executable: `ls -la .claude/hooks/`

### No notifications?
- **Normal!** Android notifications require Termux:API app
- You'll still see terminal notifications and logs

### Script errors?
```bash
# Test manually with debug output
bash -x ./.claude/hooks/task-complete-notification.sh < test-input.json
```

### Want to disable?
Remove from `.claude/settings.local.json`:
```json
{
  "hooks": {}  // Empty hooks
}
```

## 📚 More Information

- **Hooks Guide**: `.claude/hooks/README.md`
- **Claude Docs**: https://docs.claude.com/en/docs/claude-code/hooks
- **Task Log**: `.claude/logs/task-completions.log`

---

## 🎯 Quick Summary

✅ **Notifications are ACTIVE** (terminal mode)
📱 **Install Termux:API for Android notifications** (optional)
🔄 **Restart Claude Code** to activate
📝 **Check logs** at `.claude/logs/task-completions.log`

**Next Step**: Restart Claude Code session and try it out!

```bash
# Restart Claude
exit
claude
```

Then ask Claude anything - you'll get notified when the task completes! 🎉
