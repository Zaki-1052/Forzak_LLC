// src/main.js
import './styles/main.css';
import Alpine from 'alpinejs';

window.Alpine = Alpine;

document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;

    if (path.includes('about.html')) {
        import('./utils/contentLoaders/about.js').then(module => module.loadAboutContent());
    } else if (path.includes('services.html')) {
        import('./utils/contentLoaders/services.js').then(module => module.loadServicesContent());
    } else if (path.includes('investments.html')) {
        import('./utils/contentLoaders/investments.js').then(module => module.loadInvestmentsContent());
    } else if (path.includes('investment-solutions.html')) {
        import('./utils/contentLoaders/investment-solutions.js').then(module => module.loadInvestmentSolutionsContent());
    }
});

document.addEventListener('click', (e) => {
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

Alpine.start();