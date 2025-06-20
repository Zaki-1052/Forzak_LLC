// Import styles
import './styles/main.css'

// Import Alpine.js
import Alpine from 'alpinejs'

// Import content loader
import { contentLoader } from './utils/contentLoader.js'

// Make Alpine available globally
window.Alpine = Alpine

// Make content loader available globally
window.contentLoader = contentLoader

// Content loading functions for each page
window.loadPageContent = {
    async about() {
        console.log('🏠 About page loading function called');
        
        try {
            console.log('🔄 Loading about content...');
            const content = await contentLoader.loadContent('about');
            console.log('✅ About content loaded successfully:', content);
            
            // Update page title if needed
            const titleElement = document.querySelector('h1');
            console.log('🏷️ Title element:', titleElement);
            if (titleElement && content.frontmatter.title) {
                console.log(`📝 Updating title from "${titleElement.textContent}" to "${content.frontmatter.title}"`);
                titleElement.textContent = content.frontmatter.title;
            }
            
            // Update hero subtitle if needed
            const subtitleElement = document.getElementById('hero-subtitle');
            console.log('📄 Subtitle element:', subtitleElement);
            if (subtitleElement && content.frontmatter.description) {
                console.log(`📝 Updating subtitle to: "${content.frontmatter.description}"`);
                subtitleElement.textContent = content.frontmatter.description;
            }
            
            // Render main content with proper styling
            const mainContentContainer = document.getElementById('about-main-content');
            console.log('📦 Main content container:', mainContentContainer);
            console.log('📄 Main content data:', content.sections.mainContent);
            
            if (mainContentContainer && content.sections.mainContent) {
                console.log('🎨 Applying styling to main content...');
                const styledContent = contentLoader.applyContentStyling(content.sections.mainContent);
                console.log('🎨 Styled content:', styledContent);
                mainContentContainer.innerHTML = styledContent;
                console.log('✅ Main content rendered');
            } else {
                console.warn('⚠️ Main content container or content missing');
            }
            
            // Render services section
            const servicesContainer = document.getElementById('services-content');
            console.log('🛠️ Services container:', servicesContainer);
            console.log('🛠️ Sections data:', content.sections);
            
            if (servicesContainer) {
                console.log('🎨 Generating services section...');
                const servicesHtml = contentLoader.generateServicesSection(content.sections);
                console.log('🎨 Services HTML:', servicesHtml);
                servicesContainer.innerHTML = servicesHtml;
                console.log('✅ Services content rendered');
            } else {
                console.warn('⚠️ Services container missing');
            }
            
            // Render personnel with styled cards
            const personnelContainer = document.getElementById('personnel-content');
            console.log('👥 Personnel container:', personnelContainer);
            console.log('👥 Personnel data:', content.sections.personnel);
            
            if (personnelContainer && content.sections.personnel.length > 0) {
                console.log('🎨 Generating personnel cards...');
                const personnelHtml = contentLoader.generatePersonnelCards(content.sections.personnel);
                console.log('🎨 Personnel HTML:', personnelHtml);
                personnelContainer.innerHTML = personnelHtml;
                console.log('✅ Personnel content rendered');
            } else {
                console.warn('⚠️ Personnel container missing or no personnel data');
            }
            
            console.log('🎉 About page loading completed successfully');
            
        } catch (error) {
            console.error('❌ Failed to load about content:', error);
            
            const mainContentContainer = document.getElementById('about-main-content');
            if (mainContentContainer) {
                contentLoader.showError(mainContentContainer, error.message);
            }
            
            const personnelContainer = document.getElementById('personnel-content');
            if (personnelContainer) {
                contentLoader.showError(personnelContainer, error.message);
            }
        }
    },

    async services() {
        console.log('🛠️ Services page loading function called');
        
        try {
            console.log('🔄 Loading services content...');
            const content = await contentLoader.loadContent('services');
            console.log('✅ Services content loaded successfully:', content);
            
            // Update page title if needed
            const titleElement = document.querySelector('h1');
            console.log('🏷️ Title element:', titleElement);
            if (titleElement && content.frontmatter.title) {
                console.log(`📝 Updating title from "${titleElement.textContent}" to "${content.frontmatter.title}"`);
                titleElement.textContent = content.frontmatter.title;
            }
            
            // Update hero subtitle if needed
            const subtitleElement = document.getElementById('hero-subtitle');
            console.log('📄 Subtitle element:', subtitleElement);
            if (subtitleElement && content.frontmatter.description) {
                console.log(`📝 Updating subtitle to: "${content.frontmatter.description}"`);
                subtitleElement.textContent = content.frontmatter.description;
            }
            
            // Render main description content
            const mainContentContainer = document.getElementById('services-main-content');
            console.log('📦 Main content container:', mainContentContainer);
            console.log('📄 Available content sections:', Object.keys(content.sections));
            
            if (mainContentContainer && content.sections.servicesMainDescription) {
                console.log('🎨 Applying styling to services main description...');
                const styledContent = contentLoader.applyContentStyling(content.sections.servicesMainDescription);
                console.log('🎨 Styled content:', styledContent);
                mainContentContainer.innerHTML = styledContent;
                console.log('✅ Main description content rendered');
            } else if (mainContentContainer && content.sections.mainContent) {
                console.log('🎨 Fallback: Using mainContent...');
                const styledContent = contentLoader.applyContentStyling(content.sections.mainContent);
                mainContentContainer.innerHTML = styledContent;
            } else {
                console.warn('⚠️ No main description content found');
            }
            
            // Render core values section
            const coreValuesContainer = document.getElementById('core-values-content');
            console.log('💎 Core values container:', coreValuesContainer);
            
            if (coreValuesContainer) {
                console.log('🎨 Generating core values section...');
                const coreValuesHtml = contentLoader.generateCoreValuesSection(content.sections);
                console.log('🎨 Core values HTML:', coreValuesHtml);
                coreValuesContainer.innerHTML = coreValuesHtml;
                console.log('✅ Core values content rendered');
            }
            
            // Render services sections
            const servicesSectionsContainer = document.getElementById('services-sections-content');
            console.log('🛠️ Services sections container:', servicesSectionsContainer);
            
            if (servicesSectionsContainer) {
                console.log('🎨 Generating services sections...');
                const servicesSectionsHtml = contentLoader.generateServicesSections(content.sections);
                console.log('🎨 Services sections HTML:', servicesSectionsHtml);
                servicesSectionsContainer.innerHTML = servicesSectionsHtml;
                console.log('✅ Services sections content rendered');
            }
            
            console.log('🎉 Services page loading completed successfully');
            
        } catch (error) {
            console.error('❌ Failed to load services content:', error);
            
            const mainContentContainer = document.getElementById('services-main-content');
            if (mainContentContainer) {
                contentLoader.showError(mainContentContainer, error.message);
            }
        }
    },

    async investments() {
        console.log('💰 Investments page loading function called');
        
        try {
            console.log('🔄 Loading investments content...');
            const content = await contentLoader.loadContent('investments');
            console.log('✅ Investments content loaded successfully:', content);
            
            // Update page title if needed
            const titleElement = document.querySelector('h1');
            console.log('🏷️ Title element:', titleElement);
            if (titleElement && content.frontmatter.title) {
                console.log(`📝 Updating title from "${titleElement.textContent}" to "${content.frontmatter.title}"`);
                titleElement.textContent = content.frontmatter.title;
            }
            
            // Update hero subtitle if needed
            const subtitleElement = document.getElementById('hero-subtitle');
            console.log('📄 Subtitle element:', subtitleElement);
            if (subtitleElement && content.frontmatter.description) {
                console.log(`📝 Updating subtitle to: "${content.frontmatter.description}"`);
                subtitleElement.textContent = content.frontmatter.description;
            }
            
            // Render main content with title
            const mainContentContainer = document.getElementById('investments-main-content');
            const mainTitleElement = document.getElementById('main-content-title');
            console.log('📦 Main content container:', mainContentContainer);
            
            if (mainContentContainer && content.sections.mainContent) {
                // Set the first section title if available
                if (mainTitleElement && content.sections.firstSectionTitle) {
                    mainTitleElement.textContent = content.sections.firstSectionTitle;
                    console.log('📝 Set main content title:', content.sections.firstSectionTitle);
                }
                
                console.log('🎨 Applying styling to main content...');
                const styledContent = contentLoader.applyContentStyling(content.sections.mainContent);
                console.log('🎨 Styled content:', styledContent);
                mainContentContainer.innerHTML = styledContent;
                console.log('✅ Main content rendered');
            }
            
            // Render additional sections
            const sectionsContainer = document.getElementById('investments-sections-content');
            console.log('📄 Sections container:', sectionsContainer);
            
            if (sectionsContainer) {
                console.log('🎨 Generating additional sections...');
                const sectionsHtml = contentLoader.generateInvestmentSections(content.sections);
                console.log('🎨 Sections HTML:', sectionsHtml);
                sectionsContainer.innerHTML = sectionsHtml;
                console.log('✅ Additional sections rendered');
            }
            
            // Render industries section
            const industriesContainer = document.getElementById('industries-list');
            console.log('🏭 Industries container:', industriesContainer);
            console.log('🏭 Industries data:', content.sections.industries);
            
            if (industriesContainer && content.sections.industries.length > 0) {
                console.log('🎨 Generating industry cards...');
                const industriesHtml = contentLoader.generateIndustryCards(content.sections.industries);
                console.log('🎨 Industries HTML:', industriesHtml);
                industriesContainer.innerHTML = industriesHtml;
                console.log('✅ Industries content rendered');
            } else {
                console.warn('⚠️ Industries container missing or no industries data');
            }
            
            
            // Render financial products section
            const financialProductsContainer = document.getElementById('financial-products-content');
            console.log('💳 Financial products container:', financialProductsContainer);
            
            if (financialProductsContainer) {
                console.log('🎨 Generating financial products section...');
                const financialProductsHtml = contentLoader.generateFinancialProductsSection(content.sections);
                console.log('🎨 Financial products HTML:', financialProductsHtml);
                financialProductsContainer.innerHTML = financialProductsHtml;
                console.log('✅ Financial products content rendered');
            }
            
            console.log('🎉 Investments page loading completed successfully');
            
        } catch (error) {
            console.error('❌ Failed to load investments content:', error);
            
            const mainContentContainer = document.getElementById('investments-main-content');
            if (mainContentContainer) {
                contentLoader.showError(mainContentContainer, error.message);
            }
            
            const industriesContainer = document.getElementById('industries-list');
            if (industriesContainer) {
                contentLoader.showError(industriesContainer, error.message);
            }
        }
    },

    async investmentSolutions() {
        console.log('💼 Investment Solutions page loading function called');
        
        try {
            console.log('🔄 Loading investment solutions content...');
            const content = await contentLoader.loadContent('investment-solutions');
            console.log('✅ Investment solutions content loaded successfully:', content);
            
            // Update page title if needed
            const titleElement = document.querySelector('h1');
            console.log('🏷️ Title element:', titleElement);
            if (titleElement && content.frontmatter.title) {
                console.log(`📝 Updating title from "${titleElement.textContent}" to "${content.frontmatter.title}"`);
                titleElement.textContent = content.frontmatter.title;
            }
            
            // Update hero subtitle if needed
            const subtitleElement = document.getElementById('hero-subtitle');
            console.log('📄 Subtitle element:', subtitleElement);
            if (subtitleElement && content.frontmatter.description) {
                console.log(`📝 Updating subtitle to: "${content.frontmatter.description}"`);
                subtitleElement.textContent = content.frontmatter.description;
            }
            
            // Render main content
            const mainContentContainer = document.getElementById('solutions-main-content');
            console.log('📦 Main content container:', mainContentContainer);
            
            if (mainContentContainer && content.sections.mainContent) {
                console.log('🎨 Applying styling to main content...');
                const styledContent = contentLoader.applyContentStyling(content.sections.mainContent);
                console.log('🎨 Styled content:', styledContent);
                mainContentContainer.innerHTML = styledContent;
                console.log('✅ Main content rendered');
            }
            
            // Render investment services grid
            const servicesGridContainer = document.getElementById('investment-services-grid');
            console.log('📊 Services grid container:', servicesGridContainer);
            
            if (servicesGridContainer) {
                console.log('🎨 Generating investment services grid...');
                const servicesGridHtml = contentLoader.generateInvestmentSolutionsGrid(content.sections);
                console.log('🎨 Services grid HTML:', servicesGridHtml);
                servicesGridContainer.innerHTML = servicesGridHtml;
                console.log('✅ Investment services grid rendered');
            }
            
            console.log('🎉 Investment Solutions page loading completed successfully');
            
        } catch (error) {
            console.error('❌ Failed to load investment solutions content:', error);
            
            const mainContentContainer = document.getElementById('solutions-main-content');
            if (mainContentContainer) {
                contentLoader.showError(mainContentContainer, error.message);
            }
            
            const servicesGridContainer = document.getElementById('investment-services-grid');
            if (servicesGridContainer) {
                contentLoader.showError(servicesGridContainer, error.message);
            }
        }
    }
};

// Auto-load content based on current page
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM Content Loaded event fired');
    const path = window.location.pathname;
    console.log('📍 Current path:', path);
    console.log('🔧 Available loadPageContent methods:', Object.keys(window.loadPageContent));
    
    if (path.includes('about.html')) {
        console.log('✅ About page detected - calling about loader');
        window.loadPageContent.about();
    } else if (path.includes('services.html')) {
        console.log('✅ Services page detected - calling services loader');
        window.loadPageContent.services();
    } else if (path.includes('investment-solutions.html')) {
        console.log('✅ Investment Solutions page detected - calling investment solutions loader');
        window.loadPageContent.investmentSolutions();
    } else if (path.includes('investments.html')) {
        console.log('✅ Investments page detected - calling investments loader');
        window.loadPageContent.investments();
    } else {
        console.log('ℹ️ No matching page detected for dynamic content loading');
    }
});

// Start Alpine
Alpine.start() 