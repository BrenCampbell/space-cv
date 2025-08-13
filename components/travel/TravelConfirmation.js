/**
 * TravelConfirmation.js - Enhanced Travel Confirmation Modal Component
 * 
 * UPDATED VERSION: Now uses .panel base classes for consistency
 * Maintains all functionality while using standardized styling
 */

class TravelConfirmation {
    constructor(travelSystem) {
        this.travelSystem = travelSystem;
        this.isVisible = false;
        this.selectedPlanet = null;
        
        // Create confirmation modal elements
        this.modal = null;
        this.overlay = null;
        
        this.init();
    }
    
    init() {
        console.log('📋 Initializing Enhanced TravelConfirmation with Panel Classes...');
        this.createConfirmationModal();
        console.log('✅ Enhanced TravelConfirmation initialized');
    }
    
    /**
     * Create the enhanced travel confirmation modal using panel classes
     */
    createConfirmationModal() {
        // Create overlay using existing overlay class
        this.overlay = document.createElement('div');
        this.overlay.className = 'travel-confirmation-overlay overlay hidden';
        
        // Create modal using panel base class instead of inline styles
        this.modal = document.createElement('div');
        this.modal.className = 'panel-holographic-travel travel-confirmation-panel';
        this.modal.style.cssText = `
            position: relative;
            max-width: 450px;
            margin: 20px;
            transition: all 0.3s ease-out;
            transform: scale(0.9);
            z-index: 501;
        `;
        
        // Enhanced modal content with proper panel structure
        this.modal.innerHTML = `
            <!-- Panel Header -->
            <div class="ui-panel-header">
                <div class="panel-title travel-confirmation-title">Travel to Planet?</div>
            </div>
            
            <!-- Panel Body -->
            <div class="ui-panel-body">
                <!-- Planet Info Section -->
                <div class="planet-info-section" style="
                    background: linear-gradient(135deg, rgba(0, 120, 180, 0.1) 0%, rgba(0, 80, 140, 0.05) 100%);
                    border-radius: 8px;
                    padding: 16px;
                    margin-bottom: 16px;
                    border-left: 3px solid #0078B4;
                ">
                    <div class="planet-details">
                        <h3 id="travel-planet-name" style="
                            color: #E0F7FF;
                            margin-bottom: 8px;
                            font-size: 16px;
                            font-weight: 600;
                        ">Planet Name</h3>
                        <p id="travel-planet-description" style="
                            color: #B8E6FF;
                            font-size: 13px;
                            line-height: 1.5;
                            margin-bottom: 12px;
                        ">Planet description</p>
                        
                        <!-- Travel Details Grid -->
                        <div class="travel-details-grid" style="
                            display: grid;
                            grid-template-columns: 1fr 1fr;
                            gap: 12px;
                        ">
                            <!-- Fuel Cost -->
                            <div class="travel-cost-info" style="
                                display: flex;
                                flex-direction: column;
                                align-items: center;
                                background: rgba(0, 120, 180, 0.1);
                                padding: 10px;
                                border-radius: 6px;
                                border: 1px solid rgba(0, 120, 180, 0.2);
                            ">
                                <span class="text-sm" style="color: #B8E6FF; margin-bottom: 4px;">Fuel Required</span>
                                <span id="travel-fuel-cost" style="
                                    color: #00FFFF;
                                    font-weight: 600;
                                    font-size: 14px;
                                ">0 Units</span>
                            </div>
                            
                            <!-- Travel Time -->
                            <div class="travel-time-info" style="
                                display: flex;
                                flex-direction: column;
                                align-items: center;
                                background: rgba(0, 120, 180, 0.1);
                                padding: 10px;
                                border-radius: 6px;
                                border: 1px solid rgba(0, 120, 180, 0.2);
                            ">
                                <span class="text-sm" style="color: #B8E6FF; margin-bottom: 4px;">Travel Time</span>
                                <span id="travel-time-duration" style="
                                    color: #00FFFF;
                                    font-weight: 600;
                                    font-size: 14px;
                                ">10 seconds</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Panel Footer (Custom for buttons) -->
            <div class="ui-panel-footer travel-confirmation-footer" style="
                display: flex;
                gap: 12px;
                justify-content: center;
                padding: 16px 20px;
                border-top: 1px solid rgba(0, 120, 180, 0.3);
            ">
                <button id="travel-cancel-btn" class="btn btn-ghost" style="
                    background: transparent;
                    color: #E0F7FF;
                    border: 2px solid #0078B4;
                    border-radius: 6px;
                    padding: 10px 20px;
                    font-size: 13px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    min-height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">Return to Orbit</button>
                
                <button id="travel-confirm-btn" class="btn btn-danger" style="
                    background: linear-gradient(135deg, #E74C3C, #C0392B);
                    color: #FFFFFF;
                    border: none;
                    border-radius: 6px;
                    padding: 10px 20px;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    min-height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 0 10px rgba(231, 76, 60, 0.3);
                    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
                ">INITIATE LAUNCH!</button>
            </div>
        `;
        
        // Add modal to overlay
        this.overlay.appendChild(this.modal);
        
        // Add to document
        document.body.appendChild(this.overlay);
        
        // Add event listeners (ALL FUNCTIONALITY PRESERVED)
        this.setupEventListeners();
    }
    
