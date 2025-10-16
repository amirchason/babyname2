# MCP Server Setup Guide

## Current MCP Server Status

### ✅ Active MCP Servers (npm-based, working on Termux/Android)

1. **filesystem** - File system operations
   - **Status**: ✓ Connected
   - **Command**: `npx -y @modelcontextprotocol/server-filesystem /data/data/com.termux/files/home`
   - **Capabilities**: Read/write files, directory operations
   - **No API key required**

2. **memory** - Knowledge graph memory for Claude
   - **Status**: ✓ Connected
   - **Command**: `npx -y @modelcontextprotocol/server-memory`
   - **Capabilities**: Persistent memory across sessions using knowledge graphs
   - **No API key required**

3. **sequential-thinking** - Sequential problem solving
   - **Status**: ✓ Connected
   - **Command**: `npx -y @modelcontextprotocol/server-sequential-thinking`
   - **Capabilities**: Step-by-step reasoning and problem decomposition
   - **No API key required**

4. **vercel** - Vercel deployment management (NEW! 🎉)
   - **Status**: ✓ Connected
   - **Command**: `node /data/data/com.termux/files/home/.claude/mcp-servers/mcp-vercel/build/index.js`
   - **Environment**: `VERCEL_API_TOKEN` (set via `-e` flag)
   - **Capabilities**:
     - Deploy projects to Vercel
     - Manage deployments (list, get details, create)
     - Configure environment variables
     - Manage projects and domains
     - Team management
   - **API key required**: Yes (Vercel API Token)
   - **Documentation**: See `VERCEL_MCP_GUIDE.md`
   - **Source**: https://github.com/nganiet/mcp-vercel

### ❌ Previously Configured (Not Working on Termux/Android)

1. **chrome-devtools** (in `~/.config/claude-cli/mcp_settings.json`)
   - **Status**: ❌ Not compatible
   - **Reason**: Requires Chrome browser (not available in Termux)
   - **Alternative**: Use playwright MCP if available

## Platform Limitations (Termux/Android)

### What DOES Work ✅
- **npm-based MCP servers** using `npx` (Node.js is installed)
- Any MCP server that runs in pure JavaScript/Node.js environment

### What DOESN'T Work ❌
- **Python-based MCP servers** requiring `uv`/`uvx` (not available for Android)
- **Python MCP servers via pip** (build dependencies fail on Android)
- **Chrome/Chromium-based MCPs** (browser not accessible in Termux)
- **Bun-based MCP servers** (Bun not installed)

## Available npm-based MCP Servers

### Official @modelcontextprotocol packages (Working on Termux):

- ✅ `@modelcontextprotocol/server-filesystem` - File operations
- ✅ `@modelcontextprotocol/server-memory` - Knowledge graph memory
- ✅ `@modelcontextprotocol/server-sequential-thinking` - Reasoning
- ✅ `@modelcontextprotocol/server-everything` - Test/demo server with all MCP features

### Requires API Keys (Working on Termux):

- `@modelcontextprotocol/server-brave-search` - Web search (requires Brave API key)
- `@modelcontextprotocol/server-github` - GitHub integration (requires PAT)
- Various community MCP servers

## How to Add MCP Servers

### Basic Syntax
```bash
claude mcp add <name> <command> -- [args...]
```

**Note**: Use `--` separator before args with `-` flags to prevent them from being parsed as claude options.

### Examples

#### Add Brave Search (requires API key):
```bash
claude mcp add brave-search npx -- -y @modelcontextprotocol/server-brave-search
# Then set environment variable:
# Add -e BRAVE_API_KEY=your_key_here
```

Or with environment variable:
```bash
claude mcp add brave-search npx -e BRAVE_API_KEY=your_key -- -y @modelcontextprotocol/server-brave-search
```

#### Add Everything server (test/demo):
```bash
claude mcp add everything npx -- -y @modelcontextprotocol/server-everything
```

