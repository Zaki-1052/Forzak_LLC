// Import styles
import './styles/main.css'

// Import Alpine.js
import Alpine from 'alpinejs'

// Memoized helper to lazy load content loader only when needed
async function ensureContentLoader() {
    if (window.contentLoader) return window.contentLoader;

    const module = await import('./utils/contentLoader.js');
    window.contentLoader = module.contentLoader;
    return window.contentLoader;
}

// Fallback error display function for when contentLoader is unavailable
function showFallbackError(container, message) {
    if (!container) return;
    container.innerHTML = `
        <div style="padding: 2rem; background-color: #fee; border: 1px solid #fcc; border-radius: 8px; color: #c33;">
            <h3 style="margin-top: 0; color: #a00;">⚠️ Error Loading Content</h3>
            <p style="margin-bottom: 0;">${message || 'Failed to load content. Please refresh the page or try again later.'}</p>
        </div>
    `;
}

// Make Alpine available globally
window.Alpine = Alpine

// Content loading functions for each page
window.loadPageContent = {
    async about() {
        console.log('🏠 About page loading function called');

        let contentLoader;
        try {
            contentLoader = await ensureContentLoader();
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
            const personnelContainer = document.getElementById('personnel-content');

            if (contentLoader) {
                if (mainContentContainer) {
                    contentLoader.showError(mainContentContainer, error.message);
                }
                if (personnelContainer) {
                    contentLoader.showError(personnelContainer, error.message);
                }
            } else {
                // Fallback error display when contentLoader failed to load
                showFallbackError(mainContentContainer, error.message);
                showFallbackError(personnelContainer, error.message);
            }
        }
    },

    async services() {
        console.log('🛠️ Services page loading function called');

        let contentLoader;
        try {
            contentLoader = await ensureContentLoader();
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

            if (contentLoader) {
                if (mainContentContainer) {
                    contentLoader.showError(mainContentContainer, error.message);
                }
            } else {
                // Fallback error display when contentLoader failed to load
                showFallbackError(mainContentContainer, error.message);
            }
        }
    },

    async investments() {
        console.log('💰 Investments page loading function called');

        let contentLoader;
        try {
            contentLoader = await ensureContentLoader();
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

            if (contentLoader) {
                if (mainContentContainer) {
                    contentLoader.showError(mainContentContainer, error.message);
                }
            } else {
                // Fallback error display when contentLoader failed to load
                showFallbackError(mainContentContainer, error.message);
            }
        }
    },

    async investmentSolutions() {
        console.log('💼 Investment Solutions page loading function called');

        let contentLoader;
        try {
            contentLoader = await ensureContentLoader();
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
            
            // Render specialized financing services
            const specializedServicesContainer = document.getElementById('specialized-financing-services');
            console.log('💼 Specialized services container:', specializedServicesContainer);
            
            if (specializedServicesContainer) {
                console.log('🎨 Generating specialized financing services...');
                const specializedServicesHtml = contentLoader.generateSpecializedFinancingServices(content.sections);
                console.log('🎨 Specialized services HTML:', specializedServicesHtml);
                specializedServicesContainer.innerHTML = specializedServicesHtml;
                console.log('✅ Specialized financing services rendered');
            }
            
            console.log('🎉 Investment Solutions page loading completed successfully');

        } catch (error) {
            console.error('❌ Failed to load investment solutions content:', error);

            const mainContentContainer = document.getElementById('solutions-main-content');
            const servicesGridContainer = document.getElementById('investment-services-grid');
            const specializedServicesContainer = document.getElementById('specialized-financing-services');

            if (contentLoader) {
                if (mainContentContainer) {
                    contentLoader.showError(mainContentContainer, error.message);
                }
                if (servicesGridContainer) {
                    contentLoader.showError(servicesGridContainer, error.message);
                }
                if (specializedServicesContainer) {
                    contentLoader.showError(specializedServicesContainer, error.message);
                }
            } else {
                // Fallback error display when contentLoader failed to load
                showFallbackError(mainContentContainer, error.message);
                showFallbackError(servicesGridContainer, error.message);
                showFallbackError(specializedServicesContainer, error.message);
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
    
    if (path.includes('about.html') || path.includes('/about')) {
        console.log('✅ About page detected - calling about loader');
        window.loadPageContent.about();
    } else if (path.includes('services.html') || path.includes('/services')) {
        console.log('✅ Services page detected - calling services loader');
        window.loadPageContent.services();
    } else if (path.includes('investment-solutions.html') || path.includes('/investment-solutions')) {
        console.log('✅ Investment Solutions page detected - calling investment solutions loader');
        window.loadPageContent.investmentSolutions();
    } else if (path.includes('investments.html') || path.includes('/investments')) {
        console.log('✅ Investments page detected - calling investments loader');
        window.loadPageContent.investments();
    } else {
        console.log('ℹ️ No matching page detected for dynamic content loading');
    }
});

// Add smooth scroll behavior for anchor links
document.addEventListener('click', (e) => {
    // Check if clicked element is a smooth scroll link
    if (e.target.matches('a.smooth-scroll') || e.target.closest('a.smooth-scroll')) {
        e.preventDefault();
        const link = e.target.matches('a.smooth-scroll') ? e.target : e.target.closest('a.smooth-scroll');
        const targetId = link.getAttribute('href');
        
        if (targetId && targetId.startsWith('#')) {
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    }
});

// Start Alpine
Alpine.start() 