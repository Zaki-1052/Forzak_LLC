// src/utils/contentLoader.js
export class ContentLoader {
    constructor() {
        this.cache = new Map();
    }

    async loadContent(contentName) {
        if (this.cache.has(contentName)) {
            return this.cache.get(contentName);
        }

        try {
            const response = await fetch(`/src/content/${contentName}.md`);
            if (!response.ok) {
                throw new Error(`Failed to fetch ${contentName}.md: ${response.statusText}`);
            }
            const markdownText = await response.text();
            const parsed = this.parseMarkdown(markdownText);
            this.cache.set(contentName, parsed);
            return parsed;
        } catch (error) {
            console.error(`Failed to load content for ${contentName}:`, error);
            throw error;
        }
    }

    parseMarkdown(markdownText) {
        const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
        const match = markdownText.match(frontmatterRegex);

        let frontmatter = {};
        let content = markdownText;

        if (match) {
            const frontmatterText = match[1];
            content = match[2];
            frontmatter = this.parseFrontmatter(frontmatterText);
        }

        return {
            frontmatter,
            rawContent: content,
        };
    }

    parseFrontmatter(frontmatterText) {
        const frontmatter = {};
        const lines = frontmatterText.split('\n');
        lines.forEach(line => {
            const parts = line.split(':');
            if (parts.length >= 2) {
                const key = parts[0].trim();
                const value = parts.slice(1).join(':').trim().replace(/^['"]|['"]$/g, '');
                frontmatter[key] = value;
            }
        });
        return frontmatter;
    }

    showError(container, message) {
        if (container) {
            container.innerHTML = `<div class="text-red-500 text-center p-4">${message}</div>`;
        }
    }
}

