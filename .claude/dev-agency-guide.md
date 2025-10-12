# Development Agency Guide
**Using Claude Code's Multi-Agent System for BabyNames App v2**

---

## Overview

You now have a **full-stack development agency** powered by AI agents that:
- ✅ Listens to your prompts
- ✅ Breaks down complex tasks
- ✅ Delegates to specialized agents
- ✅ Ensures all agents use Ref MCP for documentation
- ✅ Coordinates multi-agent workflows
- ✅ Tracks progress automatically

---

## Your Development Team

### Orchestrators
- **babyname2-orchestrator** (project-specific) - Knows React 19, Firebase, Tailwind stack
- **product_manager** (general) - Works across any project

### Specialized Agents
- **frontend-developer** - React, Next.js, UI components
- **developer** - General backend, APIs, services
- **qa-engineer** - Testing and quality assurance
- **deployment-specialist** - CI/CD, GitHub Pages
- **ml-ai-specialist** - OpenAI, Gemini integration
- **ux-ui-designer** - Design systems, accessibility
- **pipeline-architect** - Build systems, architecture
- **audio-processor** - Audio/media processing
- **agent_creator** - Creates new specialized agents

---

## How to Use Your Dev Agency

### Option 1: Automatic Delegation (Recommended)

Just describe what you want naturally - the orchestrator detects and routes automatically:

```
You: "Add a share button to the favorites page"

→ babyname2-orchestrator analyzes
→ Researches with Ref MCP: "Web Share API React", "Firebase Dynamic Links"
→ Delegates to frontend-developer
→ frontend-developer uses Ref MCP for React 19 patterns
→ Implements and tests
```

**Example prompts that trigger automatic delegation:**

```
✅ "Add dark mode to the app"
✅ "Fix the TypeScript errors in NameCard"
✅ "Implement export favorites as PDF"
✅ "Optimize the name search performance"
✅ "Add email sharing for favorite lists"
✅ "Create a statistics dashboard"
```

### Option 2: Explicit Agent Invocation

Directly request a specific agent when you know who should handle it:

```bash
# Request orchestrator explicitly
"Use the babyname2-orchestrator to plan the social sharing feature"

# Request specific specialist
"Use the frontend-developer to build the dark mode toggle"
"Use the qa-engineer to test the Firebase authentication flow"
"Use the deployment-specialist to set up staging environment"
```

### Option 3: Multi-Agent Coordination

For complex features requiring multiple agents:

```
You: "I need to add user profile photos with upload, storage, and display"

Orchestrator breaks down:
1. frontend-developer: Upload UI with drag-drop
2. developer: Firebase Storage integration
3. qa-engineer: Test upload flow and edge cases
4. deployment-specialist: Update storage security rules
```

---

## Common Scenarios & Agent Patterns

### 🎨 Scenario 1: New UI Component

**User Request:**
```
"Add a filter sidebar with checkboxes for origin, gender, and length"
```

**What Happens:**
1. **babyname2-orchestrator** activates
2. Searches Ref MCP: "React 19 sidebar component patterns", "Tailwind sidebar responsive"
3. Creates TodoWrite task list
4. Delegates to **frontend-developer**
5. frontend-developer uses Ref MCP for implementation details
6. Tests with Chrome DevTools MCP
7. Reports completion

**You see:**
```
🔍 Researching React 19 sidebar patterns with Ref MCP...
📋 Creating task breakdown...
👤 Delegating to frontend-developer...
✅ FilterSidebar.tsx created
✅ Integrated with filter context
✅ Tested responsive behavior
```

---

### 🔧 Scenario 2: Bug Fix

**User Request:**
```
"Firebase auth is broken after the latest update"
```

**What Happens:**
1. **babyname2-orchestrator** activates
2. Searches Ref MCP: "Firebase Auth v12 breaking changes", "React 19 Firebase compatibility"
3. Identifies root cause from documentation
4. Delegates to **developer** with Ref MCP findings
5. developer implements fix from official docs
6. **qa-engineer** tests authentication flow

**You see:**
```
🔍 Researching Firebase Auth v12 changes...
📚 Found: Firebase UID vs OAuth ID issue
👤 Delegating to developer with documentation...
✅ Fixed AuthContext.tsx line 256
✅ QA tested login/logout flow
✅ Verified cloud sync works
```

---

### 🚀 Scenario 3: New Feature (Multi-Agent)

**User Request:**
```
"Add email sharing for favorite name lists"
```

**What Happens:**
1. **babyname2-orchestrator** breaks down feature:
   - Email composition UI
   - Share link generation
   - Email sending service
   - Testing across devices

2. Parallel delegation:
   - **frontend-developer**: Email share modal UI
   - **developer**: Share link generator + email service
   - **qa-engineer**: Test email templates and links

3. Integration:
   - Orchestrator coordinates handoffs
   - Tracks progress with TodoWrite
   - Validates complete flow

