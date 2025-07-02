// src/utils/modules/contentLoader-about.js
// About page specific content loading functionality

import { ContentLoaderCore } from './contentLoader-core.js';

/**
 * ContentLoaderAbout - Handles about page specific content loading and rendering
 * Extends ContentLoaderCore to access shared methods like markdownToHtml and escapeHtml
 */
export class ContentLoaderAbout extends ContentLoaderCore {
    
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
}

// Create and export instance
export const contentLoaderAbout = new ContentLoaderAbout();