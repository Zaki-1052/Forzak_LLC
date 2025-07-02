// src/utils/modules/contentLoader-services.js
// Services-specific content loading functionality

import { ContentLoaderCore } from './contentLoader-core.js';

/**
 * ContentLoaderServices class - handles services page specific content loading and parsing
 * Extends ContentLoaderCore to access shared functionality like markdownToHtml and escapeHtml
 */
export class ContentLoaderServices extends ContentLoaderCore {
    constructor() {
        super();
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
}