document.addEventListener('DOMContentLoaded', () => {
    const loginSection = document.getElementById('login-section');
    const cmsSection = document.getElementById('cms-section');
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');
    const saveBtn = document.getElementById('save-content');
    const saveStatus = document.getElementById('save-status');
    
    let currentLang = 'en';
    let contentData = {};

    // Login handling
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Simple authentication (replace with proper authentication in production)
        if (username === 'admin' && password === 'infratop2024') {
            loginSection.style.display = 'none';
            cmsSection.style.display = 'block';
            loadContent();
        } else {
            alert('Invalid credentials');
        }
    });

    // Logout handling
    logoutBtn.addEventListener('click', () => {
        loginSection.style.display = 'block';
        cmsSection.style.display = 'none';
        loginForm.reset();
    });

    // Language tab handling
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentLang = btn.dataset.lang;
            displayContent();
        });
    });

    // Add product card
    document.getElementById('add-product').addEventListener('click', () => {
        const productCards = document.getElementById('product-cards');
        const newCard = createProductCardEditor();
        productCards.appendChild(newCard);
    });

    // Save content
    saveBtn.addEventListener('click', async () => {
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
                <button class="delete-product">&times;</button>
            </div>
            <input type="text" class="content-input" placeholder="Icon Class (e.g., fa-car-battery)" value="${data.icon || ''}">
            <input type="text" class="content-input" placeholder="Title" value="${data.title || ''}">
            <textarea class="content-textarea" placeholder="Description" rows="3">${data.description || ''}</textarea>
        `;

        card.querySelector('.delete-product').addEventListener('click', () => {
            card.remove();
        });

        return card;
    }

    async function loadContent() {
        try {
            const response = await fetch('../content/content.json');
            contentData = await response.json();
            displayContent();
        } catch (error) {
            console.error('Error loading content:', error);
            contentData = {};
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
        const content = contentData;
        content[currentLang] = {
            hero: {
                title: document.getElementById('hero-title').value,
                subtitle: document.getElementById('hero-subtitle').value,
                ctaText: document.getElementById('hero-cta').value
            },
            products: {
                title: document.getElementById('products-title').value,
                items: Array.from(document.querySelectorAll('.product-card-editor')).map(card => ({
                    icon: card.querySelector('input:nth-child(2)').value,
                    title: card.querySelector('input:nth-child(3)').value,
                    description: card.querySelector('textarea').value
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
            // Save content to localStorage
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
        // Update hero section
        const heroTitle = document.querySelector('.hero-content h1');
        const heroSubtitle = document.querySelector('.hero-content p');
        const heroCTA = document.querySelector('.hero-content .cta-button');
        
        if (heroTitle) heroTitle.textContent = langContent.hero.title;
        if (heroSubtitle) heroSubtitle.textContent = langContent.hero.subtitle;
        if (heroCTA) heroCTA.textContent = langContent.hero.ctaText;

        // Update products section
        const productsTitle = document.querySelector('.products h2');
        const productCards = document.querySelector('.products-grid');
        
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
        const aboutTitle = document.querySelector('.about h2');
        const aboutSubtitle = document.querySelector('.about-subtitle');
        const aboutContent = document.querySelector('.about-text');
        
        if (aboutTitle) aboutTitle.textContent = langContent.about.title;
        if (aboutSubtitle) aboutSubtitle.textContent = langContent.about.subtitle;
        if (aboutContent) aboutContent.textContent = langContent.about.content;
    }
}); 