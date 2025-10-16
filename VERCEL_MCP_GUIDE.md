# Vercel MCP Integration Guide

## ✅ Status: Connected & Ready!

Your Vercel MCP server is now active and connected to Claude Code!

---

## 🎯 What You Can Do Now

With Vercel MCP connected, you can manage your Vercel deployments directly from Claude Code chat. No more manual CLI commands!

---

## 📋 Available Vercel MCP Tools

### Deployment Management

#### 1. **List All Deployments**
```
Tool: vercel-list-all-deployments
```
**What it does:** Lists all your Vercel deployments
**Parameters:**
- `limit` (optional): Number of deployments to list (default: 10)
- `target` (optional): Filter by "production" or "preview"

**Example usage:**
"Show me my last 5 production deployments"

---

#### 2. **Get Deployment Details**
```
Tool: vercel-get-deployment
```
**What it does:** Gets detailed information about a specific deployment
**Parameters:**
- `deploymentId`: The deployment ID or URL

**Example usage:**
"Get details for deployment xyz123"

---

#### 3. **List Deployment Files**
```
Tool: vercel-list-deployment-files
```
**What it does:** Lists all files in a specific deployment
**Parameters:**
- `deploymentId`: The deployment ID or URL

**Example usage:**
"Show me the files in my latest deployment"

---

#### 4. **Create Deployment**
```
Tool: vercel-create-deployment
```
**What it does:** Creates a new deployment
**Parameters:**
- `projectName`: Your project name
- `files`: Files to deploy
- Additional configuration

**Example usage:**
"Deploy my soulseed project"

---

### Project Management

#### 5. **List Projects**
```
Tool: vercel-list-projects
```
**What it does:** Lists all your Vercel projects
**Parameters:** None

**Example usage:**
"Show me all my Vercel projects"

---

#### 6. **Find Project**
```
Tool: vercel-find-project
```
**What it does:** Finds a specific project by name
**Parameters:**
- `projectName`: Name of the project to find

**Example usage:**
"Find my soulseed project"

---

#### 7. **Create Project**
```
Tool: vercel-create-project
```
**What it does:** Creates a new Vercel project
**Parameters:**
- `name`: Project name
- `framework`: Framework type (e.g., "create-react-app")
- Additional configuration

**Example usage:**
"Create a new Vercel project called myapp"

---

#### 8. **Get Project Domain**
```
Tool: vercel-get-project-domain
```
**What it does:** Gets the domain(s) for a project
**Parameters:**
- `projectName`: Name of the project

**Example usage:**
"What's the domain for my soulseed project?"

---

### Environment Variables

#### 9. **Create Environment Variables**
```
Tool: vercel-create-environment-variables
```
**What it does:** Adds environment variables to a project
**Parameters:**
- `projectId`: Project ID or name
- `variables`: Array of {key, value, target} objects
- `target`: "production", "preview", "development"

**Example usage:**
"Add these environment variables to my soulseed project"

**This is PERFECT for adding your 11 env variables!** ✨

---

#### 10. **Get Environments**
```
Tool: vercel-get-environments
```
**What it does:** Lists all environment variables for a project
**Parameters:**
- `projectId`: Project ID or name

**Example usage:**
"Show me all environment variables for soulseed"

---

#### 11. **Create Custom Environment**
```
Tool: vercel-create-custom-environment
```
**What it does:** Creates a custom environment (e.g., staging)
**Parameters:**
- `projectId`: Project ID
- `name`: Environment name

**Example usage:**
"Create a staging environment for my project"

---

### Team Management

#### 12. **List All Teams**
```
Tool: vercel-list-all-teams
```
**What it does:** Lists all teams you're part of
**Parameters:** None

**Example usage:**
"Show me my Vercel teams"

---

#### 13. **Create Team**
```
Tool: vercel-create-team
```
**What it does:** Creates a new Vercel team
**Parameters:**
- `name`: Team name
- `slug`: Team slug (URL-friendly name)

**Example usage:**
"Create a new team called MyCompany"

---

## 🚀 Common Use Cases

### Deploying Your SoulSeed App

**Instead of:**
```bash
vercel --prod
```

**Now just say:**
```
"Deploy my soulseed project to production"
```

---

### Adding Environment Variables

**Instead of manually adding 11 variables in the dashboard:**

**Now just say:**
```
"Add these environment variables to my soulseed project:
- REACT_APP_FIREBASE_API_KEY=AIzaSyDbNCgZiXe4d_dFAXNMVclSD3AryoUUI70
- REACT_APP_FIREBASE_AUTH_DOMAIN=babynames-app-9fa2a.firebaseapp.com
... (all 11 variables)
"
```

I'll use the `vercel-create-environment-variables` tool to add them all at once! ✨

