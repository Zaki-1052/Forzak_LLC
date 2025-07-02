// src/utils/contentLoaders/services.js
import { ContentLoader } from '../contentLoader.js';
import { markdownToHtml, escapeHtml, applyContentStyling } from './shared.js';

function parseServicesContent(content) {
    const sections = {
        servicesMainDescription: '',
        coreValues: [],
        serviceAreas: []
    };
    const mainDescMatch = content.match(/### Forzak Will Do More for Your Business\s*\n\n([^#]*?)(?=###|##|$)/s);
    if (mainDescMatch) {
        sections.servicesMainDescription = markdownToHtml(mainDescMatch[1].trim());
    }
    
    const coreValuesPattern = /### (Core Values|Creativity & Rigour|Relationship Driven|Objective Advice)\s*\n\n((?:(?!###|##)[\s\S])*)/g;
    let coreValuesMatch;
    while ((coreValuesMatch = coreValuesPattern.exec(content)) !== null) {
        sections.coreValues.push({
            title: coreValuesMatch[1],
            content: markdownToHtml(coreValuesMatch[2].trim())
        });
    }

    const sectionParts = content.split(/^## /gm);
    for (let i = 1; i < sectionParts.length; i++) {
        const sectionText = sectionParts[i];
        const lines = sectionText.split('\n');
        const title = lines[0].trim();
        const sectionContent = lines.slice(1).join('\n').trim();
        if (title !== 'Market Leading Advisory Firm') {
            sections.serviceAreas.push({
                title,
                content: markdownToHtml(sectionContent),
                rawContent: sectionContent
            });
        }
    }
    return sections;
}

function generateCoreValuesSection(sections) {
    if (!sections.coreValues || sections.coreValues.length === 0) return '';
    let html = '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">';
    // Simplified version of the original generator
    sections.coreValues.forEach(value => {
        html += `<div class="bg-white p-6 rounded-lg shadow-sm"><h3>${escapeHtml(value.title)}</h3><div>${value.content}</div></div>`;
    });
    html += '</div>';
    return html;
}

function generateServicesSections(sections) {
    if (!sections.serviceAreas || sections.serviceAreas.length === 0) return '';
    let html = '';
    // Simplified version of the original generator
    sections.serviceAreas.forEach(area => {
        html += `<div class="mb-8"><h3>${escapeHtml(area.title)}</h3><div>${area.content}</div></div>`;
    });
    return html;
}

export async function loadServicesContent() {
    const loader = new ContentLoader();
    try {
        const { frontmatter, rawContent } = await loader.loadContent('services');

        document.title = frontmatter.title || 'Services';
        const titleElement = document.querySelector('h1');
        if (titleElement) titleElement.textContent = frontmatter.title;

        const subtitleElement = document.getElementById('hero-subtitle');
        if (subtitleElement) subtitleElement.textContent = frontmatter.description;

        const sections = parseServicesContent(rawContent);

        const mainContentContainer = document.getElementById('services-main-content');
        if (mainContentContainer && sections.servicesMainDescription) {
            mainContentContainer.innerHTML = applyContentStyling(sections.servicesMainDescription);
        }

        const coreValuesContainer = document.getElementById('core-values-content');
        if (coreValuesContainer) {
            coreValuesContainer.innerHTML = generateCoreValuesSection(sections);
        }

        const servicesSectionsContainer = document.getElementById('services-sections-content');
        if (servicesSectionsContainer) {
            servicesSectionsContainer.innerHTML = generateServicesSections(sections);
        }

    } catch (error) {
        console.error('Failed to load services content:', error);
        loader.showError(document.getElementById('services-main-content'), error.message);
    }
}