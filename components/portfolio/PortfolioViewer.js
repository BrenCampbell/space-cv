/**
 * PortfolioViewer.js - Clean Version with Fixed Aspect Ratio
 * 
 * High quality portfolio image viewer with proper proportions
 * No PDF download functionality - removed as requested
 */

class PortfolioViewer {
    constructor() {
        this.currentIndex = 0;
        this.isLoading = true;
        this.imagesLoaded = 0;
        this.loadErrors = [];
        this.contentContainer = null;
        
        // Portfolio data - PNG files only
        this.portfolioItems = [
            {
                src: './assets/images/portfolio/GIGiFYLandingPageFULL.png',
                alt: 'GIGiFY Landing Page Design',
                title: 'GIGiFY - Landing Page Design',
                description: 'Full landing page design for GIGiFY autonomous talent booking platform. Features modern design principles, clear call-to-actions, and responsive layout optimized for artist management industry professionals.'
            },
            {
                src: './assets/images/portfolio/GIGiFYTechnical1.png',
                alt: 'GIGiFY Technical Documentation',
                title: 'GIGiFY - Technical Architecture',
                description: 'Technical documentation and system architecture design for GIGiFY platform. Demonstrates my ability to bridge the gap between creative design and technical implementation requirements.'
            },
            {
                src: './assets/images/portfolio/CromwellKitchensFULL.png',
                alt: 'Cromwell Kitchens Full Design',
                title: 'Cromwell Kitchens - Complete Web Design',
                description: 'Full website design for Cromwell Kitchens, featuring elegant product showcases, intuitive navigation, and conversion-focused layout. Emphasizes luxury kitchen design with clean, professional aesthetics.'
            }
        ];
        
        this.totalImages = this.portfolioItems.length;
        this.loadedImages = [];
        
        this.init();
    }
    
    init() {
        console.log('🖼️ Initializing Portfolio Viewer...');
        console.log(`📁 Loading ${this.totalImages} PNG files...`);
        this.preloadImages();
    }
    
    preloadImages() {
        console.log('📥 Starting image preload process...');
        
        this.portfolioItems.forEach((item, index) => {
            console.log(`🔍 Loading image ${index + 1}: ${item.src}`);
            
            const img = new Image();
            
            img.onload = () => {
                console.log(`✅ Image ${index + 1} loaded successfully`);
                console.log(`   📐 Dimensions: ${img.naturalWidth}x${img.naturalHeight}`);
                
                this.imagesLoaded++;
                this.loadedImages[index] = img;
                
                if (this.imagesLoaded === this.totalImages) {
                    console.log('🎉 All images loaded! Updating content...');
                    this.isLoading = false;
                    this.updateContentAfterLoading();
                }
            };
            
            img.onerror = (error) => {
                console.error(`❌ Image ${index + 1} failed to load: ${item.src}`);
                
                this.loadErrors.push({
                    index: index,
                    src: item.src,
                    title: item.title,
                    error: error
                });
                
                this.imagesLoaded++;
                
                if (this.imagesLoaded === this.totalImages) {
                    console.log(`⚠️ Preload complete with ${this.loadErrors.length} errors`);
                    this.isLoading = false;
                    this.updateContentAfterLoading();
                }
            };
            
            img.src = item.src;
        });
    }
    
    updateContentAfterLoading() {
        console.log('🔄 Updating content after loading...');
        
        const contentBody = document.getElementById('content-body');
        if (contentBody) {
            console.log('📝 Found content body, updating...');
            contentBody.innerHTML = this.generatePortfolioContent();
            
            setTimeout(() => {
                this.setupEventListeners();
                console.log('✅ Portfolio content updated!');
            }, 100);
        } else {
            console.warn('⚠️ Could not find content-body element');
        }
    }
    
