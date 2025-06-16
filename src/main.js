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
        try {
            const content = await contentLoader.loadContent('about');
            const personnel = contentLoader.parsePersonnel(content.html);
            
            // Update page title if needed
            const titleElement = document.querySelector('h1');
            if (titleElement && content.frontmatter.title) {
                titleElement.textContent = content.frontmatter.title;
            }
            
            // Render main content
            const mainContentContainer = document.getElementById('about-main-content');
            if (mainContentContainer) {
                // Extract main description (everything before "Key Personnel")
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = content.html;
                
                // Get first few paragraphs before Key Personnel section
                const paragraphs = tempDiv.querySelectorAll('p');
                let mainContent = '';
                paragraphs.forEach(p => {
                    if (!p.textContent.includes('Sameer') && !p.textContent.includes('Nazlin')) {
                        mainContent += p.outerHTML;
                    }
                });
                
                mainContentContainer.innerHTML = mainContent;
            }
            
            // Render personnel
            const personnelContainer = document.getElementById('personnel-content');
            if (personnelContainer && personnel.length > 0) {
                let personnelHtml = '<h3 class="text-2xl font-bold text-primary mb-6">Key Personnel</h3>';
                
                personnel.forEach(person => {
                    personnelHtml += `
                        <div class="mb-8 p-6 bg-neutral-50 rounded-lg">
                            <h4 class="text-xl font-bold text-primary mb-2">${person.name}</h4>
                            <p class="text-accent-gold font-semibold mb-3">${person.title}</p>
                            <p class="text-neutral-800 leading-relaxed">${person.bio}</p>
                        </div>
                    `;
                });
                
                personnelContainer.innerHTML = personnelHtml;
            }
            
        } catch (error) {
            console.error('Failed to load about content:', error);
            contentLoader.showError(document.getElementById('about-main-content'));
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
            const investments = contentLoader.parseInvestments(content.html);
            
            // Update page title
            const titleElement = document.querySelector('h1');
            if (titleElement && content.frontmatter.title) {
                titleElement.textContent = content.frontmatter.title;
            }
            
            // Update industries section if it exists
            const industriesContainer = document.getElementById('industries-list');
            if (industriesContainer && investments.industries.length > 0) {
                let industriesHtml = '';
                investments.industries.forEach(industry => {
                    industriesHtml += `
                        <div class="bg-neutral-50 p-4 rounded-lg text-center">
                            <p class="text-sm text-neutral-800">${industry}</p>
                        </div>
                    `;
                });
                industriesContainer.innerHTML = industriesHtml;
            }
            
        } catch (error) {
            console.error('Failed to load investments content:', error);
        }
    }
};

// Auto-load content based on current page
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    console.log('Current path:', path);
    
    if (path.includes('about.html')) {
        console.log('Loading about content...');
        window.loadPageContent.about();
    } else if (path.includes('services.html')) {
        console.log('Loading services content...');
        window.loadPageContent.services();
    } else if (path.includes('investments.html')) {
        console.log('Loading investments content...');
        window.loadPageContent.investments();
    }
});

// Start Alpine
Alpine.start() 