### Managing MCP Servers

```bash
# List all servers and their status
claude mcp list

# Get details for a specific server
claude mcp get <server-name>

# Remove a server
claude mcp remove <server-name> -s local  # or -s user, -s project
```

### Configuration Scopes

- **Local**: Private to you in current project (default)
- **User**: Available across all your projects
- **Project**: Shared with team via `.mcp.json` in repo

## How to Get API Keys

### Brave Search API
1. Go to https://brave.com/search/api/
2. Sign up for free tier (2,000 queries/month)
3. Generate API key from dashboard
4. Add with: `claude mcp add brave-search npx -e BRAVE_API_KEY=your_key -- -y @modelcontextprotocol/server-brave-search`

### GitHub Personal Access Token
1. Go to https://github.com/settings/tokens
2. Generate new token (classic)
3. Select scopes: `repo`, `read:org`, `read:user`
4. Add with: `claude mcp add github npx -e GITHUB_TOKEN=your_token -- -y @modelcontextprotocol/server-github`

## Community MCP Servers

Explore more at:
- https://github.com/punkpeye/awesome-mcp-servers
- https://mcpservers.org/
- https://www.npmjs.com/search?q=mcp-server

**Filter for npm-based servers** that don't require Chrome/browsers for Termux compatibility.

## Accessing MCP Tools in Claude Code

Once MCP servers are added and connected:
- Tools are automatically available with `mcp__` prefix (e.g., `mcp__filesystem_read`)
- Resources can be referenced with @ mentions
- Prompts become available as slash commands

**Note**: In this current session, you may need to restart Claude Code for new MCPs to be fully accessible.

## Troubleshooting

### MCP server not connecting
```bash
# Check status
claude mcp list

# View detailed error
claude mcp get <server-name>

# Remove and re-add
claude mcp remove <server-name> -s local
claude mcp add <server-name> <command> -- <args>
```

### Python MCPs failing
- **Solution**: Use npm-based alternatives instead
- Python MCPs don't work on Android/Termux due to build dependency issues

### Chrome-based MCPs failing
- **Solution**: Look for playwright or other automation alternatives
- Chrome browser is not accessible from Termux terminal

## How to Setup Vercel MCP (Step-by-Step)

### Prerequisites
- Node.js v20+ ✅ (You have v22.20.0)
- Vercel account
- Vercel API Token

### Installation Steps

1. **Get Vercel API Token**:
   ```
   Go to: https://vercel.com/account/tokens
   Click "Create Token"
   Name: Claude Code MCP
   Copy the token
   ```

2. **Clone and Install**:
   ```bash
   mkdir -p ~/.claude/mcp-servers
   cd ~/.claude/mcp-servers
   git clone https://github.com/nganiet/mcp-vercel.git
   cd mcp-vercel
   npm install
   npm run build
   ```

3. **Add to Claude MCP**:
   ```bash
   claude mcp add vercel node -e VERCEL_API_TOKEN=your_token_here -- /data/data/com.termux/files/home/.claude/mcp-servers/mcp-vercel/build/index.js
   ```

4. **Verify Connection**:
   ```bash
   claude mcp list
   ```
   You should see: `vercel: ... - ✓ Connected`

5. **Usage**:
   See `VERCEL_MCP_GUIDE.md` for complete documentation of available tools and commands.

---

## Next Steps

1. **Use Vercel MCP** to deploy your apps directly from Claude Code!
2. **Get Brave Search API key** for web search capabilities
3. **Explore community MCPs** at awesome-mcp-servers
4. **Test current MCPs** by restarting Claude Code session
5. **Document** any additional MCPs you add here

---

**Last updated**: 2025-10-15
**Platform**: Termux on Android (aarch64-linux-android)
**Node.js**: v22.20.0
**Python**: 3.12.11 (pip available, but Python MCPs incompatible)
**Active MCPs**: 4 (filesystem, memory, sequential-thinking, vercel)
