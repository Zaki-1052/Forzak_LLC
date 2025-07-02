// src/utils/contentLoaders/about.js
import { ContentLoader } from '../contentLoader.js';
import { markdownToHtml, escapeHtml, applyContentStyling } from './shared.js';

function parsePersonnel(sectionContent) {
    const personnel = [];
    const entries = sectionContent.split('**').filter(entry => entry.trim());
    for (let i = 0; i < entries.length; i += 2) {
        const nameTitle = entries[i].split('–').map(s => s.trim());
        const name = nameTitle[0];
        const title = nameTitle[1];
        const bio = markdownToHtml(entries[i+1].trim());
        personnel.push({ name, title, bio });
    }
    return personnel;
}

function generatePersonnelCards(personnel) {
    if (!personnel || personnel.length === 0) return '';
    
    let html = `
        <h3 class="text-3xl font-bold text-primary mb-12 font-heading text-center">Key Personnel</h3>
        <div class="grid grid-cols-1 lg:grid-cols-1 gap-8">
    `;
    personnel.forEach(person => {
        html += `
            <div class="personnel-card bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
                <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                    <div class="lg:col-span-1">
                        <div class="w-32 h-32 mx-auto bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full flex items-center justify-center">
                            <svg class="w-16 h-16 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                            </svg>
                        </div>
                    </div>
                    <div class="lg:col-span-3">
                        <h4 class="text-2xl font-bold text-primary mb-2 font-heading">
                            ${person.name === 'Sameer Alibhai' ? 
                                `<a href="https://www.linkedin.com/in/sameer-alibhai-0b878321/" target="_blank" rel="noopener noreferrer" class="hover:text-secondary transition-colors">${escapeHtml(person.name)}</a>` : 
                                escapeHtml(person.name)
                            }
                        </h4>
                        <p class="text-xl text-accent-gold font-semibold mb-4 font-heading">${escapeHtml(person.title)}</p>
                        <div class="text-neutral-800 leading-relaxed font-body space-y-4">${person.bio}</div>
                    </div>
                </div>
            </div>
        `;
    });
    html += '</div>';
    return html;
}

export async function loadAboutContent() {
    const loader = new ContentLoader();
    try {
        const { frontmatter, rawContent } = await loader.loadContent('about');
        
        document.title = frontmatter.title || 'About Us';
        const titleElement = document.querySelector('h1');
        if (titleElement) titleElement.textContent = frontmatter.title;

        const subtitleElement = document.getElementById('hero-subtitle');
        if (subtitleElement) subtitleElement.textContent = frontmatter.description;

        const sections = {};
        const parts = rawContent.split(/\n## /);
        sections.mainContent = markdownToHtml(parts[0]);
        
        for (let i = 1; i < parts.length; i++) {
            const sectionParts = parts[i].split(/\n/);
            const heading = sectionParts[0].trim();
            const content = sectionParts.slice(1).join('\n');
            if (heading.toLowerCase().includes('personnel')) {
                sections.personnel = parsePersonnel(content);
            }
        }

        const mainContentContainer = document.getElementById('about-main-content');
        if (mainContentContainer && sections.mainContent) {
            mainContentContainer.innerHTML = applyContentStyling(sections.mainContent);
        }

        const personnelContainer = document.getElementById('personnel-content');
        if (personnelContainer && sections.personnel) {
            personnelContainer.innerHTML = generatePersonnelCards(sections.personnel);
        }

    } catch (error) {
        console.error('Failed to load about content:', error);
        loader.showError(document.getElementById('about-main-content'), error.message);
    }
}