**You see:**
```
🔍 Researching email sharing patterns...
📋 Task breakdown:
   1. Email share modal UI
   2. Share link generator
   3. Email sending service
   4. Testing and validation

👥 Delegating to multiple agents in parallel...

frontend-developer:
  ✅ EmailShareModal.tsx created
  ✅ Styled with Tailwind
  ✅ Framer Motion animations

developer:
  ✅ ShareLinkService.ts implemented
  ✅ Email template created
  ✅ SendGrid integration

qa-engineer:
  ✅ Tested email delivery
  ✅ Verified share links work
  ✅ Checked mobile compatibility

✅ Feature complete and tested
```

---

### 📊 Scenario 4: Performance Optimization

**User Request:**
```
"The app is slow when loading all 174k names"
```

**What Happens:**
1. **babyname2-orchestrator** analyzes
2. Searches Ref MCP: "React 19 performance optimization", "virtual scrolling large lists"
3. Identifies optimization opportunities
4. Delegates:
   - **frontend-developer**: Implement React Window for virtualization
   - **developer**: Optimize chunkedDatabaseService loading
   - **qa-engineer**: Performance benchmarking

**You see:**
```
🔍 Analyzing performance bottlenecks...
📚 Ref MCP: React 19 virtualization patterns
📋 Optimization strategy:
   1. Implement virtual scrolling
   2. Lazy load data chunks
   3. Memoize expensive calculations

👥 Coordinating optimization team...
✅ Virtual scrolling implemented
✅ Reduced initial load by 60%
✅ Smooth scrolling with 174k items
```

---

## Advanced Usage

### Create Custom Agent for Specific Need

```
You: "I need an agent that specializes in Firebase Security Rules"

→ agent_creator agent activates
→ Creates firebase-security-specialist.md
→ Configures with Ref MCP access for Firebase docs
→ Agent now available for security rule tasks
```

### Chain Multiple Agents

```
You: "Research, implement, and test Firebase Cloud Functions for name recommendations"

→ Orchestrator chains:
  1. ml-ai-specialist: Research recommendation algorithms
  2. developer: Implement Cloud Functions
  3. frontend-developer: Create UI for recommendations
  4. qa-engineer: Test recommendation accuracy
  5. deployment-specialist: Deploy functions
```

### View Available Agents

```bash
# List all agents
/agents

# Shows:
- Built-in agents
- User-level agents (~/.claude/agents/)
- Project-level agents (.claude/agents/)
```

---

## Ref MCP Integration

**All agents are configured to use Ref MCP** before implementing. This means:

### ✅ Documentation is Always Up-to-Date
Agents search live documentation instead of relying on outdated training data:
- React 19 latest features
- Firebase API changes
- Tailwind CSS new utilities
- Security best practices

### ✅ Accurate Implementations
Agents follow official patterns from documentation:
```
Agent workflow:
1. Search Ref MCP: "React 19 useEffect cleanup"
2. Read official React docs
3. Implement following documented pattern
4. Test implementation
```

### ✅ You Can See the Research
Orchestrator shares what it found:
```
🔍 Ref MCP Search: "Firebase Firestore batch writes"
📚 Found: Firestore supports 500 writes per batch
📚 Found: Use writeBatch() for atomic operations
👤 Delegating to developer with findings...
```

---

## Tips for Best Results

### 1. Be Specific About What You Want
```
❌ "Make the app better"
✅ "Add sorting options to the favorites page (alphabetical, by date added, by popularity)"
```

### 2. Mention Technologies When Relevant
```
❌ "Add authentication"
✅ "Add Google OAuth authentication using Firebase Auth"
```

### 3. Let the Orchestrator Break It Down
```
You: "I want to add a premium subscription feature"

Orchestrator will:
- Research payment APIs (Stripe, PayPal)
- Break into subtasks (UI, backend, testing)
- Delegate to appropriate agents
- Coordinate the implementation
```

### 4. Trust the Ref MCP Process
Agents will search documentation before coding - this takes a bit longer but results in higher quality, up-to-date implementations.

### 5. Use Explicit Invocation for Complex Planning
```
"Use the babyname2-orchestrator to create a detailed plan for implementing offline-first functionality"

→ Orchestrator creates comprehensive plan
→ You review and approve
→ Then agents execute
```

---

## Project-Specific Quick Commands

### Common BabyNames App Tasks

```bash
# Add new filter type
"Add a 'popularity trend' filter using Ref MCP for data visualization patterns"

# Improve AI features
"Enhance the name enrichment with GPT-4 mini using latest OpenAI API patterns"

# Fix known issues
"Fix the Framer Motion TypeScript errors mentioned in CLAUDE.md"

# Performance improvements
"Optimize the swipe card animation performance on mobile"

# New pages
"Create a 'Name History' page showing etymology and historical usage"

# Data features
"Add export favorites to CSV with customizable fields"
```

---

## Monitoring Agent Work

### TodoWrite Integration
Orchestrators use TodoWrite to track multi-step features:

