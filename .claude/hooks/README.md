# Claude Code Hooks - Task Completion Notifications

## Overview

This project uses Claude Code hooks to send Android notifications when Claude finishes tasks.

## Current Hooks

### ✅ Task Completion Notification (`Stop` Hook)

**File**: `task-complete-notification.sh`

**Triggers**: When Claude finishes responding to your request

**What it does**:
- Sends an Android notification with title "✅ Claude Task Complete"
- Shows timestamp of completion
- Plays notification sound
- Vibrates the device
- Shows a quick toast message

**Configuration**: Registered in `.claude/settings.local.json` under `hooks.Stop`

## How It Works

1. **Hook Event**: When Claude finishes a task, the `Stop` event fires
2. **Script Execution**: `task-complete-notification.sh` runs automatically
3. **JSON Input**: Receives session info via stdin
4. **Notification**: Sends Android notification via `termux-notification`
5. **Toast**: Shows quick toast message via `termux-toast`

## Testing the Hook

To test if the hook is working:

1. Ask Claude to do something simple: `"What is 2+2?"`
2. Wait for Claude to respond
3. You should see:
   - Android notification: "✅ Claude Task Complete"
   - Toast message at bottom of screen

## Customizing Notifications

Edit `task-complete-notification.sh` to customize:

### Change Notification Title
```bash
--title "Your Custom Title"
```

### Change Notification Content
```bash
--content "Your custom message - completed at $timestamp"
```

### Disable Sound
Remove or comment out:
```bash
--sound
```

### Disable Vibration
Remove or comment out:
```bash
--vibrate "100,100"
```

### Change Vibration Pattern
Format: `"duration1,pause1,duration2,pause2,..."`
```bash
--vibrate "200,100,200"  # Two vibrations
```

### Disable Toast
Comment out:
```bash
# termux-toast "✅ Claude task complete" -s
```

### Change Priority
Options: `default`, `high`, `low`, `min`, `max`
```bash
--priority low  # Less intrusive
```

## Available Hook Events

You can create hooks for other events too:

### `PostToolUse` - After any tool is used
```json
"PostToolUse": [
  {
    "matcher": "Write|Edit",
    "hooks": [
      {
        "type": "command",
        "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/file-modified-notification.sh"
      }
    ]
  }
]
```

### `PreToolUse` - Before a tool is used
```json
"PreToolUse": [
  {
    "matcher": "Bash",
    "hooks": [
      {
        "type": "command",
        "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/bash-warning.sh"
      }
    ]
  }
]
```

### `SubagentStop` - When a subagent finishes
```json
"SubagentStop": [
  {
    "hooks": [
      {
        "type": "command",
        "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/subagent-complete.sh"
      }
    ]
  }
]
```

## Example: File Change Notification

Create `file-modified-notification.sh`:

```bash
#!/data/data/com.termux/files/usr/bin/bash

input=$(cat)
file_path=$(echo "$input" | jq -r '.tool_input.file_path // "unknown"')
tool_name=$(echo "$input" | jq -r '.tool_name // "unknown"')

termux-notification \
    --title "📝 File Modified" \
    --content "$tool_name: $file_path" \
    --priority low

exit 0
```

Register in settings:
```json
"PostToolUse": [
  {
    "matcher": "Write|Edit",
    "hooks": [
      {
        "type": "command",
        "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/file-modified-notification.sh"
      }
    ]
  }
]
```

## Troubleshooting

### Hook not firing?

1. **Check registration**: Run `/hooks` in Claude Code to see active hooks
2. **Restart session**: Exit and restart Claude Code for changes to take effect
3. **Check script permissions**: `chmod +x .claude/hooks/*.sh`
4. **Test script manually**:
   ```bash
   echo '{"session_id":"test","hook_event_name":"Stop"}' | ./.claude/hooks/task-complete-notification.sh
   ```

### Notifications not showing?

1. **Check Termux permissions**: Go to Android Settings → Apps → Termux → Permissions
2. **Enable notifications**: Settings → Apps → Termux → Notifications → Enable
3. **Test termux-notification**:
   ```bash
   termux-notification --title "Test" --content "Testing"
   ```

### Script errors?

1. **Enable debug mode**: Start Claude with `claude --debug`
2. **Check stderr**: Errors are logged to debug output
3. **Verify jq is installed**: `which jq`
4. **Check JSON syntax**: Use `jq` to validate hook input

## Session Restart Required

**IMPORTANT**: Hook changes require a Claude Code session restart:

1. Exit current Claude Code session
2. Restart: `claude` or `claude --resume`
3. Changes will now be active

Or use `/hooks` menu to review and apply changes without full restart.

## Preventing Infinite Loops

The script checks `stop_hook_active` to prevent infinite notification loops:

```bash
stop_hook_active=$(echo "$input" | jq -r '.stop_hook_active // false')

if [ "$stop_hook_active" = "true" ]; then
    exit 0
fi
```

This prevents the hook from triggering itself repeatedly.

## More Examples

See Claude Code documentation for more hook examples:
- https://docs.claude.com/en/docs/claude-code/hooks-guide
- https://docs.claude.com/en/docs/claude-code/hooks

## Security Note

**USE AT YOUR OWN RISK**: Hooks execute shell commands automatically. Only use trusted scripts and review any hook commands before adding them.

---

*For more information about Claude Code hooks, see the official documentation.*
