// Content loader utility for dynamic markdown content
export class ContentLoader {
    constructor() {
        this.cache = new Map();
    }

    /**
     * Load and parse markdown content
     * @param {string} contentName - Name of the content file (without .md extension)
     * @returns {Promise<Object>} Parsed content with frontmatter and HTML
     */
    async loadContent(contentName) {
        // Check cache first
        if (this.cache.has(contentName)) {
            return this.cache.get(contentName);
        }

        try {
            console.log(`Loading content: ${contentName}`);
            
            // Fetch the markdown file as text
            const response = await fetch(`/src/content/${contentName}.md`);
            if (!response.ok) {
                throw new Error(`Failed to fetch ${contentName}.md: ${response.status}`);
            }
            
            const markdownText = await response.text();
            console.log('Raw markdown:', markdownText.substring(0, 200) + '...');
            
            // Parse frontmatter and content
            const parsed = this.parseMarkdown(markdownText);
            console.log('Parsed content:', parsed);

            // Cache the result
            this.cache.set(contentName, parsed);
            
            return parsed;
        } catch (error) {
            console.error(`Failed to load content: ${contentName}`, error);
            throw new Error(`Content not found: ${contentName}`);
        }
    }

    /**
     * Parse markdown text into frontmatter and HTML
     * @param {string} markdownText - Raw markdown text
     * @returns {Object} Parsed content
     */
    parseMarkdown(markdownText) {
        // Split frontmatter and content
        const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
        const match = markdownText.match(frontmatterRegex);
        
        let frontmatter = {};
        let content = markdownText;
        
        if (match) {
            const frontmatterText = match[1];
            content = match[2];
            
            // Parse frontmatter (simple YAML parsing)
            const lines = frontmatterText.split('\n');
            lines.forEach(line => {
                const colonIndex = line.indexOf(':');
                if (colonIndex > 0) {
                    const key = line.substring(0, colonIndex).trim();
                    const value = line.substring(colonIndex + 1).trim().replace(/^["']|["']$/g, '');
                    frontmatter[key] = value;
                }
            });
        }
        
        // Convert markdown to HTML (basic conversion)
        const html = this.markdownToHtml(content);
        
        return {
            frontmatter,
            html,
            content
        };
    }

    /**
     * Basic markdown to HTML conversion
     * @param {string} markdown - Markdown text
     * @returns {string} HTML string
     */
    markdownToHtml(markdown) {
        return markdown
            // Headers
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            // Bold
            .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
            // Italic
            .replace(/\*(.*)\*/gim, '<em>$1</em>')
            // Line breaks and paragraphs
            .replace(/\n\n/gim, '</p><p>')
            .replace(/^\s*$/gim, '')
            // Wrap in paragraphs
            .replace(/^(.+)$/gim, '<p>$1</p>')
            // Lists
            .replace(/^\- (.+)$/gim, '<li>$1</li>')
            .replace(/(<li>.*<\/li>)/gims, '<ul>$1</ul>')
            // Fix nested tags
            .replace(/<p><h([1-6])>/gim, '<h$1>')
            .replace(/<\/h([1-6])><\/p>/gim, '</h$1>')
            .replace(/<p><ul>/gim, '<ul>')
            .replace(/<\/ul><\/p>/gim, '</ul>')
            .replace(/<p><\/p>/gim, '');
    }

    /**
     * Parse personnel information from about content
     * @param {string} htmlContent - HTML content from markdown
     * @returns {Array} Array of personnel objects
     */
    parsePersonnel(htmlContent) {
        const personnel = [];
        
        // Create a temporary DOM element to parse HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        
        // Find all personnel sections (looking for strong tags with names)
        const strongElements = tempDiv.querySelectorAll('strong');
        
        strongElements.forEach(strong => {
            const text = strong.textContent.trim();
            
            // Check if this looks like a personnel entry (contains " – ")
            if (text.includes(' – ')) {
                const [name, title] = text.split(' – ');
                
                // Get the biography - collect all text content from the parent paragraph and following paragraphs
                let bio = '';
                let currentElement = strong.parentNode;
                
                // Start from the current paragraph after the strong element
                let textContent = currentElement.textContent.replace(text, '').trim();
                if (textContent) {
                    bio += textContent + ' ';
                }
                
                // Continue with next paragraphs until we hit another strong element or section
                let nextElement = currentElement.nextElementSibling;
                while (nextElement && nextElement.nodeType === Node.ELEMENT_NODE) {
                    // Stop if we hit another personnel entry or major heading
                    if (nextElement.querySelector('strong') && 
                        nextElement.querySelector('strong').textContent.includes(' – ')) {
                        break;
                    }
                    
                    if (nextElement.tagName === 'H2' || nextElement.tagName === 'H3') {
                        break;
                    }
                    
                    bio += nextElement.textContent.trim() + ' ';
                    nextElement = nextElement.nextElementSibling;
                }
                
                if (name && title) {
                    personnel.push({
                        name: name.trim(),
                        title: title.trim(),
                        bio: bio.trim()
                    });
                }
            }
        });
        
        return personnel;
    }

    /**
     * Parse services from services content
     * @param {string} htmlContent - HTML content from markdown
     * @returns {Object} Organized services data
     */
    parseServices(htmlContent) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        
        const services = {
            sections: [],
            coreValues: []
        };
        
        // Find all h2 and h3 headings to organize content
        const headings = tempDiv.querySelectorAll('h2, h3, h4');
        
        let currentSection = null;
        
        headings.forEach(heading => {
            const text = heading.textContent.trim();
            const level = parseInt(heading.tagName.charAt(1));
            
            if (level === 2) {
                // Main section
                currentSection = {
                    title: text,
                    subsections: [],
                    content: ''
                };
                services.sections.push(currentSection);
            } else if (level === 3 && currentSection) {
                // Subsection
                const subsection = {
                    title: text,
                    content: '',
                    items: []
                };
                currentSection.subsections.push(subsection);
            }
        });
        
        return services;
    }

    /**
     * Parse investments content
     * @param {string} htmlContent - HTML content from markdown
     * @returns {Object} Organized investments data
     */
    parseInvestments(htmlContent) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        
        const investments = {
            sections: [],
            industries: []
        };
        
        // Find the industries list
        const lists = tempDiv.querySelectorAll('ul');
        lists.forEach(list => {
            const items = list.querySelectorAll('li');
            if (items.length > 10) { // Assume this is the industries list
                items.forEach(item => {
                    investments.industries.push(item.textContent.trim());
                });
            }
        });
        
        // Find main sections
        const headings = tempDiv.querySelectorAll('h2');
        headings.forEach(heading => {
            const title = heading.textContent.trim();
            let content = '';
            
            // Get content until next h2
            let nextElement = heading.nextElementSibling;
            while (nextElement && nextElement.tagName !== 'H2') {
                content += nextElement.outerHTML;
                nextElement = nextElement.nextElementSibling;
            }
            
            investments.sections.push({
                title,
                content
            });
        });
        
        return investments;
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

// Create global instance
export const contentLoader = new ContentLoader();