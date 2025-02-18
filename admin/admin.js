document.addEventListener('DOMContentLoaded', () => {
    const loginSection = document.getElementById('login-section');
    const cmsSection = document.getElementById('cms-section');
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');
    const saveBtn = document.getElementById('save-content');
    const saveStatus = document.getElementById('save-status');
    
    let currentLang = 'en';
    let contentData = {};
    let isEditMode = false;

    // Login handling
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if (username === 'admin' && password === 'infratop2024') {
            loginSection.style.display = 'none';
            initializeEditMode();
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

    function initializeEditMode() {
        // Create admin toolbar
        const adminBar = document.createElement('div');
        adminBar.className = 'admin-toolbar';
        adminBar.innerHTML = `
            <div class="admin-tools">
                <select id="language-selector">
                    <option value="en">English</option>
                    <option value="fr">French</option>
                    <option value="nl">Dutch</option>
                    <option value="de">German</option>
                    <option value="it">Italian</option>
                    <option value="es">Spanish</option>
                </select>
                <button id="toggle-edit">Enable Editing</button>
                <button id="save-changes" disabled>Save Changes</button>
                <button id="logout-btn">Logout</button>
            </div>
        `;
        document.body.insertBefore(adminBar, document.body.firstChild);

        // Add edit mode styles
        const editStyles = document.createElement('style');
        editStyles.textContent = `
            .admin-toolbar {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: var(--primary-color);
                color: white;
                padding: 10px;
                z-index: 9999;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .admin-tools {
                display: flex;
                gap: 1rem;
                max-width: 1200px;
                margin: 0 auto;
                align-items: center;
            }
            .admin-tools button, .admin-tools select {
                padding: 0.5rem 1rem;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                background: white;
                color: var(--primary-color);
            }
            .admin-tools button:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            .editable {
                position: relative;
                cursor: pointer;
                transition: outline 0.3s ease;
            }
            .editable:hover {
                outline: 2px dashed var(--secondary-color);
            }
            .editable::before {
                content: '✎';
                position: absolute;
                top: -20px;
                right: 0;
                background: var(--secondary-color);
                color: var(--primary-color);
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 12px;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            .editable:hover::before {
                opacity: 1;
            }
            .edit-overlay {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 2rem;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                z-index: 10000;
            }
            .edit-overlay textarea {
                min-width: 300px;
                min-height: 100px;
            }
            .edit-overlay-buttons {
                display: flex;
                gap: 1rem;
                margin-top: 1rem;
            }
            body.admin-mode {
                padding-top: 50px;
            }
        `;
        document.head.appendChild(editStyles);

        // Initialize event listeners
        const toggleEdit = document.getElementById('toggle-edit');
        const saveChanges = document.getElementById('save-changes');
        const languageSelector = document.getElementById('language-selector');
        const logoutBtn = document.getElementById('logout-btn');

        toggleEdit.addEventListener('click', () => {
            isEditMode = !isEditMode;
            toggleEdit.textContent = isEditMode ? 'Disable Editing' : 'Enable Editing';
            saveChanges.disabled = !isEditMode;
            document.body.classList.toggle('admin-mode');
            toggleEditableElements(isEditMode);
        });

        saveChanges.addEventListener('click', saveContent);
        languageSelector.addEventListener('change', (e) => loadContent(e.target.value));
        logoutBtn.addEventListener('click', logout);
    }

    function toggleEditableElements(enable) {
        const editableElements = [
            { selector: '.hero-content h1', type: 'text' },
            { selector: '.hero-content p', type: 'text' },
            { selector: '.hero-content .cta-button', type: 'text' },
            { selector: '.products h2', type: 'text' },
            { selector: '.product-card', type: 'product' },
            { selector: '.about h2', type: 'text' },
            { selector: '.about-subtitle', type: 'text' },
            { selector: '.about-text', type: 'richtext' }
        ];

        editableElements.forEach(({ selector, type }) => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                if (enable) {
                    element.classList.add('editable');
                    element.addEventListener('click', () => openEditor(element, type));
                } else {
                    element.classList.remove('editable');
                    element.removeEventListener('click', () => openEditor(element, type));
                }
            });
        });
    }

    function openEditor(element, type) {
        if (!isEditMode) return;

        const overlay = document.createElement('div');
        overlay.className = 'edit-overlay';
        
        let editor;
        if (type === 'richtext') {
            editor = document.createElement('textarea');
            editor.value = element.innerHTML;
        } else if (type === 'text') {
            editor = document.createElement('input');
            editor.type = 'text';
            editor.value = element.textContent;
        } else if (type === 'product') {
            editor = createProductEditor(element);
        }

        const buttons = document.createElement('div');
        buttons.className = 'edit-overlay-buttons';
        buttons.innerHTML = `
            <button class="save-edit">Save</button>
            <button class="cancel-edit">Cancel</button>
        `;

        overlay.appendChild(editor);
        overlay.appendChild(buttons);
        document.body.appendChild(overlay);

        buttons.querySelector('.save-edit').addEventListener('click', () => {
            if (type === 'richtext') {
                element.innerHTML = editor.value;
            } else if (type === 'text') {
                element.textContent = editor.value;
            } else if (type === 'product') {
                updateProduct(element, editor);
            }
            overlay.remove();
        });

        buttons.querySelector('.cancel-edit').addEventListener('click', () => {
            overlay.remove();
        });
    }

    function createProductEditor(productCard) {
        const container = document.createElement('div');
        container.innerHTML = `
            <input type="text" class="product-icon" placeholder="Icon class" value="${productCard.querySelector('i').className.replace('fas ', '')}">
            <input type="text" class="product-title" placeholder="Title" value="${productCard.querySelector('h3').textContent}">
            <textarea class="product-description" placeholder="Description">${productCard.querySelector('p').textContent}</textarea>
        `;
        return container;
    }

    function updateProduct(productCard, editor) {
        const icon = productCard.querySelector('i');
        const title = productCard.querySelector('h3');
        const description = productCard.querySelector('p');

        icon.className = 'fas ' + editor.querySelector('.product-icon').value;
        title.textContent = editor.querySelector('.product-title').value;
        description.textContent = editor.querySelector('.product-description').value;
    }

    function logout() {
        isEditMode = false;
        document.body.classList.remove('admin-mode');
        document.querySelector('.admin-toolbar')?.remove();
        loginSection.style.display = 'block';
        loginForm.reset();
        window.location.reload();
    }
}); 