```
📋 Current Tasks:
  🔄 Creating email share modal UI
  ⏳ Implementing share link generator
  ⏳ Testing email delivery

  ✅ Research email sharing patterns
  ✅ Design share modal UI
```

### Progress Updates
You'll see updates as agents work:
```
🔍 Searching Ref MCP for documentation...
📚 Found relevant patterns...
👤 Delegating to frontend-developer...
⚙️ Implementing EmailShareModal.tsx...
✅ Component created
🧪 Testing with Chrome DevTools MCP...
✅ Tests passing
```

---

## Troubleshooting

### Agent Not Activating?
```
# Be explicit
"Use the babyname2-orchestrator to [task]"

# Or check available agents
/agents
```

### Need Different Expertise?
```
# Create custom agent
"Use the agent_creator to make a 'seo-specialist' agent for optimizing meta tags"
```

### Want to See the Plan First?
```
# Request planning only
"Create a detailed plan for implementing social sharing, but don't implement yet"

# Review plan, then:
"Approved, proceed with implementation"
```

---

## Example Full Workflow

**Goal**: Add dark mode to BabyNames App

**Step 1 - Your Request:**
```
"Add dark mode with a toggle button. Use React 19 patterns and Tailwind dark mode."
```

**Step 2 - Orchestrator Activates:**
```
🎯 babyname2-orchestrator analyzing request...

🔍 Ref MCP Research:
   - "Tailwind CSS dark mode implementation guide"
   - "React 19 context API theme management"
   - "localStorage theme persistence patterns"

📋 Task Breakdown (TodoWrite):
   1. Create ThemeContext with React 19
   2. Build DarkModeToggle component
   3. Configure Tailwind dark mode
   4. Add dark: variants to components
   5. Test theme persistence
```

**Step 3 - Agent Delegation:**
```
👤 Delegating to frontend-developer (Step 1)...

frontend-developer:
  🔍 Ref MCP: "React 19 context provider TypeScript"
  ⚙️ Creating src/contexts/ThemeContext.tsx...
  ✅ ThemeContext created with localStorage sync

👤 Delegating to frontend-developer (Step 2)...

frontend-developer:
  🔍 Ref MCP: "Tailwind toggle button dark mode"
  🔍 Ref MCP: "Framer Motion toggle animation"
  ⚙️ Creating src/components/DarkModeToggle.tsx...
  ✅ Toggle component with smooth animation
```

**Step 4 - Configuration:**
```
👤 Delegating to developer (Step 3)...

developer:
  🔍 Ref MCP: "Tailwind CSS v3.4 dark mode configuration"
  ⚙️ Updating tailwind.config.js...
  ✅ Dark mode enabled with 'class' strategy
```

**Step 5 - Integration:**
```
👤 Delegating to frontend-developer (Step 4)...

frontend-developer:
  🔍 Ref MCP: "Tailwind dark mode color scheme best practices"
  ⚙️ Adding dark: variants to components...
  ✅ Updated 25 components with dark mode support
```

**Step 6 - Testing:**
```
👤 Delegating to qa-engineer (Step 5)...

qa-engineer:
  🧪 Testing theme toggle...
  🧪 Testing localStorage persistence...
  🧪 Testing system preference detection...
  ✅ All tests passing
```

**Step 7 - Completion:**
```
✅ Dark mode implementation complete!

Summary:
- ThemeContext with React 19 patterns
- Animated toggle button
- Tailwind dark mode configured
- All components support dark theme
- Theme preference persists
- Tested and verified

Files changed:
- src/contexts/ThemeContext.tsx (new)
- src/components/DarkModeToggle.tsx (new)
- tailwind.config.js (modified)
- 25 component files (dark: variants added)
```

---

## Summary

You now have a **production-ready development agency** that:

1. **Listens** to your natural language requests
2. **Researches** with Ref MCP for accurate, up-to-date documentation
3. **Plans** complex features with task breakdown
4. **Delegates** to specialized agents with proper context
5. **Coordinates** multi-agent workflows
6. **Tracks** progress with TodoWrite
7. **Tests** implementations for quality
8. **Reports** clear completion summaries

### Quick Start
```
# Try it now!
"Use the babyname2-orchestrator to add a 'recently viewed names' feature"
```

The orchestrator will:
- ✅ Research React 19 + localStorage patterns
- ✅ Break down the feature
- ✅ Delegate to frontend-developer
- ✅ Ensure Ref MCP is used for docs
- ✅ Test and validate
- ✅ Report completion

**Your job**: Describe what you want
**Orchestrator's job**: Make it happen with the right agents and documentation

---

*For more information, see:*
- `.claude/agents/babyname2-orchestrator.md` - Project orchestrator details
- `~/.claude/agents/product_manager.md` - General orchestrator
- `CLAUDE.md` - Project documentation
- [Claude Code Subagents Docs](https://docs.claude.com/en/docs/claude-code/sub-agents)
