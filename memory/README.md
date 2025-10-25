# Memory Directory

**Purpose**: Project memory files for quick onboarding and context restoration

**Created**: 2025-10-19

---

## What's in Here?

This directory contains comprehensive documentation about the SoulSeed project, designed to provide quick context for developers, AI assistants, and new team members.

### Files

1. **techspec.md** (773 lines, ~23KB)
   - Complete technical specification
   - Technology stack details
   - Architecture documentation
   - Service architecture
   - Database structure
   - AI/ML integration details
   - Deployment configuration
   - Performance optimizations
   - Known issues and technical debt

2. **history-and-future.md** (848 lines, ~23KB)
   - Project timeline (2024-09 to present)
   - Feature development history
   - Phase-by-phase evolution
   - Current state and metrics
   - Future roadmap (Q4 2025 - Q4 2026)
   - Success metrics and targets
   - Lessons learned

3. **.metadata.json** (~5KB)
   - Structured project metadata
   - Quick reference JSON format
   - URLs, tech stack, metrics
   - Known issues summary
   - Priority matrix
   - Target metrics

4. **README.md** (this file)
   - Directory overview and usage guide

---

## When to Use These Files

### For Onboarding
- **New developers**: Read `techspec.md` to understand architecture
- **AI assistants**: Read both files for full project context
- **Product managers**: Read `history-and-future.md` for roadmap

### For Quick Reference
- **Tech stack questions**: Check `.metadata.json` → techStack
- **Deployment info**: Check `techspec.md` → Deployment section
- **Known issues**: Check `.metadata.json` → knownIssues
- **Roadmap**: Check `history-and-future.md` → Future Roadmap

### For Decision Making
- **Architecture decisions**: Review `techspec.md` → Architecture
- **Priority decisions**: Check `.metadata.json` → priorities
- **Performance targets**: Check `.metadata.json` → metrics.targets

---

## File Organization

```
memory/
├── README.md              # This file (usage guide)
├── techspec.md           # Technical specification (WHAT & HOW)
├── history-and-future.md # Project timeline & roadmap (WHEN & WHY)
└── .metadata.json        # Structured metadata (QUICK REFERENCE)
```

---

## Quick Start Guide

### Scenario 1: "I'm a new developer joining the project"

**Read in this order**:
1. Start with `README.md` (this file) - 5 minutes
2. Read `history-and-future.md` → Current State section - 10 minutes
3. Scan `techspec.md` → Architecture section - 15 minutes
4. Check `.metadata.json` for quick facts - 5 minutes
5. Review `/proj/babyname2/CLAUDE.md` for development guide - 10 minutes

**Total time**: ~45 minutes to full context

### Scenario 2: "I need to fix a bug in the favorites system"

**Read**:
1. `techspec.md` → Service Architecture → favoritesService.ts
2. `techspec.md` → State Management → Favorites System
3. Check `known issues` in `.metadata.json`

**Then**: Check actual code in `src/services/favoritesService.ts`

### Scenario 3: "I'm planning a new feature"

**Read**:
1. `history-and-future.md` → Future Roadmap (see if already planned)
2. `.metadata.json` → priorities (check priority matrix)
3. `techspec.md` → Component Architecture (see where it fits)
4. `history-and-future.md` → Lessons Learned (avoid past mistakes)

### Scenario 4: "I need deployment info"

**Quick reference**:
```bash
# Check .metadata.json
cat .metadata.json | jq '.deployment'

# Or read techspec.md → Deployment & CI/CD section
```

### Scenario 5: "What's the current state of the project?"

**Read**:
1. `.metadata.json` → metrics.current (current stats)
2. `history-and-future.md` → Current State (detailed status)
3. `/proj/babyname2/CONTINUE_FROM_HERE.md` (latest session)

---

## Maintenance

### When to Update

**Update immediately after**:
- Major feature completion
- Architecture changes
- Deployment platform changes
- Database schema changes
- Tech stack upgrades

**Update monthly**:
- Metrics (`.metadata.json` → metrics.current)
- Roadmap progress (`history-and-future.md` → checkboxes)
- Known issues (`techspec.md` → Known Issues)

**Update quarterly**:
- Full review of all three files
- Archive old history
- Update future roadmap
- Refresh success metrics

### How to Update

1. **For techspec.md**:
   - Add new architecture decisions
   - Update tech stack versions
   - Document new services/components
   - Add to Known Issues section

