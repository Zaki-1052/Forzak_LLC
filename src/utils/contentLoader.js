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
            other: [],
            // Special sections for services.md
            servicesMainDescription: '',
            coreValues: [],
            serviceAreas: []
        };
        
        // Check if this is services content by looking for specific markers
        const isServicesContent = content.includes('### Forzak Will Do More for Your Business') ||
                                 content.includes('### Core Values');
        
        if (isServicesContent) {
            console.log('🛠️ Detected services content, using specialized parsing');
            return this.parseServicesContent(content);
        }
        
        // Split by ## headings
        const sectionRegex = /^## (.+)$/gm;
        const parts = content.split(sectionRegex);
        
        console.log('📂 Content split into', parts.length, 'parts');
        parts.forEach((part, index) => {
            console.log(`📄 Part ${index}:`, part.substring(0, 100));
        });
        
        // First part is content before any ## heading
        if (parts[0]) {
            const mainContentText = parts[0].trim();
            // Remove the main heading if it exists (# Financial Investments)
            const cleanedContent = mainContentText.replace(/^#\s+[^\n]+\n*/, '');
            
            // If there's no content after removing the main heading, use the first section as main content
            if (!cleanedContent.trim() && parts.length > 2) {
                console.log('📄 No intro content found, using first section as main content');
                // Store the first section title
                sections.firstSectionTitle = parts[1].trim();
                // Use the first section's content as main content
                sections.mainContent = this.markdownToHtml(parts[2].trim());
                // Adjust the loop to skip the first section
                sections.skipFirstSection = true;
            } else {
                sections.mainContent = this.markdownToHtml(cleanedContent);
            }
            console.log('📄 Main content set:', sections.mainContent.substring(0, 100));
        }
        
        // Process sections
        let startIndex = sections.skipFirstSection ? 3 : 1; // Start from 3 if we skip first section
        
        for (let i = startIndex; i < parts.length; i += 2) {
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
                // Check if this section contains the industries list
                const hasIndustriesList = sectionContent.includes('### Industries we have invested in:');
                
                if (hasIndustriesList) {
                    console.log('🏭 Found section with industries list');
                    // Parse the content but mark it for special rendering
                    sections.other.push({
                        title: heading,
                        content: this.parseInvestmentSectionWithIndustries(sectionContent),
                        hasIndustries: true
                    });
                } else {
                    console.log('📋 Adding to other sections:', heading);
                    sections.other.push({
                        title: heading,
                        content: this.markdownToHtml(sectionContent.trim())
                    });
                }
            }
        }
        
        console.log('📊 Final sections summary:', {
            mainContentLength: sections.mainContent.length,
            personnelCount: sections.personnel.length,
            servicesCount: sections.services.length,
            otherSections: sections.other.map(s => s.title)
        });
        
        return sections;
    }

    /**
     * Parse services.md content with specialized handling
     * @param {string} content - Services markdown content
     * @returns {Object} Organized services sections
     */
    parseServicesContent(content) {
        console.log('🛠️ Parsing specialized services content');
        
        const sections = {
            mainContent: '',
            servicesMainDescription: '',
            coreValues: [],
            serviceAreas: [],
            other: []
        };
        
        // Extract main description under "### Forzak Will Do More for Your Business"
        const mainDescMatch = content.match(/### Forzak Will Do More for Your Business\s*\n\n([^#]*?)(?=###|##|$)/s);
        if (mainDescMatch) {
            sections.servicesMainDescription = this.markdownToHtml(mainDescMatch[1].trim());
            console.log('✅ Found main description:', sections.servicesMainDescription.substring(0, 100));
        }
        
        // Extract core values sections (### headings that are value-related)
        const coreValuesPattern = /### (Core Values|Creativity & Rigour|Relationship Driven|Objective Advice)\s*\n\n((?:(?!###|##)[\s\S])*)/g;
        let coreValuesMatch;
        while ((coreValuesMatch = coreValuesPattern.exec(content)) !== null) {
            const title = coreValuesMatch[1];
            const content = coreValuesMatch[2].trim();
            sections.coreValues.push({
                title,
                content: this.markdownToHtml(content)
            });
            console.log('✅ Found core value section:', title);
        }
        
        // Extract all major service areas (## headings) with better parsing
        // Split content by ## headings first, then process each section
        const sectionParts = content.split(/^## /gm);
        
        for (let i = 1; i < sectionParts.length; i++) {
            const sectionText = sectionParts[i];
            const lines = sectionText.split('\n');
            const title = lines[0].trim();
            const sectionContent = lines.slice(1).join('\n').trim();
            
            // Skip the header-only sections
            if (title === 'Market Leading Advisory Firm') {
                continue;
            }
            
            console.log(`📋 Processing service area: "${title}"`);
            console.log(`📄 Raw content length: ${sectionContent.length}`);
            console.log(`📄 Content preview: ${sectionContent.substring(0, 200)}...`);
            
            sections.serviceAreas.push({
                title,
                content: this.markdownToHtml(sectionContent),
                rawContent: sectionContent  // Keep raw for subsection parsing
            });
            console.log('✅ Found service area:', title);
        }
        
        console.log('🛠️ Services parsing complete:', {
            mainDescriptionLength: sections.servicesMainDescription.length,
            coreValuesCount: sections.coreValues.length,
            serviceAreasCount: sections.serviceAreas.length
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
     * Parse investment section that contains industries list
     * @param {string} sectionContent - Section content with industries
     * @returns {string} HTML with industries as grid
     */
    parseInvestmentSectionWithIndustries(sectionContent) {
        console.log('🏭 Parsing investment section with industries');
        
        // Split the content at the industries heading
        const parts = sectionContent.split(/### Industries we have invested in:/i);
        
        if (parts.length < 2) {
            // No industries list found, just return normal HTML
            return this.markdownToHtml(sectionContent);
        }
        
        // Parse the part before industries
        let html = this.markdownToHtml(parts[0].trim());
        
        // Add the industries heading
        html += '<h3 class="text-xl font-bold text-primary mb-6 font-heading">Industries we have invested in:</h3>';
        
        // Extract industries from the list
        const industriesPart = parts[1];
        const industries = [];
        const listRegex = /^[-*]\s+(.+)$/gm;
        let match;
        
        while ((match = listRegex.exec(industriesPart)) !== null) {
            const industry = match[1].trim();
            if (industry) {
                industries.push(industry);
            }
        }
        
        // Generate grid HTML for industries
        if (industries.length > 0) {
            html += '<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">';
            industries.forEach(industry => {
                html += `
                    <div class="bg-white p-4 rounded-lg text-center shadow-sm hover:shadow-md transition-shadow">
                        <p class="text-sm text-neutral-800 font-body">${this.escapeHtml(industry)}</p>
                    </div>
                `;
            });
            html += '</div>';
        }
        
        // If there's content after the industries list, add it
        const remainingContent = industriesPart.replace(listRegex, '').trim();
        if (remainingContent) {
            html += this.markdownToHtml(remainingContent);
        }
        
        return html;
    }

    /**
     * Extract industries from bullet lists
     * @param {string} content - Full content
     * @returns {Array} Array of industry names
     */
    extractIndustries(content) {
        console.log('🏭 Extracting industries from content...');
        const industries = [];
        
        // Look for the specific industries section
        const industriesMatch = content.match(/### Industries we have invested in:\s*((?:\s*-\s*.+\s*)+)/i);
        if (industriesMatch) {
            console.log('🎯 Found industries section:', industriesMatch[1]);
            const industriesList = industriesMatch[1];
            const listRegex = /^[-*]\s+(.+)$/gm;
            let match;
            
            while ((match = listRegex.exec(industriesList)) !== null) {
                const industry = match[1].trim();
                if (industry) {
                    industries.push(industry);
                }
            }
            console.log('🏭 Extracted industries:', industries);
            return industries;
        }
        
        // Fallback: Find all bullet lists and use the longest one
        console.log('⚠️ No specific industries section found, trying fallback...');
        const listRegex = /^[-*]\s+(.+)$/gm;
        let match;
        let currentList = [];
        
        while ((match = listRegex.exec(content)) !== null) {
            currentList.push(match[1].trim());
        }
        
        // If we have a long list (>10 items), treat as industries
        if (currentList.length > 10) {
            console.log('🏭 Using fallback industries list:', currentList);
            return currentList;
        }
        
        console.log('⚠️ No industries found');
        return industries;
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
        // Don't wrap in prose - our markdownToHtml already handles styling
        return htmlContent;
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
        // TODO: Personnel headshots may not be available - consider removing these photo placeholders entirely
        personnel.forEach(person => {
            html += `
                <div class="personnel-card bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
                    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                        <!-- Photo Area -->
                        <div class="lg:col-span-1">
                            <div class="w-32 h-32 mx-auto bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full flex items-center justify-center">
                                <svg class="w-16 h-16 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                </svg>
                            </div>
                        </div>
                        
                        <!-- Info Area -->
                        <div class="lg:col-span-3">
                            <h4 class="text-2xl font-bold text-primary mb-2 font-heading">
                                ${person.name === 'Sameer Alibhai' ? 
                                    `<a href="https://www.linkedin.com/in/sameer-alibhai-0b878321/" target="_blank" rel="noopener noreferrer" class="hover:text-secondary transition-colors">${this.escapeHtml(person.name)}</a>` : 
                                    this.escapeHtml(person.name)
                                }
                            </h4>
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
                    <ul class="custom-list">
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
            console.log('🔧 Processing service from array:', service.title);
            console.log('🔧 Service content:', service.content);
            
            // Extract bullet points from the content - handle both formats
            let bullets = [];
            
            // First try to extract from existing HTML list structure
            const listMatch = service.content.match(/<ul[^>]*class="custom-list"[^>]*>(.*?)<\/ul>/s);
            if (listMatch) {
                const listHTML = listMatch[1];
                const liRegex = /<li[^>]*><span[^>]*class="custom-bullet"[^>]*>▸<\/span>(.*?)<\/li>/g;
                let match;
                
                while ((match = liRegex.exec(listHTML)) !== null) {
                    bullets.push(match[1].trim());
                }
                console.log('🔧 Extracted bullets from HTML list for', service.title, ':', bullets);
            }
            
            // Fallback: try to extract from paragraph format
            if (bullets.length === 0) {
                const bulletRegex = /<p>-\s*(.+?)<\/p>/g;
                let match;
                
                while ((match = bulletRegex.exec(service.content)) !== null) {
                    bullets.push(match[1].trim());
                }
                console.log('🔧 Extracted bullets from paragraphs for', service.title, ':', bullets);
            }
            
            // Generate proper list items with arrow bullets
            let listItems = '';
            bullets.forEach(bullet => {
                listItems += `<li><span class="custom-bullet">▸</span>${this.escapeHtml(bullet)}</li>`;
            });
            
            html += `
                <div class="service-category bg-white p-8 rounded-lg shadow-md">
                    <h3 class="text-2xl font-bold text-primary mb-6 font-heading">${this.escapeHtml(service.title)}</h3>
                    <ul class="custom-list">
                        ${listItems}
                    </ul>
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
        if (!listItems) {
            console.log('⚠️ formatServiceList: No list items provided');
            return '';
        }
        
        console.log('🔧 formatServiceList input:', listItems);
        
        // Replace list items with proper blue arrow bullet styling
        const formatted = listItems
            .replace(/<li[^>]*>/g, '<li>')
            .replace(/<li>/g, '<li><span class="custom-bullet">▸</span>');
            
        console.log('🎨 formatServiceList output:', formatted);
        return formatted;
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
                <div class="bg-white p-4 rounded-lg text-center shadow-sm hover:shadow-md transition-shadow">
                    <p class="text-sm text-neutral-800 font-body">${this.escapeHtml(industry)}</p>
                </div>
            `;
        });
        
        return html;
    }

    /**
     * Generate core values section from services content
     * @param {Object} sections - Parsed sections object
     * @returns {string} HTML for core values section
     */
    generateCoreValuesSection(sections) {
        console.log('💎 Generating core values section, available sections:', Object.keys(sections));
        
        // Use the specialized coreValues array if available
        let coreValuesSections = [];
        if (sections.coreValues && sections.coreValues.length > 0) {
            coreValuesSections = sections.coreValues;
            console.log('✅ Using specialized coreValues sections:', coreValuesSections.length);
        } else {
            // Fallback: Find core values and other value sections
            coreValuesSections = sections.other.filter(section => 
                section.title.toLowerCase().includes('values') ||
                section.title.toLowerCase().includes('creativity') ||
                section.title.toLowerCase().includes('relationship') ||
                section.title.toLowerCase().includes('objective')
            );
            console.log('🔄 Using fallback core values sections:', coreValuesSections.length);
        }
        
        if (coreValuesSections.length === 0) {
            console.warn('⚠️ No core values sections found');
            return '';
        }
        
        let html = `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        `;
        
        coreValuesSections.forEach((section, index) => {
            const icons = [
                `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>`,
                `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>`,
                `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>`,
                `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>`
            ];
            
            html += `
                <div class="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 text-center">
                    <div class="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            ${icons[index % icons.length]}
                        </svg>
                    </div>
                    <h3 class="text-lg font-bold text-primary mb-3 font-heading">${this.escapeHtml(section.title)}</h3>
                    <div class="text-sm text-neutral-800 font-body text-left">${section.content}</div>
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    }

    /**
     * Generate services sections from services content
     * @param {Object} sections - Parsed sections object
     * @returns {string} HTML for services sections
     */
    generateServicesSections(sections) {
        console.log('🛠️ Generating services sections, available sections:', Object.keys(sections));
        
        // Use the specialized serviceAreas array if available
        let serviceSections = [];
        if (sections.serviceAreas && sections.serviceAreas.length > 0) {
            serviceSections = sections.serviceAreas;
            console.log('✅ Using specialized serviceAreas sections:', serviceSections.length);
        } else {
            // Fallback: Find major service sections (Management Consulting, Corporate Restructuring, etc.)
            serviceSections = sections.other.filter(section => 
                section.title.toLowerCase().includes('management consulting') ||
                section.title.toLowerCase().includes('corporate restructuring') ||
                section.title.toLowerCase().includes('mergers') ||
                section.title.toLowerCase().includes('strategic advisory') ||
                section.title.toLowerCase().includes('sell side') ||
                section.title.toLowerCase().includes('buy-side') ||
                section.title.toLowerCase().includes('corporate structure')
            );
            console.log('🔄 Using fallback service sections:', serviceSections.length);
        }
        
        if (serviceSections.length === 0) {
            console.warn('⚠️ No service sections found');
            return '';
        }
        
        let html = '';
        
        serviceSections.forEach((section, index) => {
            const isManagementConsulting = section.title.toLowerCase().includes('management consulting');
            const isMergersAcquisitions = section.title.toLowerCase().includes('mergers');
            
            if (isManagementConsulting) {
                // Special layout for Management Consulting with image and subsections
                const rawContent = section.rawContent || '';
                const mcSubsections = this.parseManagementConsultingSubsections(rawContent);
                
                console.log('🔍 Management Consulting - Raw content preview:', rawContent.substring(0, 500));
                console.log('🔍 Management Consulting - Found subsections:', mcSubsections.length);
                
                html += `
                    <div class="mb-12">
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-8">
                            <div>
                                <h3 class="text-3xl font-bold text-primary mb-6 font-heading">${this.escapeHtml(section.title)}</h3>
                                <div class="text-neutral-800 font-body">${this.getManagementConsultingIntro(section.content)}</div>
                                ${mcSubsections.length > 0 ? '<h2 class="text-2xl font-bold text-primary mt-20 font-heading">Our services include:</h2>' : ''}
                            </div>
                            <div>
                                <div class="aspect-[3/2] rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer">
                                    <img src="/assets/img/meeting.png" 
                                         alt="Professional business consultation meeting - executive in dark suit gesturing during strategic discussion" 
                                         class="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300">
                                </div>
                            </div>
                        </div>
                `;
                
                // Add subsections if found
                if (mcSubsections.length > 0) {
                    html += `
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    `;
                    
                    mcSubsections.forEach(subsection => {
                        html += `
                            <div class="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                                <h4 class="text-xl font-bold text-primary mb-4 font-heading">${this.escapeHtml(subsection.title)}</h4>
                                <div class="text-neutral-800 font-body">${subsection.content}</div>
                            </div>
                        `;
                    });
                    
                    html += '</div>';
                } else {
                    console.warn('⚠️ No Management Consulting subsections found - debugging needed');
                }
                
                html += '</div>';
            } else if (isMergersAcquisitions) {
                // Special 4-grid layout for M&A subsections
                const maContent = section.content;
                const rawContent = section.rawContent || '';
                const subsections = this.parseMergersAcquisitionsSubsections(maContent, rawContent);
                
                html += `
                    <div class="mb-12">
                        <h3 class="text-3xl font-bold text-primary mb-8 text-center font-heading">${this.escapeHtml(section.title)}</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                `;
                
                subsections.forEach(subsection => {
                    html += `
                        <div class="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                            <h4 class="text-xl font-bold text-primary mb-4 font-heading">${this.escapeHtml(subsection.title)}</h4>
                            <div class="text-neutral-800 font-body">${subsection.content}</div>
                        </div>
                    `;
                });
                
                html += '</div></div>';
            } else if (section.title.toLowerCase().includes('risk management')) {
                // Special layout for Risk Management with vertical image
                html += `
                    <div class="mb-8">
                        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div class="lg:col-span-2 bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                                <h3 class="text-3xl font-bold text-primary mb-6 font-heading">${this.escapeHtml(section.title)}</h3>
                                <div class="text-neutral-800 font-body">${section.content}</div>
                            </div>
                            <div class="lg:col-span-1">
                                <div class="aspect-[2/3] rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                                    <img src="/assets/img/graphs.png" 
                                         alt="Risk management analytics with graphs and charts showing financial data and performance metrics" 
                                         class="w-full h-full object-cover object-center">
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                // Regular service section layout (Corporate Restructuring)
                html += `
                    <div class="mb-8">
                        <div class="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                            <h3 class="text-3xl font-bold text-primary mb-6 font-heading">${this.escapeHtml(section.title)}</h3>
                            <div class="text-neutral-800 font-body">${section.content}</div>
                        </div>
                    </div>
                `;
            }
        });
        
        return html;
    }
    
    /**
     * Parse M&A content into subsections for 4-grid layout
     * @param {string} content - M&A section content
     * @param {string} rawContent - Raw markdown content before HTML conversion
     * @returns {Array} Array of subsection objects
     */
    parseMergersAcquisitionsSubsections(content, rawContent) {
        const subsections = [];
        
        console.log('🔍 Parsing M&A subsections from raw content:', rawContent.substring(0, 300));
        
        // Parse markdown headings (### subsections) from raw content
        const headingPattern = /^### (.+?)\s*\n([\s\S]*?)(?=^###|^##|$)/gm;
        let match;
        
        while ((match = headingPattern.exec(rawContent)) !== null) {
            const title = match[1].trim();
            const sectionContent = match[2].trim();
            
            console.log(`🎯 Found M&A subsection: "${title}"`);
            console.log(`📄 Subsection content length: ${sectionContent.length}`);
            
            if (title && sectionContent) {
                subsections.push({
                    title,
                    content: this.markdownToHtml(sectionContent)
                });
            }
        }
        
        console.log(`📊 Total M&A subsections found: ${subsections.length}`);
        
        // If no subsections found, create a single section
        if (subsections.length === 0) {
            console.log('⚠️ No M&A subsections found, using fallback');
            subsections.push({
                title: 'Our Approach',
                content: content
            });
        }
        
        return subsections;
    }

    /**
     * Parse Management Consulting subsections (Operating Strategy, Competitive Strategy)
     * @param {string} rawContent - Raw markdown content
     * @returns {Array} Array of subsection objects
     */
    parseManagementConsultingSubsections(rawContent) {
        const subsections = [];
        
        console.log('🔍 MC Parsing - Full raw content LENGTH:', rawContent.length);
        console.log('🔍 MC Parsing - Full raw content:', rawContent);
        console.log('🔍 Raw content contains "Competitive Strategy"?', rawContent.includes('Competitive Strategy'));
        console.log('🔍 Raw content contains "#### Competitive Strategy"?', rawContent.includes('#### Competitive Strategy'));
        
        // Look for "### Our services include:" and extract everything after it
        // Since rawContent only contains Management Consulting section, we extract to the end
        const startMarker = "### Our services include:";
        const startIndex = rawContent.indexOf(startMarker);
        
        console.log('🔍 Looking for start marker at index:', startIndex);
        
        if (startIndex === -1) {
            console.log('⚠️ No "Our services include:" section found');
            return subsections;
        }
        
        // Extract content from marker to end of Management Consulting section
        const servicesContent = rawContent.substring(startIndex + startMarker.length).trim();
        console.log('🔍 Extracted content length:', servicesContent.length);
        console.log('🔍 Does extracted content include Competitive Strategy?', servicesContent.includes('#### Competitive Strategy'));
        console.log('📋 Found services include section LENGTH:', servicesContent.length);
        console.log('📋 Found services include section FULL CONTENT:', servicesContent);
        console.log('📋 Does it contain "Competitive Strategy"?', servicesContent.includes('Competitive Strategy'));
        console.log('📋 Does it contain "#### Competitive Strategy"?', servicesContent.includes('#### Competitive Strategy'));
        
        // Split by #### to get individual subsections (more reliable than regex)
        const sections = servicesContent.split('#### ');
        console.log(`🔍 Split into ${sections.length} parts`);
        console.log('🔍 All split parts:', sections);
        
        // Process each section (skip first empty part)
        for (let i = 1; i < sections.length; i++) {
            const section = sections[i].trim();
            if (!section) continue;
            
            // Extract title (first line) and content (rest)
            const lines = section.split('\n');
            const title = lines[0].trim();
            const sectionContent = lines.slice(1).join('\n').trim();
            
            console.log(`🎯 Found MC subsection: "${title}"`);
            console.log(`📄 Subsection content: ${sectionContent.substring(0, 100)}...`);
            
            if (title && sectionContent) {
                subsections.push({
                    title,
                    content: this.markdownToHtml(sectionContent)
                });
            }
        }
        
        console.log(`📊 Total MC subsections found: ${subsections.length}`);
        subsections.forEach((sub, i) => {
            console.log(`📋 Subsection ${i + 1}: ${sub.title}`);
        });
        
        return subsections;
    }

    /**
     * Extract the intro paragraph from Management Consulting content
     * @param {string} content - HTML content
     * @returns {string} Intro paragraph HTML
     */
    getManagementConsultingIntro(content) {
        // Extract the first paragraph (before any lists or subsections)
        const firstParagraphMatch = content.match(/<p[^>]*>(.*?)<\/p>/);
        if (firstParagraphMatch) {
            return firstParagraphMatch[0];
        }
        return content;
    }

    /**
     * Generate investment services section from investments content
     * @param {Object} sections - Parsed sections object
     * @returns {string} HTML for investment services section
     */
    generateInvestmentServicesSection(sections) {
        console.log('💼 Generating investment services section, available sections:', Object.keys(sections));
        console.log('📋 Other sections available:', sections.other.map(s => s.title));
        
        // Find investment service sections from investment-solutions.md
        const investmentSections = sections.other.filter(section => {
            const title = section.title.toLowerCase();
            return title === 'private equity' ||
                   title === 'private placements' ||
                   title === 'management buyouts' ||
                   title === 'financial restructuring' ||
                   title === 'debtor-in-possession financing' ||
                   title === 'real estate development financing' ||
                   title.includes('asset based financing');
        });
        
        console.log('✅ Found investment sections:', investmentSections.map(s => s.title));
        
        if (investmentSections.length === 0) {
            console.warn('⚠️ No investment service sections found');
            return '';
        }
        
        let html = `
            <h2 class="text-3xl font-bold text-primary text-center mb-12 font-heading">
                Our Investment Services
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        `;
        
        const icons = [
            `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>`,
            `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-6 4h6"></path>`,
            `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>`,
            `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>`,
            `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>`,
            `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-6 4h6"></path>`
        ];
        
        investmentSections.forEach((section, index) => {
            html += `
                <div class="bg-white p-8 rounded-lg shadow-sm">
                    <div class="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                        <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            ${icons[index % icons.length]}
                        </svg>
                    </div>
                    <h3 class="text-xl font-bold text-primary mb-4 font-heading">${this.escapeHtml(section.title)}</h3>
                    <div class="text-neutral-800 font-body">${section.content}</div>
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    }

    /**
     * Generate investment sections for investments page
     * @param {Object} sections - Parsed sections object
     * @returns {string} HTML for investment sections
     */
    generateInvestmentSections(sections) {
        console.log('📋 Generating investment sections, available sections:', Object.keys(sections));
        console.log('📋 Sections to render:', sections.other.map(s => ({ title: s.title, hasIndustries: s.hasIndustries })));
        
        // Display all sections in order
        if (sections.other.length === 0) {
            console.warn('⚠️ No sections found');
            return '';
        }
        
        let html = '<div class="space-y-12">';
        
        sections.other.forEach((section, index) => {
            const bgClass = index % 2 === 0 ? 'bg-white' : 'bg-neutral-50';
            
            // Check if this section has special rendering (like industries grid)
            if (section.hasIndustries) {
                console.log('🏭 Rendering section with industries grid:', section.title);
            }
            
            html += `
                <div class="${bgClass} rounded-lg p-8">
                    <h2 class="text-2xl font-bold text-primary mb-4 font-heading">${this.escapeHtml(section.title)}</h2>
                    <div class="text-neutral-800 font-body">
                        ${section.content}
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    }

    /**
     * Generate financial products section from investments content
     * @param {Object} sections - Parsed sections object
     * @returns {string} HTML for financial products section
     */
    generateFinancialProductsSection(sections) {
        console.log('💳 Generating financial products section, available sections:', Object.keys(sections));
        
        // Look for the section that has the diverse line of products
        const productsSection = sections.other.find(section => 
            section.title.toLowerCase().includes('backing') || 
            section.title.toLowerCase().includes('diverse line')
        );
        
        if (!productsSection) {
            console.warn('⚠️ No financial products section found');
            return '';
        }
        
        return `
            <h2 class="text-3xl font-bold text-primary text-center mb-12 font-heading">
                ${this.escapeHtml(productsSection.title)}
            </h2>
            <div class="bg-neutral-100 rounded-lg p-8">
                <div class="text-neutral-800 font-body">${productsSection.content}</div>
            </div>
        `;
    }

    /**
     * Generate investment solutions grid for the investment-solutions page
     * @param {Object} sections - Parsed sections object
     * @returns {string} HTML for investment solutions grid
     */
    generateInvestmentSolutionsGrid(sections) {
        console.log('💎 Generating investment solutions grid, available sections:', Object.keys(sections));
        console.log('📋 All sections.other:', sections.other.map(s => s.title));
        
        // For investment-solutions.md, get only the first 4 core services for cards
        const coreServices = ['private equity', 'private placements', 'management buyouts', 'financial restructuring'];
        const investmentServices = sections.other.filter(section => {
            const title = section.title.toLowerCase();
            // Skip the intro section and only include core services
            return title !== 'tailored financial solutions for your business' && 
                   section.title !== '' && // Skip empty titles
                   coreServices.some(service => title.includes(service));
        });
        
        console.log('✅ Found core investment services for cards:', investmentServices.map(s => s.title));
        
        if (investmentServices.length === 0) {
            console.warn('⚠️ No investment services found');
            return '';
        }
        
        let html = `
            <h2 class="text-3xl font-bold text-primary text-center mb-12 font-heading">
                Our Core Investment Solutions
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        `;
        
        const icons = [
            // Private Equity - growth chart
            `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>`,
            // Private Placements - document
            `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>`,
            // Management Buyouts - people
            `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>`,
            // Financial Restructuring - refresh
            `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>`,
            // DIP Financing - shield
            `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>`,
            // Real Estate - office building
            `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>`,
            // Asset Based - briefcase
            `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>`
        ];
        
        investmentServices.forEach((service, index) => {
            // Extract first 1-2 sentences as summary for cleaner card display
            const firstParagraphMatch = service.content.match(/<p[^>]*>(.*?)<\/p>/);
            let summary = '';
            if (firstParagraphMatch) {
                const fullText = firstParagraphMatch[1];
                // Extract first 1-2 sentences (ending with period, exclamation, or question mark)
                const sentences = fullText.match(/[^.!?]+[.!?]+/g) || [];
                const firstTwoSentences = sentences.slice(0, 2).join(' ');
                summary = `<p class="text-neutral-800 mb-4 font-body leading-relaxed text-lg">${firstTwoSentences}</p>`;
            } else {
                summary = service.content;
            }
            
            html += `
                <div class="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <div class="flex items-start mb-6">
                        <div class="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center flex-shrink-0">
                            <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                ${icons[index % icons.length]}
                            </svg>
                        </div>
                        <div class="ml-6 flex-1">
                            <h3 class="text-2xl font-bold text-primary mb-4 font-heading">${this.escapeHtml(service.title)}</h3>
                            <div class="text-neutral-800 font-body">
                                ${summary}
                                <a href="#${service.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}" 
                                   class="inline-block mt-4 text-secondary hover:text-primary font-semibold transition-colors smooth-scroll">
                                    Learn More →
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        
        // Add detailed sections below the grid for core services only
        html += '<div class="mt-16 space-y-16">';
        
        investmentServices.forEach((service, index) => {
            const anchorId = service.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            html += `
                <div id="${anchorId}" class="scroll-mt-24">
                    <div class="bg-white rounded-lg shadow-md p-8">
                        <div class="flex items-center mb-6">
                            <div class="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mr-4">
                                <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    ${icons[index % icons.length]}
                                </svg>
                            </div>
                            <h3 class="text-2xl font-bold text-primary font-heading">${this.escapeHtml(service.title)}</h3>
                        </div>
                        <div class="text-neutral-800 font-body">
                            ${service.content}
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        
        return html;
    }

    /**
     * Generate specialized financing services section for investment solutions page
     * @param {Object} sections - Parsed sections object
     * @returns {string} HTML for specialized financing services
     */
    generateSpecializedFinancingServices(sections) {
        console.log('💼 Generating specialized financing services, available sections:', Object.keys(sections));
        console.log('📋 All sections.other:', sections.other.map(s => s.title));
        
        // Get the specialized financing services (last 3 services)
        const specializedServices = ['debtor-in-possession financing', 'real estate development financing', 'asset based financing'];
        const financingServices = sections.other.filter(section => {
            const title = section.title.toLowerCase();
            return specializedServices.some(service => title.includes(service) || 
                   (service === 'asset based financing' && title.includes('when you need more than a bank')));
        });
        
        console.log('✅ Found specialized financing services:', financingServices.map(s => s.title));
        
        if (financingServices.length === 0) {
            console.warn('⚠️ No specialized financing services found');
            return '';
        }
        
        let html = `
            <h2 class="text-3xl font-bold text-primary text-center mb-12 font-heading">
                Specialized Financing Services
            </h2>
            <div class="space-y-12">
        `;
        
        // Icons for specialized services
        const specializedIcons = [
            // DIP Financing - shield/protection
            `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>`,
            // Real Estate - building
            `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>`,
            // Asset Based - vault/safe
            `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>`
        ];
        
        financingServices.forEach((service, index) => {
            const bgClass = index % 2 === 0 ? 'bg-white' : 'bg-neutral-50';
            
            html += `
                <div class="${bgClass} rounded-lg shadow-md p-8 md:p-12 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] group cursor-pointer">
                    <div class="flex items-start mb-6">
                        <div class="bg-primary/10 rounded-full w-14 h-14 flex items-center justify-center flex-shrink-0 mr-4 transition-colors duration-300 group-hover:bg-primary/20">
                            <svg class="w-7 h-7 text-primary transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                ${specializedIcons[index % specializedIcons.length]}
                            </svg>
                        </div>
                        <h3 class="text-2xl font-bold text-primary font-heading">${this.escapeHtml(service.title)}</h3>
                    </div>
                    <div class="text-neutral-800 font-body">
                        ${service.content}
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
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