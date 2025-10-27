#!/bin/bash
# Batch add SEOHead component to remaining pages

# Define pages with their SEO data
# Format: "filename|title|description|canonical"

declare -A pages=(
  ["ContactPage.tsx"]="Contact Us | SoulSeed Baby Names|Get in touch with the SoulSeed team. We're here to help with questions, feedback, or support for your baby naming journey.|https://soulseedbaby.com/contact"
  ["CookiePolicyPage.tsx"]="Cookie Policy | SoulSeed|Learn how SoulSeed uses cookies to improve your experience, personalize content, and remember your preferences while browsing baby names.|https://soulseedbaby.com/cookie-policy"
  ["DebugPage.tsx"]="Debug Tools | SoulSeed|Developer debug tools and diagnostics for SoulSeed application.|https://soulseedbaby.com/debug|noindex"
  ["DislikesPage.tsx"]="Disliked Names | SoulSeed|View and manage your disliked baby names. Change your mind? Easily restore names back to your browsing list.|https://soulseedbaby.com/dislikes"
  ["HomePage.tsx"]="SoulSeed - Find Your Baby's Perfect Name | 174K+ Names|Discover meaningful baby names with AI-powered suggestions. Swipe through 174,000+ names from diverse cultures with instant cloud sync.|https://soulseedbaby.com"
  ["NameRingTestPage.tsx"]="Name Ring Test | SoulSeed|Test page for name ring visualization feature.|https://soulseedbaby.com/name-ring-test|noindex"
  ["PrivacyPolicyPage.tsx"]="Privacy Policy | SoulSeed Baby Names|Your privacy matters. Read how SoulSeed collects, uses, and protects your data while helping you find the perfect baby name.|https://soulseedbaby.com/privacy-policy"
  ["SearchResultsPage.tsx"]="Search Results | SoulSeed Baby Names|Browse search results for baby names. Filter by gender, origin, meaning, and popularity to find your perfect match.|https://soulseedbaby.com/search"
  ["SitemapPage.tsx"]="Sitemap | SoulSeed Baby Names|Complete sitemap of SoulSeed baby name resources, including name lists, blog articles, and tools to help you choose the perfect name.|https://soulseedbaby.com/sitemap"
  ["TermsOfServicePage.tsx"]="Terms of Service | SoulSeed|Read our terms of service to understand your rights and responsibilities when using SoulSeed to search for baby names.|https://soulseedbaby.com/terms-of-service"
  ["UpdateBlogPage.tsx"]="Update Blog | SoulSeed|Admin tool for updating blog content.|https://soulseedbaby.com/update-blog|noindex"
  ["VotesListPage.tsx"]="Name Votes | SoulSeed Baby Names|View and participate in baby name voting sessions. Share your opinions and see what names are popular with other parents.|https://soulseedbaby.com/votes"
)

cd /data/data/com.termux/files/home/proj/babyname2/src/pages

for file in "${!pages[@]}"; do
  echo "Processing $file..."

  IFS='|' read -r title description canonical noindex_flag <<< "${pages[$file]}"

  # Check if file exists
  if [ ! -f "$file" ]; then
    echo "  ⚠ File not found: $file"
    continue
  fi

  # Check if SEOHead already added
  if grep -q "import SEOHead" "$file"; then
    echo "  ✓ Already has SEOHead"
    continue
  fi

  # Create temp file
  temp_file=$(mktemp)

  # Process the file
  added_import=false
  added_component=false

  while IFS= read -r line; do
    # Add import after other imports
    if [[ "$line" == import* ]] && [ "$added_import" = false ]; then
      echo "$line" >> "$temp_file"
      # Check if this is the last import
      next_line=""
      read -r next_line
      if [[ ! "$next_line" == import* ]] && [[ ! "$next_line" == "" ]]; then
        echo "import SEOHead from '../components/SEO/SEOHead';" >> "$temp_file"
        echo "" >> "$temp_file"
        added_import=true
      fi
      echo "$next_line" >> "$temp_file"
      continue
    fi

    # Add SEOHead component after return statement
    if [[ "$line" =~ ^[[:space:]]*return[[:space:]]*\( ]] && [ "$added_component" = false ]; then
      echo "  return (" >> "$temp_file"
      echo "    <>" >> "$temp_file"
      if [ "$noindex_flag" = "noindex" ]; then
        echo "      <SEOHead" >> "$temp_file"
        echo "        title=\"$title\"" >> "$temp_file"
        echo "        description=\"$description\"" >> "$temp_file"
        echo "        canonical=\"$canonical\"" >> "$temp_file"
        echo "        noindex={true}" >> "$temp_file"
        echo "      />" >> "$temp_file"
      else
        echo "      <SEOHead" >> "$temp_file"
        echo "        title=\"$title\"" >> "$temp_file"
        echo "        description=\"$description\"" >> "$temp_file"
        echo "        canonical=\"$canonical\"" >> "$temp_file"
        echo "      />" >> "$temp_file"
      fi
      added_component=true
      continue
    fi

    # Update closing tag before final )
    if [[ "$line" =~ ^[[:space:]]*\)\;[[:space:]]*$ ]] && [ "$added_component" = true ]; then
      # Check if we need to close the fragment
      echo "    </>" >> "$temp_file"
      echo "  );" >> "$temp_file"
      continue
    fi

    echo "$line" >> "$temp_file"
  done < "$file"

  # Replace original file
  if [ "$added_import" = true ] && [ "$added_component" = true ]; then
    mv "$temp_file" "$file"
    echo "  ✓ Added SEOHead successfully"
  else
    rm "$temp_file"
    echo "  ⚠ Could not add SEOHead automatically (manual intervention needed)"
  fi
done

echo ""
echo "✓ Script completed!"
echo "Check files manually if any warnings appeared."
