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
            console.log(`🔄 Starting to load content: ${contentName}`);
            
            // Fetch the markdown file as text
            const fetchUrl = `/src/content/${contentName}.md`;
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
                sectionsKeys: Object.keys(parsed.sections),
                personnelCount: parsed.sections.personnel?.length || 0,
                mainContentLength: parsed.sections.mainContent?.length || 0
            });

            // Cache the result
            this.cache.set(contentName, parsed);
            console.log(`💾 Content cached for: ${contentName}`);
            
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
        
        // Split frontmatter and content - handle the malformed frontmatter
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
        
        // Parse content into sections
        const sections = this.parseContentSections(content);
        
        return {
            frontmatter,
            sections,
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
     * Parse content into sections based on headings
     * @param {string} content - Markdown content
     * @returns {Object} Organized sections
     */
    parseContentSections(content) {
        console.log('📝 Parsing content sections from:', content.substring(0, 200));
        
        const sections = {
            mainContent: '',
            personnel: [],
            services: [],
            industries: [],
            other: []
        };
        
        // Split by ## headings
        const sectionRegex = /^## (.+)$/gm;
        const parts = content.split(sectionRegex);
        
        console.log('📂 Content split into', parts.length, 'parts');
        parts.forEach((part, index) => {
            console.log(`📄 Part ${index}:`, part.substring(0, 100));
        });
        
        // First part is content before any ## heading
        if (parts[0]) {
            sections.mainContent = this.markdownToHtml(parts[0].trim());
            console.log('📄 Main content set:', sections.mainContent.substring(0, 100));
        }
        
        // Process sections
        for (let i = 1; i < parts.length; i += 2) {
            const heading = parts[i];
            const sectionContent = parts[i + 1] || '';
            
            console.log(`🏷️ Processing section: "${heading}"`);
            console.log(`📄 Section content preview:`, sectionContent.substring(0, 150));
            
            if (heading.toLowerCase().includes('personnel')) {
                console.log('👥 Found personnel section!');
                sections.personnel = this.parsePersonnel(sectionContent);
            } else if (heading.toLowerCase().includes('services')) {
                console.log('🛠️ Found services section!');
                sections.services = this.parseServices(sectionContent);
            } else {
                console.log('📋 Adding to other sections:', heading);
                sections.other.push({
                    title: heading,
                    content: this.markdownToHtml(sectionContent.trim())
                });
            }
        }
        
        // Extract industries from content (long bullet lists)
        sections.industries = this.extractIndustries(content);
        
        console.log('📊 Final sections summary:', {
            mainContentLength: sections.mainContent.length,
            personnelCount: sections.personnel.length,
            servicesCount: sections.services.length,
            otherSections: sections.other.map(s => s.title)
        });
        
        return sections;
    }

    /**
     * Parse personnel from a section
     * @param {string} sectionContent - Personnel section content
     * @returns {Array} Array of personnel objects
     */
    parsePersonnel(sectionContent) {
        console.log('👥 Parsing personnel from content length:', sectionContent.length);
        console.log('👥 Personnel content preview:', sectionContent.substring(0, 300));
        const personnel = [];
        
        // Clean up any remaining backslash line continuations
        const cleanContent = sectionContent.replace(/\\\s*\n/g, ' ').trim();
        
        // Split by **Name** pattern to identify personnel entries
        const personnelEntries = cleanContent.split(/(?=\*\*[^*]+\*\*\s*[–—-])/);
        
        console.log('👥 Found', personnelEntries.length, 'potential personnel entries');
        
        for (const entry of personnelEntries) {
            if (!entry.trim() || !entry.includes('**')) continue;
            
            console.log('👤 Processing entry:', entry.substring(0, 150));
            
            // Extract name and title using regex
            const nameMatch = entry.match(/\*\*([^*]+)\*\*\s*[–—-]\s*([^\n]+)/);
            if (!nameMatch) {
                console.log('👤 No name/title match found');
                continue;
            }
            
            const name = nameMatch[1].trim();
            const title = nameMatch[2].trim();
            
            // Extract bio - everything after the first line
            const lines = entry.split('\n');
            const bioLines = lines.slice(1).filter(line => line.trim());
            const bioText = bioLines.join('\n').trim();
            
            console.log('👤 Extracted:', { 
                name, 
                title, 
                bioLength: bioText.length,
                bioPreview: bioText.substring(0, 100)
            });
            
            // Convert bio markdown to HTML
            const bio = bioText ? this.markdownToHtml(bioText).replace(/<p><\/p>/g, '').trim() : '';
            
            if (name && title) {
                personnel.push({
                    name,
                    title,
                    bio
                });
                console.log('✅ Added personnel:', { name, title, bioPreview: bio.substring(0, 50) });
            }
        }
        
        console.log('👥 Total personnel found:', personnel.length);
        return personnel;
    }

    /**
     * Parse services from a section
     * @param {string} sectionContent - Services section content
     * @returns {Array} Array of service objects
     */
    parseServices(sectionContent) {
        const services = [];
        
        // Split by ### subsections
        const serviceRegex = /^### (.+)$/gm;
        const parts = sectionContent.split(serviceRegex);
        
        for (let i = 1; i < parts.length; i += 2) {
            const title = parts[i];
            const content = parts[i + 1] || '';
            
            services.push({
                title: title.trim(),
                content: this.markdownToHtml(content.trim())
            });
        }
        
        return services;
    }

    /**
     * Extract industries from bullet lists
     * @param {string} content - Full content
     * @returns {Array} Array of industry names
     */
    extractIndustries(content) {
        const industries = [];
        
        // Find all bullet lists
        const listRegex = /^[-*]\s+(.+)$/gm;
        let match;
        let currentList = [];
        
        while ((match = listRegex.exec(content)) !== null) {
            currentList.push(match[1].trim());
        }
        
        // If we have a long list (>10 items), treat as industries
        if (currentList.length > 10) {
            return currentList;
        }
        
        return industries;
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
     * Apply Tailwind styling to content
     * @param {string} htmlContent - HTML content
     * @returns {string} Styled HTML
     */
    applyContentStyling(htmlContent) {
        return htmlContent
            .replace(/<p>/g, '<p class="text-neutral-800 mb-4">')
            .replace(/<h1>/g, '<h1 class="text-3xl font-bold text-primary mb-6">')
            .replace(/<h2>/g, '<h2 class="text-2xl font-bold text-primary mb-4">')
            .replace(/<h3>/g, '<h3 class="text-xl font-bold text-primary mb-3">')
            .replace(/<ul>/g, '<ul class="space-y-2 mb-4">')
            .replace(/<li>/g, '<li class="text-neutral-800">');
    }

    /**
     * Generate enhanced styled personnel cards
     * @param {Array} personnel - Array of personnel objects
     * @returns {string} HTML for personnel cards
     */
    generatePersonnelCards(personnel) {
        if (personnel.length === 0) return '';
        
        let html = `
            <h3 class="text-3xl font-bold text-primary mb-12 font-heading text-center">Key Personnel</h3>
            <div class="grid grid-cols-1 lg:grid-cols-1 gap-8">
        `;
        
        personnel.forEach(person => {
            html += `
                <div class="personnel-card bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
                    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                        <!-- Photo Area -->
                        <div class="lg:col-span-1">
                            <!-- TODO: Replace with actual headshot photo of ${this.escapeHtml(person.name)} -->
                            <div class="w-32 h-32 mx-auto bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full flex items-center justify-center">
                                <svg class="w-16 h-16 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                </svg>
                            </div>
                        </div>
                        
                        <!-- Info Area -->
                        <div class="lg:col-span-3">
                            <h4 class="text-2xl font-bold text-primary mb-2 font-heading">${this.escapeHtml(person.name)}</h4>
                            <p class="text-xl text-accent-gold font-semibold mb-4 font-heading">${this.escapeHtml(person.title)}</p>
                            <div class="text-neutral-800 leading-relaxed font-body space-y-4">${person.bio}</div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    }

    /**
     * Generate styled services section
     * @param {Object} sections - Parsed sections object
     * @returns {string} HTML for services section
     */
    generateServicesSection(sections) {
        console.log('🛠️ Generating services section, available sections:', Object.keys(sections));
        
        // Find the services section in multiple possible locations
        let servicesSection = sections.other.find(section => 
            section.title.toLowerCase().includes('services')
        );
        
        // If not found in other, check if there's a services array
        if (!servicesSection && sections.services && sections.services.length > 0) {
            console.log('🛠️ Found services in sections.services array');
            return this.generateServicesFromArray(sections.services);
        }
        
        if (!servicesSection) {
            console.warn('⚠️ No services section found');
            return '';
        }
        
        console.log('🛠️ Found services section:', servicesSection.title);
        
        let html = `
            <h2 class="text-3xl font-bold text-primary mb-12 font-heading text-center">Our Services</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        `;
        
        // Parse the services content to extract Consulting and Financial Investments
        const content = servicesSection.content;
        console.log('🛠️ Services content to parse:', content.substring(0, 200));
        
        // Split by h3 tags to get subsections
        const serviceSections = content.split(/<h3[^>]*>/);
        console.log('🛠️ Split into', serviceSections.length, 'service sections');
        
        for (let i = 1; i < serviceSections.length; i++) {
            const section = serviceSections[i];
            const titleMatch = section.match(/^([^<]+)</);
            const title = titleMatch ? titleMatch[1].trim() : '';
            
            console.log('🛠️ Processing service section:', title);
            
            // Extract the list items more robustly
            const listMatch = section.match(/<ul[^>]*>(.*?)<\/ul>/s);
            let listItems = '';
            if (listMatch) {
                listItems = listMatch[1];
                console.log('🔍 Found list items for', title, ':', listItems);
            } else {
                console.log('❌ No list match found for', title);
                console.log('🔍 Section content:', section.substring(0, 300));
            }
            
            const formattedList = this.formatServiceList(listItems);
            console.log('🎨 Formatted list for', title, ':', formattedList);
            
            // Create styled service category
            html += `
                <div class="service-category bg-white p-8 rounded-lg shadow-md">
                    <h3 class="text-2xl font-bold text-primary mb-6 font-heading">${this.escapeHtml(title)}</h3>
                    <ul class="space-y-4 services-list">
                        ${formattedList}
                    </ul>
                </div>
            `;
        }
        
        html += '</div>';
        return html;
    }

    /**
     * Generate services from array format
     * @param {Array} services - Array of service objects
     * @returns {string} HTML for services
     */
    generateServicesFromArray(services) {
        let html = `
            <h2 class="text-3xl font-bold text-primary mb-12 font-heading text-center">Our Services</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        `;
        
        services.forEach(service => {
            html += `
                <div class="service-category bg-white p-8 rounded-lg shadow-md">
                    <h3 class="text-2xl font-bold text-primary mb-6 font-heading">${this.escapeHtml(service.title)}</h3>
                    <div class="space-y-4">
                        ${service.content}
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    }

    /**
     * Format service list items with proper styling
     * @param {string} listItems - Raw list items HTML
     * @returns {string} Formatted list items
     */
    formatServiceList(listItems) {
        if (!listItems) return '';
        
        // Replace list items with proper blue arrow bullet styling
        return listItems
            .replace(/<li[^>]*>/g, '<li class="font-body flex items-start">')
            .replace(/^(\s*)<li/gm, '$1<li')
            .replace(/<li class="font-body flex items-start">/g, 
                '<li class="font-body flex items-start"><span class="text-primary mr-3 font-semibold text-lg">▸</span><span class="text-neutral-800">')
            .replace(/<\/li>/g, '</span></li>');
    }

    /**
     * Generate styled industry cards
     * @param {Array} industries - Array of industry names
     * @returns {string} HTML for industry grid
     */
    generateIndustryCards(industries) {
        let html = '';
        
        industries.forEach(industry => {
            html += `
                <div class="bg-neutral-50 p-4 rounded-lg text-center">
                    <p class="text-sm text-neutral-800">${this.escapeHtml(industry)}</p>
                </div>
            `;
        });
        
        return html;
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

// Create global instance
export const contentLoader = new ContentLoader();