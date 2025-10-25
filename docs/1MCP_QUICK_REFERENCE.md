# 1MCP Quick Reference

## Installation Status: ✅ COMPLETE

**Version**: 0.25.4
**Config**: `~/AppData/Roaming/1mcp/mcp.json`
**Servers**: 6 configured (all enabled)

## Most Common Commands

```bash
# List all configured servers
npx -y @1mcp/agent mcp list

# Start 1MCP (stdio mode for Claude Code)
npx -y @1mcp/agent --transport stdio

# Start with filtered servers
npx -y @1mcp/agent --transport stdio --filter "filesystem,memory"

# Check version
npx -y @1mcp/agent --version

# View help
npx -y @1mcp/agent --help
```

## Configured Servers

| Server | Tags | Purpose |
|--------|------|---------|
| **filesystem** | filesystem, local | File operations in Termux |
| **memory** | memory, knowledge | Knowledge graph storage |
| **sequential-thinking** | reasoning, thinking | Step-by-step reasoning |
| **ahrefs** | seo, analytics | SEO analytics |
| **ref** | documentation, reference | Documentation search |
| **vercel** | deployment, hosting | Vercel deployment |

## Add to Claude Code

```bash
# Option 1: Via /mcp command
/mcp add 1mcp-unified npx -y @1mcp/agent --transport stdio

# Option 2: Direct command
npx -y @1mcp/agent --transport stdio
```

## Quick Config Edit

```bash
# Edit config
nano ~/AppData/Roaming/1mcp/mcp.json

# Verify changes
npx -y @1mcp/agent mcp list
```

## Troubleshooting

```bash
# Test integration
~/test-1mcp-integration.sh

# Debug mode
npx -y @1mcp/agent --transport stdio --log-level debug

# Check if config exists
cat ~/AppData/Roaming/1mcp/mcp.json
```

## Tag Filtering Examples

```bash
# Only filesystem tools
npx -y @1mcp/agent --filter "filesystem"

# Development tools (filesystem + memory)
npx -y @1mcp/agent --filter "filesystem,memory"

# SEO analysis tools
npx -y @1mcp/agent --filter "seo,analytics"

# Deployment tools
npx -y @1mcp/agent --filter "deployment"
```

## Full Documentation

📚 **Detailed Guide**: `~/proj/babyname2/docs/1MCP_SETUP_GUIDE.md`
🌐 **Official Docs**: https://docs.1mcp.app/
🔧 **GitHub**: https://github.com/1mcp-app/agent
