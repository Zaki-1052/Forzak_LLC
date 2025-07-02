// src/utils/contentLoaders/shared.js

export function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

export function markdownToHtml(markdown) {
    let html = markdown
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/gim, '<em>$1</em>')
        .replace(/\n/g, '<br>');
    return html;
}

export function applyContentStyling(htmlContent) {
    // This function can be expanded with more styling rules if needed
    return `<div class="prose max-w-none">${htmlContent}</div>`;
}

