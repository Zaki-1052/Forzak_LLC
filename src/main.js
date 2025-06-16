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
        try {
            const content = await contentLoader.loadContent('services');
            const services = contentLoader.parseServices(content.html);
            
            // Update page title
            const titleElement = document.querySelector('h1');
            if (titleElement && content.frontmatter.title) {
                titleElement.textContent = content.frontmatter.title;
            }
            
            // The services page already has a good structure, 
            // we can enhance it with dynamic content as needed
            console.log('Services content loaded:', services);
            
        } catch (error) {
            console.error('Failed to load services content:', error);
        }
    },

    async investments() {
        try {
            const content = await contentLoader.loadContent('investments');
            console.log('Investments content loaded:', content);
            
            // Update page title
            const titleElement = document.querySelector('h1');
            if (titleElement && content.frontmatter.title) {
                titleElement.textContent = content.frontmatter.title;
            }
            
            // Update industries section if it exists
            const industriesContainer = document.getElementById('industries-list');
            if (industriesContainer && content.sections.industries.length > 0) {
                const industriesHtml = contentLoader.generateIndustryCards(content.sections.industries);
                industriesContainer.innerHTML = industriesHtml;
            }
            
        } catch (error) {
            console.error('Failed to load investments content:', error);
            contentLoader.showError(document.getElementById('industries-list'));
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
    } else if (path.includes('investments.html')) {
        console.log('✅ Investments page detected - calling investments loader');
        window.loadPageContent.investments();
    } else {
        console.log('ℹ️ No matching page detected for dynamic content loading');
    }
});

// Start Alpine
Alpine.start() 