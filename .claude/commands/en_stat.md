---
description: Show enrichment status and statistics
---

Read the enrichment cache from localStorage and show statistics here in Claude Code (not in browser).

Steps:
1. Check if file exists: `public/data/nameEnrichment_cache.json` or similar
2. Or read from browser's localStorage by inspecting the running React app's state
3. Parse the enrichment data
4. Calculate and display statistics:
   - Total names in cache
   - Number enriched (has meaning + origin)
   - Percentage complete
   - Recent enrichments (last 5)
   - Top origins distribution
   - Processing rate (if timestamps available)

Display the results HERE in the terminal, not in the browser.
