document.addEventListener('DOMContentLoaded', () => {
    const loginOverlay = document.getElementById('login-overlay');
    const cmsSection = document.getElementById('cms-section');
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');
    const saveBtn = document.getElementById('save-content');
    const saveStatus = document.getElementById('save-status');
    const languageSelector = document.getElementById('language-selector');
    
    let currentLang = 'en';
    let contentData = {};

    // Login handling
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if (username === 'admin' && password === 'infratop2024') {
            loginOverlay.style.display = 'none';
            cmsSection.style.display = 'block';
            loadContent();
        } else {
            alert('Invalid credentials. Please try again.');
        }
    });

    // Logout handling
    logoutBtn.addEventListener('click', () => {
        loginOverlay.style.display = 'flex';
        cmsSection.style.display = 'none';
        loginForm.reset();
    });

    // Language selector handling
    languageSelector.addEventListener('change', (e) => {
        currentLang = e.target.value;
        loadContent();
    });

    // Add product card
    document.getElementById('add-product').addEventListener('click', () => {
        const productCards = document.getElementById('product-cards');
        const newCard = createProductCardEditor();
        productCards.appendChild(newCard);
    });

    // Save content
    saveBtn.addEventListener('click', async () => {
        saveStatus.textContent = 'Saving changes...';
        const content = gatherContent();
        try {
            await saveContent(content);
            saveStatus.textContent = 'Changes saved successfully!';
            setTimeout(() => {
                saveStatus.textContent = '';
            }, 3000);
        } catch (error) {
            saveStatus.textContent = 'Error saving changes. Please try again.';
            console.error('Error saving content:', error);
        }
    });

    function createProductCardEditor(data = {}) {
        const card = document.createElement('div');
        card.className = 'product-card-editor';
        card.innerHTML = `
            <div class="card-header">
                <h3>Product Card</h3>
                <button class="delete-product" type="button">&times;</button>
            </div>
            <div class="editor-group">
                <label>Icon Class</label>
                <input type="text" class="content-input icon-input" placeholder="e.g., fa-car-battery" value="${data.icon || ''}">
                <label>Title</label>
                <input type="text" class="content-input title-input" placeholder="Product Title" value="${data.title || ''}">
                <label>Description</label>
                <textarea class="content-textarea description-input" placeholder="Product Description" rows="3">${data.description || ''}</textarea>
            </div>
        `;

        card.querySelector('.delete-product').addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this product card?')) {
                card.remove();
            }
        });

        return card;
    }

    async function loadContent() {
        try {
            // First try to load from localStorage
            const savedContent = localStorage.getItem('infratop_content');
            if (savedContent) {
                contentData = JSON.parse(savedContent);
            } else {
                // If not in localStorage, try to load from content.json
                const response = await fetch('../content/content.json');
                contentData = await response.json();
            }
            displayContent();
        } catch (error) {
            console.error('Error loading content:', error);
            alert('Error loading content. Please try again.');
        }
    }

    function displayContent() {
        const data = contentData[currentLang] || {};
        
        // Hero section
        document.getElementById('hero-title').value = data.hero?.title || '';
        document.getElementById('hero-subtitle').value = data.hero?.subtitle || '';
        document.getElementById('hero-cta').value = data.hero?.ctaText || '';

        // Products section
        document.getElementById('products-title').value = data.products?.title || '';
        const productCards = document.getElementById('product-cards');
        productCards.innerHTML = '';
        (data.products?.items || []).forEach(product => {
            productCards.appendChild(createProductCardEditor(product));
        });

        // About section
        document.getElementById('about-title').value = data.about?.title || '';
        document.getElementById('about-subtitle').value = data.about?.subtitle || '';
        document.getElementById('about-content').value = data.about?.content || '';
    }

    function gatherContent() {
        const content = {...contentData};
        content[currentLang] = {
            hero: {
                title: document.getElementById('hero-title').value,
                subtitle: document.getElementById('hero-subtitle').value,
                ctaText: document.getElementById('hero-cta').value
            },
            products: {
                title: document.getElementById('products-title').value,
                items: Array.from(document.querySelectorAll('.product-card-editor')).map(card => ({
                    icon: card.querySelector('.icon-input').value,
                    title: card.querySelector('.title-input').value,
                    description: card.querySelector('.description-input').value
                }))
            },
            about: {
                title: document.getElementById('about-title').value,
                subtitle: document.getElementById('about-subtitle').value,
                content: document.getElementById('about-content').value
            }
        };
        return content;
    }

    async function saveContent(content) {
        try {
            // Save to localStorage
            localStorage.setItem('infratop_content', JSON.stringify(content));
            
            // Update the main page content
            updateMainPageContent(content[currentLang]);
            
            return true;
        } catch (error) {
            console.error('Error saving content:', error);
            throw error;
        }
    }

    function updateMainPageContent(langContent) {
        // Get the main page window
        const mainPage = window.opener || window.parent;
        if (!mainPage) return;

        try {
            // Update hero section
            const heroTitle = mainPage.document.querySelector('.hero-content h1');
            const heroSubtitle = mainPage.document.querySelector('.hero-content p');
            const heroCTA = mainPage.document.querySelector('.hero-content .cta-button');
            
            if (heroTitle) heroTitle.textContent = langContent.hero.title;
            if (heroSubtitle) heroSubtitle.textContent = langContent.hero.subtitle;
            if (heroCTA) heroCTA.textContent = langContent.hero.ctaText;

            // Update products section
            const productsTitle = mainPage.document.querySelector('.products h2');
            const productCards = mainPage.document.querySelector('.products-grid');
            
            if (productsTitle) productsTitle.textContent = langContent.products.title;
            if (productCards) {
                productCards.innerHTML = langContent.products.items.map(product => `
                    <div class="product-card">
                        <i class="fas ${product.icon}"></i>
                        <h3>${product.title}</h3>
                        <p>${product.description}</p>
                    </div>
                `).join('');
            }

            // Update about section
            const aboutTitle = mainPage.document.querySelector('.about h2');
            const aboutSubtitle = mainPage.document.querySelector('.about-subtitle');
            const aboutContent = mainPage.document.querySelector('.about-text');
            
            if (aboutTitle) aboutTitle.textContent = langContent.about.title;
            if (aboutSubtitle) aboutSubtitle.textContent = langContent.about.subtitle;
            if (aboutContent) aboutContent.textContent = langContent.about.content;
        } catch (error) {
            console.error('Error updating main page:', error);
        }
    }
}); 