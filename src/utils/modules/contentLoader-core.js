// src/utils/modules/contentLoader-core.js
// Core functionality for content loading - shared by all pages

export class ContentLoaderCore {
    constructor() {
        this.cache = new Map();
    }

    /**
     * Load and parse markdown content
     * @param {string} contentName - Name of the content file (without .md extension)
     * @returns {Promise<Object>} Parsed content with frontmatter and HTML
     */
    async loadContent(contentName) {
        // Note: Caching is now handled at the main ContentLoader level
        try {
            console.log(`🔄 Starting to load content: ${contentName}`);
            
            // Fetch the markdown file as text
            const fetchUrl = `/content/${contentName}.md`;
            console.log(`📡 Fetching from URL: ${fetchUrl}`);
            
            const response = await fetch(fetchUrl);
            console.log(`📡 Fetch response:`, {
                ok: response.ok,
                status: response.status,
                statusText: response.statusText,
                url: response.url,
                headers: Object.fromEntries(response.headers.entries())
            });
            
            if (!response.ok) {
                console.error(`❌ Fetch failed with status ${response.status}: ${response.statusText}`);
                throw new Error(`Failed to fetch ${contentName}.md: ${response.status} ${response.statusText}`);
            }
            
            const markdownText = await response.text();
            console.log(`📄 Raw markdown loaded:`, {
                length: markdownText.length,
                preview: markdownText.substring(0, 300) + '...',
                firstLine: markdownText.split('\n')[0]
            });
            
            // Parse frontmatter and content
            console.log(`⚙️ Parsing markdown content...`);
            const parsed = this.parseMarkdown(markdownText);
            console.log(`✅ Parsed content:`, {
                frontmatter: parsed.frontmatter,
                rawContentLength: parsed.rawContent?.length || 0
            });

            // Don't cache here - let the main ContentLoader handle caching after full parsing
            console.log(`✅ Basic parsing complete for: ${contentName}`);
            
            return parsed;
        } catch (error) {
            console.error(`❌ Failed to load content: ${contentName}`, {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
            throw error;
        }
    }

    /**
     * Parse markdown text into frontmatter and HTML
     * @param {string} markdownText - Raw markdown text
     * @returns {Object} Parsed content with sections
     */
    parseMarkdown(markdownText) {
        console.log('🔍 Raw markdown input:', markdownText.substring(0, 100));
        
        // Split frontmatter and content - handle various frontmatter formats
        const frontmatterRegex = /^---\s*\n([\s\S]*?)\n-+\s*\n([\s\S]*)$/;
        const match = markdownText.match(frontmatterRegex);
        
        let frontmatter = {};
        let content = markdownText;
        
        if (match) {
            console.log('✅ Frontmatter match found');
            const frontmatterText = match[1];
            content = match[2];
            console.log('📋 Frontmatter text:', frontmatterText);
            console.log('📄 Content after frontmatter:', content.substring(0, 100));
            
            // Parse frontmatter (improved YAML parsing)
            frontmatter = this.parseFrontmatter(frontmatterText);
        } else {
            console.log('❌ No frontmatter match found');
            // Try alternative patterns
            const altRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
            const altMatch = markdownText.match(altRegex);
            if (altMatch) {
                console.log('✅ Alternative frontmatter pattern matched');
                frontmatter = this.parseFrontmatter(altMatch[1]);
                content = altMatch[2];
            }
        }
        
        return {
            frontmatter,
            rawContent: content
        };
    }

    /**
     * Parse YAML frontmatter
     * @param {string} frontmatterText - YAML content
     * @returns {Object} Parsed frontmatter
     */
    parseFrontmatter(frontmatterText) {
        const frontmatter = {};
        const lines = frontmatterText.split('\n');
        
        lines.forEach(line => {
            line = line.trim();
            if (line && !line.startsWith('#')) {
                const colonIndex = line.indexOf(':');
                if (colonIndex > 0) {
                    const key = line.substring(0, colonIndex).trim();
                    let value = line.substring(colonIndex + 1).trim();
                    
                    // Remove quotes and handle special characters
                    value = value.replace(/^["']|["']$/g, '');
                    
                    frontmatter[key] = value;
                }
            }
        });
        
        return frontmatter;
    }

    /**
     * Enhanced markdown to HTML conversion
     * @param {string} markdown - Markdown text
     * @returns {string} HTML string
     */
    markdownToHtml(markdown) {
        // Split content by double newlines to handle paragraphs and lists separately
        const sections = markdown.trim().split(/\n\s*\n/);
        let html = '';
        
        sections.forEach(section => {
            const trimmedSection = section.trim();
            if (!trimmedSection) return;
            
            // Check if this section is a list (starts with -)
            if (trimmedSection.includes('\n-') || trimmedSection.startsWith('-')) {
                // Handle lists with proper bullet styling
                const listItems = trimmedSection
                    .split('\n')
                    .filter(line => line.trim().startsWith('-'))
                    .map(line => {
                        const content = line.replace(/^-\s*/, '').trim();
                        return `<li><span class="custom-bullet">▸</span>${content}</li>`;
                    })
                    .join('');
                
                if (listItems) {
                    html += `<ul class="custom-list">${listItems}</ul>`;
                }
            } else {
                // Handle regular paragraphs and headers
                let processedSection = trimmedSection
                    // Headers
                    .replace(/^#### (.*$)/gim, '<h4 class="text-lg font-bold text-primary mb-3 font-heading">$1</h4>')
                    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold text-primary mb-4 font-heading">$1</h3>')
                    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-primary mb-6 font-heading">$1</h2>')
                    .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-primary mb-6 font-heading">$1</h1>')
                    // Bold and italic
                    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/gim, '<em>$1</em>');
                
                // Check if it's a header line
                if (processedSection.includes('<h1>') || processedSection.includes('<h2>') || 
                    processedSection.includes('<h3>') || processedSection.includes('<h4>')) {
                    html += processedSection;
                } else {
                    // Regular paragraph with prose styling for better typography
                    html += `<p class="text-neutral-800 mb-4 font-body leading-relaxed text-lg">${processedSection}</p>`;
                }
            }
        });
        
        return html;
    }

    /**
     * Apply Tailwind styling to content
     * @param {string} htmlContent - HTML content
     * @returns {string} Styled HTML
     */
    applyContentStyling(htmlContent) {
        // Don't wrap in prose - our markdownToHtml already handles styling
        return htmlContent;
    }

    /**
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Render content to a container element
     * @param {HTMLElement} container - Target container
     * @param {string} htmlContent - HTML content to render
     */
    renderContent(container, htmlContent) {
        if (!container) {
            console.error('Container element not found');
            return;
        }
        
        container.innerHTML = htmlContent;
    }

    /**
     * Show loading state
     * @param {HTMLElement} container - Target container
     */
    showLoading(container) {
        if (container) {
            container.innerHTML = `
                <div class="flex items-center justify-center py-12">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span class="ml-3 text-neutral-600">Loading content...</span>
                </div>
            `;
        }
    }

    /**
     * Show error state
     * @param {HTMLElement} container - Target container
     * @param {string} message - Error message
     */
    showError(container, message = 'Failed to load content') {
        if (container) {
            container.innerHTML = `
                <div class="text-center py-12">
                    <div class="text-red-600 mb-2">
                        <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"></path>
                        </svg>
                    </div>
                    <p class="text-neutral-600">${message}</p>
                </div>
            `;
        }
    }
}