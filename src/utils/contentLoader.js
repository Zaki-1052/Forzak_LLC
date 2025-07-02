// Content loader utility for dynamic markdown content
// This is the main ContentLoader class that composes all modular functionality

import { ContentLoaderCore } from './modules/contentLoader-core.js';
import { ContentLoaderShared } from './modules/contentLoader-shared.js';
import { ContentLoaderAbout } from './modules/contentLoader-about.js';
import { ContentLoaderServices } from './modules/contentLoader-services.js';
import { ContentLoaderInvestments } from './modules/contentLoader-investments.js';
import { ContentLoaderSolutions } from './modules/contentLoader-solutions.js';

/**
 * Main ContentLoader class that composes all page-specific loaders
 * Uses composition pattern to combine functionality from different modules
 */
export class ContentLoader {
    constructor() {
        // Initialize all module instances
        this.core = new ContentLoaderCore();
        this.shared = new ContentLoaderShared();
        this.about = new ContentLoaderAbout();
        this.services = new ContentLoaderServices();
        this.investments = new ContentLoaderInvestments();
        this.solutions = new ContentLoaderSolutions();
        
        // Bind core methods directly to this instance for backward compatibility
        this.cache = this.core.cache;
        // loadContent is overridden below to coordinate parsing
        this.parseMarkdown = this.core.parseMarkdown.bind(this.core);
        this.parseFrontmatter = this.core.parseFrontmatter.bind(this.core);
        this.markdownToHtml = this.core.markdownToHtml.bind(this.core);
        this.applyContentStyling = this.core.applyContentStyling.bind(this.core);
        this.escapeHtml = this.core.escapeHtml.bind(this.core);
        this.renderContent = this.core.renderContent.bind(this.core);
        this.showLoading = this.core.showLoading.bind(this.core);
        this.showError = this.core.showError.bind(this.core);
        
        // Bind shared methods
        this.parseContentSections = this.shared.parseContentSections.bind(this.shared);
        this.parseServicesContent = this.shared.parseServicesContent.bind(this.shared);
        this.parsePersonnel = this.shared.parsePersonnel.bind(this.shared);
        this.parseServices = this.shared.parseServices.bind(this.shared);
        this.parseInvestmentSectionWithIndustries = this.shared.parseInvestmentSectionWithIndustries.bind(this.shared);
        this.extractIndustries = this.shared.extractIndustries.bind(this.shared);
        
        // Bind about page methods
        this.generatePersonnelCards = this.about.generatePersonnelCards.bind(this.about);
        this.generateServicesSection = this.about.generateServicesSection.bind(this.about);
        this.generateServicesFromArray = this.about.generateServicesFromArray.bind(this.about);
        this.formatServiceList = this.about.formatServiceList.bind(this.about);
        
        // Bind services page methods
        this.generateCoreValuesSection = this.services.generateCoreValuesSection.bind(this.services);
        this.generateServicesSections = this.services.generateServicesSections.bind(this.services);
        this.parseManagementConsultingSubsections = this.services.parseManagementConsultingSubsections.bind(this.services);
        this.getManagementConsultingIntro = this.services.getManagementConsultingIntro.bind(this.services);
        this.parseMergersAcquisitionsSubsections = this.services.parseMergersAcquisitionsSubsections.bind(this.services);
        
        // Bind investments page methods
        this.generateInvestmentSections = this.investments.generateInvestmentSections.bind(this.investments);
        this.generateSpecialSectionsWithImages = this.investments.generateSpecialSectionsWithImages.bind(this.investments);
        this.generateInvestmentServicesSection = this.investments.generateInvestmentServicesSection.bind(this.investments);
        this.generateIndustryCards = this.investments.generateIndustryCards.bind(this.investments);
        this.generateFinancialProductsSection = this.investments.generateFinancialProductsSection.bind(this.investments);
        
        // Bind investment solutions page methods
        this.generateInvestmentSolutionsGrid = this.solutions.generateInvestmentSolutionsGrid.bind(this.solutions);
        this.generateSpecializedFinancingServices = this.solutions.generateSpecializedFinancingServices.bind(this.solutions);
        
        // Additional deprecated/unused methods for backward compatibility
        this.parseInvestments = this.parseInvestments.bind(this);
    }
    
    /**
     * Override loadContent to coordinate between core and shared modules
     * @param {string} contentName - Name of the content file (without .md extension)
     * @returns {Promise<Object>} Parsed content with frontmatter, sections, and HTML
     */
    async loadContent(contentName) {
        // Check cache first
        if (this.cache.has(contentName)) {
            return this.cache.get(contentName);
        }

        try {
            // Use core's loadContent to get basic parsing (frontmatter + rawContent)
            const basicParsed = await this.core.loadContent(contentName);
            
            // Now parse the content into sections using shared module
            const sections = this.shared.parseContentSections(basicParsed.rawContent);
            
            // Combine everything into the full parsed result
            const fullParsed = {
                frontmatter: basicParsed.frontmatter,
                sections: sections,
                rawContent: basicParsed.rawContent
            };
            
            // Cache the full result
            this.cache.set(contentName, fullParsed);
            console.log(`💾 Full content cached for: ${contentName}`);
            
            return fullParsed;
        } catch (error) {
            console.error(`❌ Failed to load content: ${contentName}`, error);
            throw error;
        }
    }
    
    /**
     * Parse investments content (deprecated - kept for compatibility)
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
}

// Create global instance
export const contentLoader = new ContentLoader();