// src/utils/modules/contentLoader-investments.js
// Investment-specific content loading functionality

import { ContentLoaderCore } from './contentLoader-core.js';

/**
 * ContentLoaderInvestments class
 * Handles content loading and generation for investments-related pages
 * Extends ContentLoaderCore to access core functionality like markdownToHtml and escapeHtml
 */
export class ContentLoaderInvestments extends ContentLoaderCore {
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
        
        // Find the indices of the three special sections that need the glass image
        const backingIndex = sections.other.findIndex(s => s.title.toLowerCase().includes('backing'));
        const invitationIndex = sections.other.findIndex(s => s.title.toLowerCase().includes('personal invitation'));
        const financingIndex = sections.other.findIndex(s => s.title.toLowerCase().includes('financing needs'));
        
        // Determine if we need to create a special layout for the last three sections
        const hasSpecialSections = backingIndex !== -1 && invitationIndex !== -1 && financingIndex !== -1;
        const specialSectionIndices = hasSpecialSections ? [backingIndex, invitationIndex, financingIndex].sort((a, b) => a - b) : [];
        
        sections.other.forEach((section, index) => {
            const bgClass = index % 2 === 0 ? 'bg-white' : 'bg-neutral-50';
            
            // Check if this section has special rendering (like industries grid)
            if (section.hasIndustries) {
                console.log('🏭 Rendering section with industries grid:', section.title);
                html += `
                    <div class="${bgClass} rounded-lg p-8">
                        <h2 class="text-2xl font-bold text-primary mb-4 font-heading">${this.escapeHtml(section.title)}</h2>
                        <div class="text-neutral-800 font-body">
                            ${section.content}
                        </div>
                    </div>
                `;
            } else if (hasSpecialSections && index === specialSectionIndices[0]) {
                // Start special layout for the three sections with vertical images
                console.log('🥽 Starting special layout with vertical images for sections:', specialSectionIndices);
                
                // Generate the special sections with images layout
                html += this.generateSpecialSectionsWithImages(sections, specialSectionIndices);
            } else if (!hasSpecialSections || !specialSectionIndices.includes(index)) {
                // Regular section layout (skip if this section is part of the special group)
                html += `
                    <div class="${bgClass} rounded-lg p-8">
                        <h2 class="text-2xl font-bold text-primary mb-4 font-heading">${this.escapeHtml(section.title)}</h2>
                        <div class="text-neutral-800 font-body">
                            ${section.content}
                        </div>
                    </div>
                `;
            }
            // Skip rendering individual sections that are part of the special group (already rendered above)
        });
        
        html += '</div>';
        return html;
    }

    /**
     * Generate special sections layout with vertical images
     * @param {Object} sections - Parsed sections object  
     * @param {Array} specialSectionIndices - Indices of sections to render with images
     * @returns {string} HTML for special sections with images
     */
    generateSpecialSectionsWithImages(sections, specialSectionIndices) {
        // Configuration for vertical images - easily add/remove images here
        const verticalImagesConfig = [
            {
                filename: 'glass.png',
                alt: 'Financial analysis with magnifying glass over charts and graphs showing investment opportunities and market data'
            },
            {
                filename: 'pen.png', 
                alt: 'Professional business pen and documents representing contract signing and deal closure'
            },
            {
                filename: 'suit.png',
                alt: 'Professional business attire representing expertise and trustworthiness'
            }
        ];
        
        // For now, we'll assume all configured images exist
        // In a real implementation, you could check file existence
        const availableImages = verticalImagesConfig.filter(img => {
            // Simple check - only include glass.png and pen.png for now since suit.png doesn't exist yet
            return img.filename === 'glass.png' || img.filename === 'pen.png' || img.filename === 'suit.png';
        });
        
        console.log('🖼️ Available vertical images:', availableImages.map(img => img.filename));
        
        // Keep consistent grid layout: content always takes 3 columns, images always take 1 column
        // Images just stack vertically within that 1 column
        let html = `
            <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div class="lg:col-span-3 space-y-8">
        `;
        
        // Render all special sections
        specialSectionIndices.forEach((specialIndex, i) => {
            const specialSection = sections.other[specialIndex];
            const specialBgClass = specialIndex % 2 === 0 ? 'bg-white' : 'bg-neutral-50';
            
            // Handle special formatting for the "Backing" title to split it across two lines
            let formattedTitle = this.escapeHtml(specialSection.title);
            if (specialSection.title.toLowerCase().includes('backing') && specialSection.title.includes('–')) {
                // Replace "– " with "–<br>" to break the line after the dash
                formattedTitle = formattedTitle.replace('–&nbsp;', '–<br>').replace('– ', '–<br>');
            }
            
            html += `
                <div class="${specialBgClass} rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
                    <h2 class="text-2xl font-bold text-primary mb-4 font-heading">${formattedTitle}</h2>
                    <div class="text-neutral-800 font-body">
                        ${specialSection.content}
                    </div>
                </div>
            `;
        });
        
        html += `
                </div>
                <div class="lg:col-span-1">
                    <div class="sticky top-24 space-y-6">
        `;
        
        // Render available images
        availableImages.forEach((imageConfig, index) => {
            html += `
                <div class="aspect-[2/3] rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                    <img src="/assets/img/${imageConfig.filename}" 
                         alt="${imageConfig.alt}" 
                         class="w-full h-full object-cover object-center">
                </div>
            `;
        });
        
        html += `
                    </div>
                </div>
            </div>
        `;
        
        return html;
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
     * Generate financial products section from investments content
     * @param {Object} sections - Parsed sections object
     * @returns {string} HTML for financial products section
     */
    generateFinancialProductsSection(sections) {
        console.log('💳 Generating financial products section, available sections:', Object.keys(sections));
        
        // Don't render any specific section here to avoid duplication
        // The financial products content should be part of the main sections flow
        console.log('💳 Skipping financial products section to avoid duplication');
        return '';
    }
}

// Create and export instance
export const contentLoaderInvestments = new ContentLoaderInvestments();