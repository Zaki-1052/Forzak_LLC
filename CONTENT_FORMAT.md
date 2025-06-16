# Content Format Documentation

This document defines the structure and parsing rules for markdown content files in the Forzak LLC website.

## File Structure

All content files follow this structure:

```markdown
---
title: "Page Title"
layout: page_type
---

# Main Heading

Content sections...

## Section Heading

More content...
```

## Frontmatter Format

YAML frontmatter is delimited by `---` and contains metadata:

```yaml
---
title: "About Us"          # Page title (required)
layout: about              # Layout type (required)
description: "..."         # Meta description (optional)
---
```

## Content Sections by Page Type

### About Page (`about.md`)

#### Main Company Description
- **Location**: First paragraph(s) after `# About Us`
- **Target**: `#about-main-content` container
- **Styling**: Apply `prose` classes with neutral text colors

#### Key Personnel Section
- **Identifier**: Content under `## Key Personnel` heading
- **Format**: 
  ```markdown
  **Full Name** – Job Title
  Biography paragraph(s) continue here...
  
  **Next Person** – Their Title
  Their biography...
  ```
- **Target**: `#personnel-content` container
- **Styling**: Personnel cards with Tailwind classes

### Services Page (`services.md`)

#### Core Values/Principles
- **Identifier**: Lists under section headings
- **Format**: Bullet points with `-` or `*`

#### Service Categories
- **Identifier**: `## Service Name` headings
- **Content**: Descriptions and sub-services

### Investments Page (`investments.md`)

#### Industries List
- **Identifier**: Long bullet point list (>10 items)
- **Format**: Simple list items
- **Target**: `#industries-list` container

## Parsing Rules

### Personnel Extraction
1. Find `## Key Personnel` section
2. Look for `**Name** – Title` pattern
3. Collect following paragraphs until next `**Name**` or section
4. Generate styled cards for each person

### Section Extraction
1. Split content by `##` headings
2. Extract content between headings
3. Apply appropriate styling based on content type

### HTML Generation Rules

#### Typography Classes
- **Paragraphs**: `text-neutral-800 mb-4`
- **Headings**: `text-primary font-bold`
- **Lists**: `space-y-2`

#### Personnel Card Structure
```html
<div class="mb-8 p-6 bg-neutral-50 rounded-lg">
    <h4 class="text-xl font-bold text-primary mb-2">{name}</h4>
    <p class="text-accent-gold font-semibold mb-3">{title}</p>
    <p class="text-neutral-800 leading-relaxed">{bio}</p>
</div>
```

#### Industry Item Structure
```html
<div class="bg-neutral-50 p-4 rounded-lg text-center">
    <p class="text-sm text-neutral-800">{industry}</p>
</div>
```

## Content Mapping Strategy

### About Page Mapping
- **Main Description**: Paragraphs 1-2 after main heading
- **Personnel**: Everything under "Key Personnel" section
- **Ignore**: Services section (belongs on services page)

### Services Page Mapping
- **Main Description**: Content after main heading
- **Service Sections**: Each `##` section becomes a tab
- **Core Values**: Bullet points become icon cards

### Investments Page Mapping
- **Main Description**: Opening paragraphs
- **Industries**: Long bullet list becomes grid cards
- **Service Sections**: Investment service categories

## Error Handling

### Missing Content
- Display loading state while fetching
- Show error message if content fails to load
- Fallback to hardcoded content if needed

### Malformed Content
- Skip malformed personnel entries
- Continue parsing if sections are missing
- Log warnings for debugging

## Implementation Notes

### Caching
- Cache parsed content to avoid re-processing
- Invalidate cache during development
- Consider TTL for production

### Performance
- Lazy load content when page loads
- Parse content incrementally
- Minimize DOM manipulation

### Accessibility
- Ensure semantic HTML structure
- Maintain heading hierarchy
- Include proper ARIA attributes