    generatePortfolioContent() {
        if (this.isLoading) {
            return this.generateLoadingContent();
        }
        
        if (this.loadErrors.length > 0) {
            return this.generateDebugContent();
        }
        
        return `
            <div class="portfolio-viewer">
                <div class="portfolio-main">
                    <button class="portfolio-nav portfolio-nav-left" id="portfolio-prev" ${this.currentIndex === 0 ? 'disabled' : ''}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="15,18 9,12 15,6"></polyline>
                        </svg>
                    </button>
                    
                    <div class="portfolio-viewport">
                        <div class="portfolio-image-container" id="portfolio-image-container">
                            ${this.getCurrentImageContent()}
                        </div>
                    </div>
                    
                    <button class="portfolio-nav portfolio-nav-right" id="portfolio-next" ${this.currentIndex === this.totalImages - 1 ? 'disabled' : ''}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="9,18 15,12 9,6"></polyline>
                        </svg>
                    </button>
                </div>
                
                <div class="portfolio-info">
                    <h3 class="portfolio-title" id="portfolio-title">${this.portfolioItems[this.currentIndex].title}</h3>
                    <p class="portfolio-description" id="portfolio-description">${this.portfolioItems[this.currentIndex].description}</p>
                </div>
                
                <div class="portfolio-thumbnails">
                    ${this.portfolioItems.map((item, index) => `
                        <button class="portfolio-thumb ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                            <div class="portfolio-thumb-number">${index + 1}</div>
                        </button>
                    `).join('')}
                </div>
            </div>
            
            <style>
                .portfolio-viewer {
                    width: 100%;
                    max-width: 100%;
                    color: #E0F7FF;
                }
                
                .portfolio-main {
                    position: relative;
                    display: flex;
                    align-items: center;
                    margin-bottom: 24px;
                    gap: 16px;
                }
                
                .portfolio-nav {
                    background: rgba(0, 12, 24, 0.8);
                    border: 2px solid #0078B4;
                    border-radius: 8px;
                    color: #E0F7FF;
                    width: 48px;
                    height: 48px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    flex-shrink: 0;
                    z-index: 10;
                }
                
                .portfolio-nav:hover:not(:disabled) {
                    background: rgba(0, 20, 40, 0.9);
                    border-color: #00FFFF;
                    transform: scale(1.05);
                }
                
                .portfolio-nav:disabled {
                    opacity: 0.3;
                    cursor: not-allowed;
                    transform: none !important;
                }
                
                .portfolio-viewport {
                    flex: 1;
                    background: rgba(0, 0, 0, 0.5);
                    border: 2px solid #0078B4;
                    border-radius: 8px;
                    overflow: hidden;
                    position: relative;
                    
                    /* Dynamic height based on available space */
                    width: 100%;
                    height: 70vh;
                    min-height: 600px;
                    max-height: none; /* Allow full expansion */
                }
                
                .portfolio-image-container {
                    width: 100%;
                    height: 100%;
                    overflow-y: auto;
                    overflow-x: hidden;
                    position: relative;
                    scrollbar-width: thin;
                    scrollbar-color: #0078B4 rgba(0, 12, 24, 0.3);
                    scroll-behavior: smooth;
                }
                
                .portfolio-image-container::-webkit-scrollbar {
                    width: 12px;
                }
                
                .portfolio-image-container::-webkit-scrollbar-track {
                    background: rgba(0, 12, 24, 0.3);
                    border-radius: 6px;
                }
                
                .portfolio-image-container::-webkit-scrollbar-thumb {
                    background: #0078B4;
                    border-radius: 6px;
                    border: 2px solid rgba(0, 12, 24, 0.3);
                }
                
                .portfolio-image-container::-webkit-scrollbar-thumb:hover {
                    background: #00AAFF;
                }
                
                .portfolio-image {
                    width: 100%;
                    height: auto;
                    display: block;
                    image-rendering: -webkit-optimize-contrast;
                    image-rendering: crisp-edges;
                    image-rendering: optimizeQuality;
                    object-fit: contain;
                    object-position: top center;
                    vertical-align: top;
                    max-width: none;
                    min-width: 100%;
                }
                
                .portfolio-info {
                    background: linear-gradient(135deg, rgba(0, 120, 180, 0.1) 0%, rgba(0, 80, 140, 0.05) 100%);
                    border: 1px solid rgba(0, 120, 180, 0.3);
                    border-radius: 8px;
                    padding: 20px;
                    margin-bottom: 20px;
                }
                
                .portfolio-title {
                    color: #E0F7FF;
                    font-size: 18px;
                    font-weight: 600;
                    margin-bottom: 12px;
                    margin-top: 0;
                }
                
                .portfolio-description {
                    color: #B8E6FF;
                    font-size: 14px;
                    line-height: 1.6;
                    margin: 0;
                }
                
                .portfolio-thumbnails {
                    display: flex;
                    justify-content: center;
                    gap: 12px;
                    margin-bottom: 16px;
                }
                
                .portfolio-thumb {
                    background: rgba(0, 12, 24, 0.6);
                    border: 2px solid rgba(0, 120, 180, 0.3);
                    border-radius: 6px;
                    width: 48px;
                    height: 32px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: monospace;
                    font-weight: 600;
                }
                
                .portfolio-thumb.active {
                    border-color: #00FFFF;
                    background: rgba(0, 120, 180, 0.2);
                    box-shadow: 0 0 8px rgba(0, 255, 255, 0.3);
                }
                
                .portfolio-thumb:hover {
                    border-color: #0078B4;
                    background: rgba(0, 120, 180, 0.1);
                }
                
                .portfolio-thumb-number {
                    color: #B8E6FF;
                    font-size: 12px;
                }
                
                .portfolio-thumb.active .portfolio-thumb-number {
                    color: #00FFFF;
                }
                
                .portfolio-loading {
                    text-align: center;
                    padding: 60px 20px;
                    color: #B8E6FF;
                }
                
                .portfolio-loading-spinner {
                    width: 48px;
                    height: 48px;
                    border: 3px solid rgba(0, 120, 180, 0.3);
                    border-top: 3px solid #00FFFF;
                    border-radius: 50%;
                    animation: portfolio-spin 1s linear infinite;
                    margin: 0 auto 20px;
                }
                
                @keyframes portfolio-spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                @media (max-width: 768px) {
                    .portfolio-main { gap: 8px; }
                    .portfolio-nav { width: 40px; height: 40px; }
                    .portfolio-viewport { 
                        height: 60vh;
                        min-height: 500px;
                        max-height: 600px;
                    }
                    .portfolio-title { font-size: 16px; }
                    .portfolio-description { font-size: 13px; }
                    .portfolio-thumbnails { gap: 8px; }
                    .portfolio-thumb { width: 36px; height: 24px; }
                }
                
                body.cockpit-active .portfolio-viewer {
                    font-size: 12px;
                }
                
                body.cockpit-active .portfolio-viewport {
                    height: 50vh;
                    min-height: 400px;
                    max-height: 500px;
                }
                
                body.cockpit-active .portfolio-title {
                    font-size: 14px;
                    margin-bottom: 8px;
                }
                
                body.cockpit-active .portfolio-description {
                    font-size: 11px;
                    line-height: 1.5;
                }
                    /* Full-screen portfolio mode enhancements */
                .modal-portfolio .portfolio-viewport {
                    height: calc(100vh - 300px);
                    min-height: 700px;
                    max-height: calc(100vh - 250px);
                }
                
                .modal-portfolio .portfolio-main {
                    margin-bottom: 32px;
                }
                
                .modal-portfolio .portfolio-info {
                    margin-bottom: 32px;
                    padding: 24px;
                }
                
                .modal-portfolio .portfolio-title {
                    font-size: 22px;
                    margin-bottom: 16px;
                }
                
                .modal-portfolio .portfolio-description {
                    font-size: 16px;
                    line-height: 1.7;
                }
                
                .modal-portfolio .portfolio-thumbnails {
                    margin-bottom: 24px;
                    gap: 16px;
                }
                
                .modal-portfolio .portfolio-thumb {
                    width: 60px;
                    height: 40px;
                }
                
                @media (max-width: 768px) {
                    .modal-portfolio .portfolio-viewport {
                        height: calc(100vh - 250px);
                        min-height: 500px;
                    }
                    
                    .modal-portfolio .portfolio-title {
                        font-size: 18px;
                    }
                    
                    .modal-portfolio .portfolio-description {
                        font-size: 14px;
                    }
                }
                
                @media (max-width: 480px) {
                    .modal-portfolio .portfolio-viewport {
                        height: calc(100vh - 200px);
                        min-height: 400px;
                    }
                }
            </style>
        `;
    }
    
