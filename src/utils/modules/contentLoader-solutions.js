/**
 * @fileoverview ContentLoader Solutions Module
 * Specialized content loading methods for the investment solutions page.
 * 
 * This module contains methods specific to handling investment solutions content,
 * including generating investment solutions grids and specialized financing services.
 * 
 * @author Forzak LLC Development Team
 * @version 1.0.0
 */

import { ContentLoaderCore } from './contentLoader-core.js';

/**
 * ContentLoaderSolutions class extends ContentLoaderCore to add investment solutions specific functionality
 * @extends ContentLoaderCore
 */
export class ContentLoaderSolutions extends ContentLoaderCore {
    constructor() {
        super();
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
}

// Create and export an instance
export const contentLoaderSolutions = new ContentLoaderSolutions();