    /**
     * Setup event listeners for modal interactions
     * ALL ORIGINAL FUNCTIONALITY PRESERVED
     */
    setupEventListeners() {
        // Cancel button - EXACT SAME FUNCTIONALITY
        const cancelBtn = document.getElementById('travel-cancel-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.handleCancel();
            });
            
            // Hover effects
            cancelBtn.addEventListener('mouseenter', () => {
                cancelBtn.style.background = 'rgba(0, 120, 180, 0.1)';
                cancelBtn.style.borderColor = '#00FFFF';
            });
            
            cancelBtn.addEventListener('mouseleave', () => {
                cancelBtn.style.background = 'transparent';
                cancelBtn.style.borderColor = '#0078B4';
            });
        }
        
        // Enhanced confirm button with dangerous red styling - EXACT SAME FUNCTIONALITY
        const confirmBtn = document.getElementById('travel-confirm-btn');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                this.handleConfirm();
            });
            
            // Enhanced hover effects for danger button
            confirmBtn.addEventListener('mouseenter', () => {
                confirmBtn.style.background = 'linear-gradient(135deg, #C0392B, #A93226)';
                confirmBtn.style.transform = 'translateY(-2px) scale(1.02)';
                confirmBtn.style.boxShadow = '0 0 15px rgba(231, 76, 60, 0.5), 0 4px 8px rgba(0, 0, 0, 0.3)';
            });
            
            confirmBtn.addEventListener('mouseleave', () => {
                confirmBtn.style.background = 'linear-gradient(135deg, #E74C3C, #C0392B)';
                confirmBtn.style.transform = 'translateY(0) scale(1)';
                confirmBtn.style.boxShadow = '0 0 10px rgba(231, 76, 60, 0.3)';
            });
            
            // Press effect
            confirmBtn.addEventListener('mousedown', () => {
                confirmBtn.style.transform = 'translateY(1px) scale(0.98)';
            });
            
            confirmBtn.addEventListener('mouseup', () => {
                confirmBtn.style.transform = 'translateY(-2px) scale(1.02)';
            });
        }
        
        // Close on overlay click - EXACT SAME FUNCTIONALITY
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.handleCancel();
            }
        });
        
        // Escape key handling - EXACT SAME FUNCTIONALITY
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.handleCancel();
            }
        });
    }
    
    /**
     * Show confirmation modal for selected planet
     * ALL ORIGINAL FUNCTIONALITY PRESERVED
     */
    show(planet) {
        if (this.isVisible) return;
        
        console.log(`🌍 Showing enhanced travel confirmation for ${planet.getInfo().name}`);
        
        this.selectedPlanet = planet;
        this.isVisible = true;
        
        // RESET BUTTON STATES when showing new confirmation
        this.resetButtonStates();
        
        // Update modal content
        this.updateModalContent(planet);
        
        // Show modal with animation
        this.overlay.classList.remove('hidden');
        
        // Trigger entrance animation
        setTimeout(() => {
            this.overlay.style.opacity = '1';
            this.modal.style.transform = 'scale(1)';
        }, 50);
    }
    
    /**
     * Update modal content with planet information and travel details
     * ALL ORIGINAL FUNCTIONALITY PRESERVED
     */
    updateModalContent(planet) {
        const planetInfo = planet.getInfo();
        
        // Update planet name
        const nameElement = document.getElementById('travel-planet-name');
        if (nameElement) {
            nameElement.textContent = planetInfo.name;
        }
        
        // Update planet description
        const descElement = document.getElementById('travel-planet-description');
        if (descElement) {
            descElement.textContent = planetInfo.description;
        }
        
        // Update fuel cost (always 0 for now)
        const fuelElement = document.getElementById('travel-fuel-cost');
        if (fuelElement) {
            fuelElement.textContent = `${this.travelSystem.travelConfig.fuelCost} Units`;
        }
        
        // Update travel time
        const timeElement = document.getElementById('travel-time-duration');
        if (timeElement) {
            const travelDuration = this.travelSystem.travelConfig.defaultDuration / 1000; // Convert to seconds
            timeElement.textContent = `${travelDuration} seconds`;
        }
        
        // Update title to include planet name
        const titleElement = document.querySelector('.travel-confirmation-title');
        if (titleElement) {
            titleElement.textContent = `Travel to ${planetInfo.name}?`;
        }
    }
    
    /**
     * Hide confirmation modal
     * ALL ORIGINAL FUNCTIONALITY PRESERVED
     */
    hide() {
        if (!this.isVisible) return;
        
        console.log('❌ Hiding travel confirmation');
        
        this.isVisible = false;
        
        // Animate out
        this.overlay.style.opacity = '0';
        this.modal.style.transform = 'scale(0.9)';
        
        // Hide after animation
        setTimeout(() => {
            this.overlay.classList.add('hidden');
        }, 300);
        
        this.selectedPlanet = null;
        
        // RESET BUTTON STATES when hiding
        this.resetButtonStates();
    }
    
    /**
     * Reset button states to default
     * ALL ORIGINAL FUNCTIONALITY PRESERVED
     */
    resetButtonStates() {
        const confirmBtn = document.getElementById('travel-confirm-btn');
        const cancelBtn = document.getElementById('travel-cancel-btn');
        
        if (confirmBtn) {
            confirmBtn.disabled = false;
            confirmBtn.style.opacity = '1';
            confirmBtn.style.transform = 'scale(1)';
            confirmBtn.innerHTML = 'INITIATE LAUNCH!';
            confirmBtn.style.background = 'linear-gradient(135deg, #E74C3C, #C0392B)';
            confirmBtn.style.animation = 'none';
        }
        
        if (cancelBtn) {
            cancelBtn.disabled = false;
            cancelBtn.style.opacity = '1';
        }
        
        console.log('🔄 Button states reset to default');
    }
    
    /**
     * Handle cancel button click
     * ALL ORIGINAL FUNCTIONALITY PRESERVED
     */
    handleCancel() {
        console.log('🚫 Travel cancelled by user');
        this.travelSystem.cancelTravel();
        this.hide();
    }
    
    /**
     * Handle confirm button click with enhanced feedback
     * ALL ORIGINAL FUNCTIONALITY PRESERVED
     */
    handleConfirm() {
        if (!this.selectedPlanet) {
            console.error('❌ No planet selected for travel');
            return;
        }
        
        console.log(`🚀 LAUNCH INITIATED to ${this.selectedPlanet.getInfo().name}`);
        
        // Enhanced button feedback for launch - EXACT SAME FUNCTIONALITY
        const confirmBtn = document.getElementById('travel-confirm-btn');
        const cancelBtn = document.getElementById('travel-cancel-btn');
        
        if (confirmBtn) {
            confirmBtn.disabled = true;
            confirmBtn.style.opacity = '0.7';
            confirmBtn.style.transform = 'scale(0.95)';
            confirmBtn.innerHTML = '🔥 LAUNCHING...';
            confirmBtn.style.background = 'linear-gradient(135deg, #8B0000, #A0522D)';
            confirmBtn.style.animation = 'pulse 0.5s ease-in-out infinite alternate';
        }
        
        if (cancelBtn) {
            cancelBtn.disabled = true;
            cancelBtn.style.opacity = '0.5';
        }
        
        // Add CSS animation for pulse effect - EXACT SAME FUNCTIONALITY
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                from { box-shadow: 0 0 10px rgba(231, 76, 60, 0.3); }
                to { box-shadow: 0 0 20px rgba(231, 76, 60, 0.6), 0 0 30px rgba(255, 69, 0, 0.4); }
            }
        `;
        document.head.appendChild(style);
        
        // Start travel sequence with dramatic delay - EXACT SAME TIMING
        setTimeout(() => {
            this.travelSystem.startTravelSequence();
        }, 800);
    }
    
    /**
     * Check if confirmation modal is visible
     * ALL ORIGINAL FUNCTIONALITY PRESERVED
     */
    isModalVisible() {
        return this.isVisible;
    }
    
    /**
     * Dispose of confirmation modal
     * ALL ORIGINAL FUNCTIONALITY PRESERVED
     */
    dispose() {
        if (this.overlay && this.overlay.parentNode) {
            this.overlay.parentNode.removeChild(this.overlay);
        }
        
        this.overlay = null;
        this.modal = null;
        this.selectedPlanet = null;
        this.isVisible = false;
        
        console.log('🗑️ Enhanced TravelConfirmation disposed');
    }
}

// Export for ES6 modules
export { TravelConfirmation };

// Fallback for older browsers
if (typeof window !== 'undefined') {
    window.TravelConfirmation = TravelConfirmation;
}