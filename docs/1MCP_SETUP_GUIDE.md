# 1MCP Agent Setup Guide

## What is 1MCP?

1MCP (One MCP) is a unified Model Context Protocol server that **aggregates multiple MCP servers into one**. Instead of configuring 6+ separate MCP servers, you configure ONE server that acts as a proxy to all of them.

## Installation Status: ✅ COMPLETE

### What We've Done

1. ✅ Installed `@1mcp/agent` via npx (no manual installation needed)
2. ✅ Created configuration at `~/AppData/Roaming/1mcp/mcp.json`
3. ✅ Configured 6 backend MCP servers:
   - **filesystem** - File operations in Termux home directory
   - **memory** - Knowledge graph and persistent memory
   - **sequential-thinking** - Step-by-step reasoning
   - **ahrefs** - SEO analytics
   - **ref** - Documentation search
   - **vercel** - Deployment management
4. ✅ Tested stdio mode (required for Claude Code)

## Configuration File

Location: `~/AppData/Roaming/1mcp/mcp.json`

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/data/data/com.termux/files/home"],
      "tags": ["filesystem", "local"],
      "disabled": false
    },
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"],
      "tags": ["memory", "knowledge"],
      "disabled": false
    },
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"],
      "tags": ["reasoning", "thinking"],
      "disabled": false
    },
    "ahrefs": {
      "command": "npx",
      "args": ["-y", "@ahrefs/mcp-server-ahrefs"],
      "tags": ["seo", "analytics"],
      "disabled": false
    },
    "ref": {
      "command": "npx",
      "args": ["-y", "@ref-mcp/server"],
      "tags": ["documentation", "reference"],
      "disabled": false
    },
    "vercel": {
      "command": "node",
      "args": ["/data/data/com.termux/files/home/.claude/mcp-servers/mcp-vercel/dist/index.js"],
      "tags": ["deployment", "hosting"],
      "disabled": false
    }
  }
}
```

## Using 1MCP

### Command Line Usage

```bash
# List all configured servers
npx -y @1mcp/agent mcp list

# Start 1MCP in stdio mode (for Claude Code)
npx -y @1mcp/agent --transport stdio

# Start with filtered servers (by tags)
npx -y @1mcp/agent --transport stdio --filter "filesystem,memory"

# Start HTTP server (for testing)
npx -y @1mcp/agent --transport http --port 3050
```

### Integration with Claude Code

**Option 1: Use `/mcp` command in Claude Code**
```
/mcp add 1mcp-unified npx -y @1mcp/agent --transport stdio
```

**Option 2: Manual Configuration**
If Claude Code uses a config file, add:
```json
{
  "mcpServers": {
    "1mcp-unified": {
      "command": "npx",
      "args": ["-y", "@1mcp/agent", "--transport", "stdio"]
    }
  }
}
```

## Managing MCP Servers

### Add a New Server
```bash
# Edit the config file
nano ~/AppData/Roaming/1mcp/mcp.json

# Add new server entry:
{
  "new-server": {
    "command": "npx",
    "args": ["-y", "@some/mcp-server"],
    "tags": ["tag1", "tag2"],
    "disabled": false
  }
}

# Verify
npx -y @1mcp/agent mcp list
```

### Disable/Enable Servers
```bash
# Using CLI
npx -y @1mcp/agent mcp disable filesystem
npx -y @1mcp/agent mcp enable filesystem

# Or edit config and set "disabled": true/false
```

### Filter Servers by Tags
```bash
# Only run filesystem and memory
npx -y @1mcp/agent --transport stdio --filter "filesystem,memory"

# Only run SEO tools
npx -y @1mcp/agent --transport stdio --filter "seo"
```

## Troubleshooting

### Config Not Found
If you see "Configuration file not found":
```bash
# Verify config exists
cat ~/AppData/Roaming/1mcp/mcp.json

# Or specify config manually
npx -y @1mcp/agent --config ~/AppData/Roaming/1mcp/mcp.json --transport stdio
```

### Server Won't Start
```bash
# Check server configuration
npx -y @1mcp/agent mcp list

# Test individual server
npx -y @modelcontextprotocol/server-memory
```

### View Logs
```bash
# Start with debug logging
npx -y @1mcp/agent --transport stdio --log-level debug --log-file ~/1mcp.log

# View logs
tail -f ~/1mcp.log
```

## Benefits of Using 1MCP

1. **Single Configuration Point**: One server config instead of 6+
2. **Dynamic Filtering**: Enable/disable servers by tags
3. **Unified Interface**: Claude Code talks to one server
4. **Better Resource Management**: 1MCP manages subprocess lifecycle
5. **OAuth Authentication**: Production-ready security (optional)
6. **Tag-based Scoping**: Control which tools are available per request

## Current Status

✅ **Installation**: Complete
✅ **Configuration**: 6 servers configured
✅ **Testing**: Stdio mode working
⏳ **Integration**: Ready for Claude Code integration

## Next Steps

1. Test 1MCP in a new Claude Code session
2. Verify all MCP tools are accessible
3. Add more MCP servers as needed
4. Configure tag-based filtering for specific workflows

---

**Documentation**: https://docs.1mcp.app/
**GitHub**: https://github.com/1mcp-app/agent
**NPM**: https://www.npmjs.com/package/@1mcp/agent