---

### Checking Deployment Status

**Instead of:**
```bash
vercel ls
```

**Now just say:**
```
"Show me my recent Vercel deployments"
```

---

### Getting Project Info

**Instead of:**
```bash
vercel project ls
```

**Now just say:**
```
"List all my Vercel projects"
```

---

## 💡 Example Conversations

### Example 1: Full Deployment Workflow

**You:** "Deploy my soulseed app to Vercel"

**Claude:** *Uses vercel-create-deployment tool*
"✅ Deployment started! URL: https://soulseed-xyz.vercel.app"

**You:** "Did it succeed?"

**Claude:** *Uses vercel-get-deployment tool*
"✅ Deployment successful! Build completed in 2m 34s"

---

### Example 2: Environment Variables Setup

**You:** "Add all my environment variables from VERCEL_ENV_VARIABLES.txt to my soulseed project"

**Claude:** *Reads the file, uses vercel-create-environment-variables tool*
"✅ Added all 11 environment variables to soulseed (Production, Preview, Development)"

**You:** "Verify they're all there"

**Claude:** *Uses vercel-get-environments tool*
"✅ Confirmed: All 11 variables are set correctly"

---

### Example 3: Deployment Monitoring

**You:** "Show me my last 10 deployments"

**Claude:** *Uses vercel-list-all-deployments tool*
"Here are your last 10 deployments: [lists deployments with status, URLs, dates]"

**You:** "What files are in the latest one?"

**Claude:** *Uses vercel-list-deployment-files tool*
"Your latest deployment contains: [lists all deployed files]"

---

## 🔧 Advanced Usage

### Deploying with Custom Configuration

You can ask Claude to:
- Deploy to specific branches
- Set custom environment variables per deployment
- Configure build settings
- Manage multiple projects
- Set up custom domains

### Batch Operations

You can ask Claude to:
- Add multiple environment variables at once
- Deploy multiple projects in sequence
- Check status of all projects
- List all deployments across all projects

---

## 📊 MCP Server Status

Check server status anytime:
```bash
claude mcp list
```

You should see:
```
vercel: node /data/data/com.termux/files/home/.claude/mcp-servers/mcp-vercel/build/index.js - ✓ Connected
```

---

## 🛠️ Troubleshooting

### Server Not Connected

If `claude mcp list` shows Vercel as disconnected:

1. **Check server details:**
```bash
claude mcp get vercel
```

2. **Restart Claude Code** (close and reopen)

3. **Re-add if needed:**
```bash
claude mcp remove vercel -s local
claude mcp add vercel node -e VERCEL_API_TOKEN=nGWS3gPqTavpTOOuBuDgLtdY -- /data/data/com.termux/files/home/.claude/mcp-servers/mcp-vercel/build/index.js
```

---

### Tools Not Showing Up

The tools are accessed via MCP protocol. When you ask Claude to do something Vercel-related, Claude automatically uses the appropriate tool.

**You don't see them as commands** - just ask Claude naturally!

---

## 🔒 Security Note

Your Vercel API token (`nGWS3gPqTavpTOOuBuDgLtdY`) is stored securely in:
- `/data/data/com.termux/files/home/.claude.json`

**Never commit this file to Git or share it publicly!**

---

## 📚 Next Steps

### Immediate: Deploy Your App!

Now that Vercel MCP is set up, you can:

1. **Add environment variables** (all 11 at once!)
2. **Deploy your app** with a simple message
3. **Monitor deployments** from chat
4. **Manage domains** easily

### Try It Now:

Say: **"Add all environment variables from VERCEL_ENV_VARIABLES.txt to my soulseed Vercel project"**

Claude will:
1. Read the file
2. Parse all 11 variables
3. Use the `vercel-create-environment-variables` tool
4. Add them all to your project
5. Verify they're set correctly

Then say: **"Deploy soulseed to production"**

And you're done! 🎉

---

## 📖 Additional Resources

- **Vercel MCP GitHub**: https://github.com/nganiet/mcp-vercel
- **Vercel API Docs**: https://vercel.com/docs/rest-api
- **MCP Documentation**: https://modelcontextprotocol.io/

---

## ✨ Summary

**Before Vercel MCP:**
- Manual `vercel` commands
- Copy/paste env variables in browser
- Check deployments in dashboard
- Navigate Vercel UI manually

**After Vercel MCP:**
- ✅ "Deploy my app" → Done!
- ✅ "Add these 11 env variables" → Done!
- ✅ "Show my deployments" → Done!
- ✅ "Check build status" → Done!

**All from this chat!** 🚀

---

*Last updated: 2025-10-15*
*Vercel MCP Version: 1.0.0*
*Status: ✓ Connected*
