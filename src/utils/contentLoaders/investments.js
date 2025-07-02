// src/utils/contentLoaders/investments.js
import { ContentLoader } from '../contentLoader.js';
import { markdownToHtml, escapeHtml, applyContentStyling } from './shared.js';

function parseInvestmentSections(content) {
    const sections = {
        mainContent: '',
        other: [],
    };
    const sectionRegex = /^## (.+)$/gm;
    const parts = content.split(sectionRegex);
    if (parts[0]) {
        const cleanedContent = parts[0].trim().replace(/^#\s+[^\n]+\n*/, '');
        sections.mainContent = markdownToHtml(cleanedContent);
    }
    for (let i = 1; i < parts.length; i += 2) {
        const heading = parts[i];
        const sectionContent = parts[i + 1] || '';
        sections.other.push({
            title: heading,
            content: markdownToHtml(sectionContent.trim())
        });
    }
    return sections;
}

function generateInvestmentSections(sections) {
    if (!sections.other || sections.other.length === 0) return '';
    let html = '<div class="space-y-12">';
    sections.other.forEach(section => {
        html += `<div class="bg-white rounded-lg p-8"><h2>${escapeHtml(section.title)}</h2><div>${section.content}</div></div>`;
    });
    html += '</div>';
    return html;
}

export async function loadInvestmentsContent() {
    const loader = new ContentLoader();
    try {
        const { frontmatter, rawContent } = await loader.loadContent('investments');

        document.title = frontmatter.title || 'Investments';
        const titleElement = document.querySelector('h1');
        if (titleElement) titleElement.textContent = frontmatter.title;

        const subtitleElement = document.getElementById('hero-subtitle');
        if (subtitleElement) subtitleElement.textContent = frontmatter.description;

        const sections = parseInvestmentSections(rawContent);

        const mainContentContainer = document.getElementById('investments-main-content');
        if (mainContentContainer && sections.mainContent) {
            mainContentContainer.innerHTML = applyContentStyling(sections.mainContent);
        }

        const sectionsContainer = document.getElementById('investments-sections-content');
        if (sectionsContainer) {
            sectionsContainer.innerHTML = generateInvestmentSections(sections);
        }

    } catch (error) {
        console.error('Failed to load investments content:', error);
        loader.showError(document.getElementById('investments-main-content'), error.message);
    }
}
