document.addEventListener('DOMContentLoaded', () => {
    // Mobile menu functionality
    const mobileMenuBtn = document.querySelector('.mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    
    mobileMenuBtn.addEventListener('click', () => {
        navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            // Special handling for home link
            if (this.getAttribute('href') === '#home') {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
                // Show hero content with animation
                const heroContent = document.querySelector('.hero-content');
                if (heroContent) {
                    // Reset any existing transitions
                    heroContent.style.transition = 'none';
                    heroContent.style.opacity = '0';
                    heroContent.style.transform = 'translateY(20px)';
                    
                    // Force a reflow
                    heroContent.offsetHeight;
                    
                    // Add the animation
                    heroContent.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
                    heroContent.style.opacity = '1';
                    heroContent.style.transform = 'translateY(0)';
                }
            } else {
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            }
            
            // Close mobile menu if open
            if (window.innerWidth <= 768) {
                navLinks.style.display = 'none';
            }
        });
    });

    // Form submission handling
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData);
            
            // Here you would typically send the data to your backend
            console.log('Form submitted:', data);
            
            // Show success message
            alert('Thank you for your message! We will get back to you soon.');
            contactForm.reset();
        });
    }

    // Scroll-based animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, {
        threshold: 0.1
    });

    // Observe all service cards for animation
    document.querySelectorAll('.service-card').forEach(card => {
        observer.observe(card);
    });

    // Language selector functionality
    const languageBtn = document.querySelector('.language-btn');
    const languageDropdown = document.querySelector('.language-dropdown');

    // Toggle dropdown when clicking the language button
    languageBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        languageDropdown.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function() {
        languageDropdown.classList.remove('show');
    });

    // Prevent dropdown from closing when clicking inside it
    languageDropdown.addEventListener('click', function(e) {
        e.stopPropagation();
    });

    // Update selected language
    const languageOptions = document.querySelectorAll('.language-option');
    languageOptions.forEach(option => {
        option.addEventListener('click', () => {
            const selectedFlag = option.querySelector('img').src;
            const selectedLang = option.querySelector('span').textContent;
            const currentFlag = languageBtn.querySelector('img');
            currentFlag.src = selectedFlag;
            languageDropdown.classList.remove('show');
        });
    });
}); 