    getCurrentImageContent() {
        const currentItem = this.portfolioItems[this.currentIndex];
        const loadedImage = this.loadedImages[this.currentIndex];
        
        if (loadedImage) {
            return `
                <img 
                    id="portfolio-image" 
                    src="${currentItem.src}"
                    alt="${currentItem.alt}"
                    class="portfolio-image"
                />
            `;
        } else {
            return `
                <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #FFB3B3;">
                    <div style="text-align: center;">
                        <h3>❌ Image Failed to Load</h3>
                        <p>${currentItem.title}</p>
                        <code style="background: rgba(255,107,107,0.1); padding: 4px; border-radius: 4px;">${currentItem.src}</code>
                    </div>
                </div>
            `;
        }
    }
    
    generateLoadingContent() {
        return `
            <div class="portfolio-loading">
                <div class="portfolio-loading-spinner"></div>
                <h3>Loading Portfolio Images...</h3>
                <p>Processing ${this.totalImages} PNG files</p>
                <p style="font-family: monospace; font-size: 12px; color: #B8E6FF; margin-top: 20px;">
                    Loaded: ${this.imagesLoaded}/${this.totalImages}
                </p>
            </div>
        `;
    }
    
    generateDebugContent() {
        return `
            <div style="padding: 20px; color: #FFB3B3; font-family: monospace; font-size: 12px;">
                <h3 style="color: #FF6B6B;">🔍 Portfolio Debug Information</h3>
                <p>✅ Successful: ${this.imagesLoaded - this.loadErrors.length}/${this.totalImages}</p>
                <p>❌ Failed: ${this.loadErrors.length}/${this.totalImages}</p>
                
                ${this.loadErrors.map(error => `
                    <div style="background: rgba(255,107,107,0.1); padding: 12px; margin: 8px 0; border-radius: 4px;">
                        <strong>${error.title}</strong><br>
                        Path: ${error.src}
                    </div>
                `).join('')}
                
                <div style="margin-top: 20px; text-align: center;">
                    <p style="color: #B8E6FF;">Portfolio images failed to load properly.</p>
                </div>
            </div>
        `;
    }
    
