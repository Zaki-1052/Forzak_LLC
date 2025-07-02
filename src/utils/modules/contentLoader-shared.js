// src/utils/modules/contentLoader-shared.js
// Shared content parsing functionality used by multiple pages
// Contains parseContentSections method and its dependencies

import { ContentLoaderCore } from './contentLoader-core.js';

/**
 * Shared content loading functionality for parsing content sections
 * Extends ContentLoaderCore to access base methods like markdownToHtml and escapeHtml
 */
export class ContentLoaderShared extends ContentLoaderCore {
    /**
     * Parse content into sections based on headings
     * Extracted from original contentLoader.js (lines 150-250)
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
}