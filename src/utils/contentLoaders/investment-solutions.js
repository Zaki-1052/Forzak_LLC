// src/utils/contentLoaders/investment-solutions.js
import { ContentLoader } from '../contentLoader.js';
import { markdownToHtml, escapeHtml, applyContentStyling } from './shared.js';

function parseInvestmentSolutions(content) {
    const sections = {
        mainContent: '',
        other: [],
    };
    const sectionRegex = /^## (.+)$/gm;
    const parts = content.split(sectionRegex);
    if (parts[0]) {
        sections.mainContent = markdownToHtml(parts[0].trim());
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

function generateInvestmentSolutionsGrid(sections) {
    if (!sections.other) return '';
    let html = '<div class="grid grid-cols-1 md:grid-cols-2 gap-8">';
    sections.other.forEach(service => {
        html += `<div class="bg-white p-8 rounded-lg shadow-lg"><h3>${escapeHtml(service.title)}</h3><div>${service.content}</div></div>`;
    });
    html += '</div>';
    return html;
}

export async function loadInvestmentSolutionsContent() {
    const loader = new ContentLoader();
    try {
        const { frontmatter, rawContent } = await loader.loadContent('investment-solutions');

        document.title = frontmatter.title || 'Investment Solutions';
        const titleElement = document.querySelector('h1');
        if (titleElement) titleElement.textContent = frontmatter.title;

        const subtitleElement = document.getElementById('hero-subtitle');
        if (subtitleElement) subtitleElement.textContent = frontmatter.description;

        const sections = parseInvestmentSolutions(rawContent);

        const mainContentContainer = document.getElementById('solutions-main-content');
        if (mainContentContainer && sections.mainContent) {
            mainContentContainer.innerHTML = applyContentStyling(sections.mainContent);
        }

        const servicesGridContainer = document.getElementById('investment-services-grid');
        if (servicesGridContainer) {
            servicesGridContainer.innerHTML = generateInvestmentSolutionsGrid(sections);
        }

    } catch (error) {
        console.error('Failed to load investment solutions content:', error);
        loader.showError(document.getElementById('solutions-main-content'), error.message);
    }
}