    setupEventListeners() {
        console.log('🎮 Setting up navigation listeners...');
        
        const prevBtn = document.getElementById('portfolio-prev');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousImage());
        }
        
        const nextBtn = document.getElementById('portfolio-next');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextImage());
        }
        
        const thumbs = document.querySelectorAll('.portfolio-thumb');
        thumbs.forEach((thumb, index) => {
            thumb.addEventListener('click', () => this.goToImage(index));
        });
        
        console.log('✅ Navigation listeners setup complete');
    }
    
    previousImage() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.updatePortfolioDisplay();
            console.log(`📸 Previous: ${this.currentIndex + 1}/${this.totalImages}`);
        }
    }
    
    nextImage() {
        if (this.currentIndex < this.totalImages - 1) {
            this.currentIndex++;
            this.updatePortfolioDisplay();
            console.log(`📸 Next: ${this.currentIndex + 1}/${this.totalImages}`);
        }
    }
    
    goToImage(index) {
        if (index >= 0 && index < this.totalImages && index !== this.currentIndex) {
            this.currentIndex = index;
            this.updatePortfolioDisplay();
            console.log(`📸 Jump to: ${this.currentIndex + 1}/${this.totalImages}`);
        }
    }
    
    updatePortfolioDisplay() {
        const container = document.getElementById('portfolio-image-container');
        if (container) {
            container.innerHTML = this.getCurrentImageContent();
        }
        
        const title = document.getElementById('portfolio-title');
        if (title) title.textContent = this.portfolioItems[this.currentIndex].title;
        
        const description = document.getElementById('portfolio-description');
        if (description) description.textContent = this.portfolioItems[this.currentIndex].description;
        
        const counter = document.getElementById('portfolio-current');
        if (counter) counter.textContent = this.currentIndex + 1;
        
        const prevBtn = document.getElementById('portfolio-prev');
        const nextBtn = document.getElementById('portfolio-next');
        
        if (prevBtn) prevBtn.disabled = this.currentIndex === 0;
        if (nextBtn) nextBtn.disabled = this.currentIndex === this.totalImages - 1;
        
        const thumbs = document.querySelectorAll('.portfolio-thumb');
        thumbs.forEach((thumb, index) => {
            thumb.classList.toggle('active', index === this.currentIndex);
        });
        
        const container2 = document.getElementById('portfolio-image-container');
        if (container2) {
            container2.scrollTop = 0;
        }
    }
    
    getPortfolioContent() {
        window.portfolioViewer = this;
        const content = this.generatePortfolioContent();
        
        setTimeout(() => {
            if (!this.isLoading) {
                this.setupEventListeners();
            }
        }, 100);
        
        return content;
    }
    
    isReady() {
        return !this.isLoading;
    }
    
    dispose() {
        console.log('🗑️ Portfolio viewer disposed');
    }
}

export { PortfolioViewer };

if (typeof window !== 'undefined') {
    window.PortfolioViewer = PortfolioViewer;
}