2. **For history-and-future.md**:
   - Add completed features to history
   - Check off roadmap items
   - Update success metrics
   - Add lessons learned

3. **For .metadata.json**:
   - Update version numbers
   - Refresh metrics
   - Update priorities
   - Add/remove known issues

---

## Integration with Other Docs

### Primary Docs (Root Level)
- **CLAUDE.md** - Claude Code development guide
  - References: `memory/techspec.md` for architecture
  - Focus: How to develop with the codebase

- **README.md** - Public-facing project description
  - References: `.metadata.json` for quick facts
  - Focus: Marketing and user-facing info

- **SESSION_LOG.md** - Recent session notes
  - References: `memory/history-and-future.md` for context
  - Focus: Latest changes and current work

### Deployment Docs
- **QUICK_DEPLOY.md** - Vercel deployment quick reference
  - References: `memory/techspec.md` → Deployment section
  - Focus: How to deploy

- **VERCEL_DEPLOYMENT_GUIDE.md** - Complete deployment guide
  - References: `memory/techspec.md` → Vercel config
  - Focus: Complete deployment workflow

### Feature Docs (docs/ directory)
- **docs/LIST_MODES.md** - LIST1 MODE documentation
  - References: `memory/techspec.md` → Component Architecture
  - Focus: Specific feature implementation

- **docs/ADMIN_SCREENSHOT_FEATURE.md** - Screenshot feature
  - References: `memory/techspec.md` → Admin Features
  - Focus: Admin tool documentation

---

## Best Practices

### For Reading
1. **Start with .metadata.json** - Quick overview
2. **Then read relevant sections** - Targeted learning
3. **Cross-reference with code** - Verify documentation
4. **Ask questions** - If something unclear, update docs

### For Writing
1. **Be specific** - Include file paths, line numbers, versions
2. **Use examples** - Code snippets, commands, screenshots
3. **Link sections** - Cross-reference related content
4. **Keep it updated** - Stale docs worse than no docs

### For Maintenance
1. **Update incrementally** - Small frequent updates better than big infrequent ones
2. **Version control** - Commit memory files with related code changes
3. **Review periodically** - Monthly check for accuracy
4. **Archive old content** - Move outdated info to history section

---

## File Format Conventions

### Markdown Headers
```markdown
# Title (H1) - File title only
## Section (H2) - Major sections
### Subsection (H3) - Subsections
#### Detail (H4) - Detailed topics
```

### Code Blocks
```markdown
```bash
# Bash commands
npm run deploy
```

```typescript
// TypeScript code
interface Example { ... }
```

```json
// JSON data
{ "key": "value" }
```
```

### Links
```markdown
[Text](URL) - External links
`code` - Inline code
**bold** - Important terms
*italic* - Emphasis
```

---

## FAQ

**Q: Should I read all three files before starting development?**
A: Not necessarily. Start with `.metadata.json` for quick overview, then read specific sections of `techspec.md` as needed. Full read recommended for major features.

**Q: How often should these files be updated?**
A: After major changes immediately, monthly for metrics, quarterly for full review.

**Q: What if the docs contradict the code?**
A: The code is the source of truth. Update the docs to match. Add a note about what changed.

**Q: Can I add more files to this directory?**
A: Yes, but keep it focused. Consider: Is this long-term documentation or temporary notes? Long-term → memory/, Temporary → docs/

**Q: Should I commit these files to git?**
A: YES! These are essential project documentation. Commit with every related code change.

**Q: Are these files for humans or AI assistants?**
A: BOTH! Written for humans, structured for AI parsing. Best of both worlds.

---

## Size Guidelines

**Current sizes** (2025-10-19):
- techspec.md: 773 lines (~23KB)
- history-and-future.md: 848 lines (~23KB)
- .metadata.json: ~5KB
- Total: ~60KB

**Target sizes**:
- Each markdown file: < 1000 lines
- Total directory: < 100KB

**If files get too large**:
- Split into multiple files (e.g., `techspec-architecture.md`, `techspec-deployment.md`)
- Archive old history (create `history-archive.md`)
- Move detailed docs to `docs/` directory

---

## Contact

**Questions about memory files?**
- Check this README first
- Review the files themselves
- Ask in project Slack/Discord
- File an issue on GitHub

**Want to improve these files?**
- Submit a PR with changes
- Discuss in team meeting
- Update and commit

---

**Created**: 2025-10-19
**Last Updated**: 2025-10-19
**Maintained By**: Project maintainers + AI assistants
**Review Frequency**: Monthly
