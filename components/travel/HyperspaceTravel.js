/**
 * HyperspaceTravel.js - FIXED: Scene Management & 3D Rendering Issue
 * 
 * REAL PROBLEM FOUND: Stars weren't visible because of scene clearing/management
 * FIX: Proper scene state management and camera setup during travel
 */

class HyperspaceTravel {
    constructor(travelSystem) {
        this.travelSystem = travelSystem;
        this.scene = travelSystem.scene;
        this.camera = travelSystem.camera;
        this.renderer = travelSystem.renderer;
        
        // Travel state
        this.isActive = false;
        this.currentPhase = 'idle';
        this.selectedPlanet = null;
        this.startTime = 0;
        
        // HTML Elements
        this.blackScreen = null;
        this.cockpitOverlay = null;
        
        // 3D Elements
        this.travelGroup = new THREE.Group();
        this.stars = [];
        this.approachPlanet = null;
        
        // Animation properties
        this.warpSpeed = 0;
        this.maxWarpSpeed = 15;
        this.acceleration = 1.0;
        this.starCount = 150; // Reduced for better performance
        
        // Timing configuration
        this.phaseTimings = {
            hyperspace: 4000,     // 4 seconds of hyperspace
            approach: 3000,       // 3 seconds of planet approach
            transition: 500
        };
        
        // Full screen bounds for stars
        this.screenBounds = {
            left: -60, right: 60,
            top: 40, bottom: -40,
            near: 5, far: 120
        };
        
        // Store original scene state
        this.originalSceneState = {
            background: null,
            fog: null,
            clearColor: null,
            clearAlpha: null
        };
        
        this.init();
    }
    
    init() {
        console.log('🚀 Initializing FIXED Travel System...');
        
        // Create HTML layers
        this.createBackgroundLayer();
        this.createCockpitLayer();
        
        // Create 3D travel elements
        this.createHyperspaceStars();
        this.setupTravelGroup();
        
        console.log('✅ FIXED Travel System initialized');
    }
    
    /**
     * Create background layer (black space)
     */
    createBackgroundLayer() {
        this.blackScreen = document.createElement('div');
        this.blackScreen.id = 'travel-background';
        this.blackScreen.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #000000;
            z-index: 0;
            display: none;
            pointer-events: none;
        `;
        
        document.body.appendChild(this.blackScreen);
        console.log('⚫ Black background layer created');
    }
    
    /**
     * Create minimal cockpit interface
     */
    createCockpitLayer() {
        this.cockpitOverlay = document.createElement('div');
        this.cockpitOverlay.id = 'travel-cockpit';
        this.cockpitOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 10;
            display: none;
            pointer-events: none;
        `;
        
        this.cockpitOverlay.innerHTML = `
            <!-- Travel Status Dashboard -->
            <div style="
                position: absolute;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.8);
                border: 2px solid #00FFFF;
                border-radius: 8px;
                padding: 12px 24px;
                font-family: monospace;
                color: #00FFFF;
                font-size: 14px;
                font-weight: bold;
                text-align: center;
                box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
            ">
                <div id="travel-status-display">STANDBY</div>
            </div>
        `;
        
        document.body.appendChild(this.cockpitOverlay);
        console.log('🚁 Cockpit interface created');
    }
    
    /**
     * Create hyperspace star field
     */
    createHyperspaceStars() {
        console.log(`🌟 Creating ${this.starCount} hyperspace stars...`);
        
        this.stars = [];
        
        for (let i = 0; i < this.starCount; i++) {
            // Create star geometry
            const starSize = 0.1 + Math.random() * 0.2;
            const starGeometry = new THREE.SphereGeometry(starSize, 8, 8);
            
            // Create bright emissive material
            const starColor = new THREE.Color().setHSL(
                0.55 + Math.random() * 0.3, // Blue to cyan
                0.8,
                0.7 + Math.random() * 0.3
            );
            
            const starMaterial = new THREE.MeshBasicMaterial({
                color: starColor,
                emissive: starColor,
                emissiveIntensity: 0.8 + Math.random() * 0.4
            });
            
            const star = new THREE.Mesh(starGeometry, starMaterial);
            
            // Position star randomly in space
            this.resetStarPosition(star);
            
            // Store animation data
            star.userData = {
                originalIntensity: starMaterial.emissiveIntensity,
                speed: 0.8 + Math.random() * 1.2,
                originalScale: starSize,
                phase: Math.random() * Math.PI * 2
            };
            
            star.visible = false; // Hidden initially
            this.stars.push(star);
            this.travelGroup.add(star);
        }
        
        console.log(`✅ Created ${this.stars.length} stars in travel group`);
    }
    
    /**
     * Setup travel group and add to scene
     */
    setupTravelGroup() {
        this.travelGroup.name = 'HyperspaceTravelGroup';
        this.travelGroup.visible = false;
        
        // CRITICAL: Ensure group is added to scene
        if (!this.scene.children.includes(this.travelGroup)) {
            this.scene.add(this.travelGroup);
            console.log('📦 Travel group added to scene');
        }
        
        console.log('📦 Travel group setup complete');
        console.log('📦 Scene children count:', this.scene.children.length);
    }
    
    /**
     * Reset star to random position
     */
    resetStarPosition(star) {
        const x = (Math.random() - 0.5) * (this.screenBounds.right - this.screenBounds.left);
        const y = (Math.random() - 0.5) * (this.screenBounds.top - this.screenBounds.bottom);
        const z = this.screenBounds.far - Math.random() * 30;
        
        star.position.set(x, y, z);
        
        // Reset scale
        const originalScale = star.userData?.originalScale || 0.1;
        star.scale.set(originalScale, originalScale, originalScale);
        
        // Reset material intensity
        if (star.material && star.userData) {
            star.material.emissiveIntensity = star.userData.originalIntensity;
        }
    }
    
    /**
     * Start travel sequence
     */
    startTravel(planet) {
        if (this.isActive) {
            console.log('🚫 Travel already active');
            return;
        }
        
        console.log(`🚀 Starting travel to ${planet.getInfo().name}`);
        
        this.isActive = true;
        this.selectedPlanet = planet;
        this.currentPhase = 'hyperspace';
        this.startTime = Date.now();
        this.warpSpeed = 0;
        
        // Store original scene state
        this.storeOriginalSceneState();
        
        // Setup travel scene
        this.setupTravelScene();
        
        // Show travel interface
        this.showTravelInterface();
        
        // Hide orbital objects
        this.hideOrbitalObjects();
        
        // Start hyperspace
        this.startHyperspacePhase();
        
        // Schedule phase transitions
        setTimeout(() => this.transitionToApproach(), this.phaseTimings.hyperspace);
    }
    
    /**
     * Store original scene state for restoration
     */
    storeOriginalSceneState() {
        this.originalSceneState = {
            background: this.scene.background,
            fog: this.scene.fog,
            clearColor: this.renderer.getClearColor().clone(),
            clearAlpha: this.renderer.getClearAlpha()
        };
        
        console.log('💾 Stored original scene state');
    }
    
    /**
     * Setup scene for travel (clear background, etc.)
     */
    setupTravelScene() {
        // Set black background
        this.scene.background = new THREE.Color(0x000000);
        this.scene.fog = null;
        this.renderer.setClearColor(0x000000, 1.0);
        
        console.log('🎬 Travel scene setup complete');
    }
    
    /**
     * Show travel interface
     */
    showTravelInterface() {
        this.blackScreen.style.display = 'block';
        this.cockpitOverlay.style.display = 'block';
        document.body.classList.add('cockpit-active');
        
        this.updateStatus('HYPERSPACE');
        console.log('🖥️ Travel interface shown');
    }
    
    /**
     * Hide orbital objects during travel
     */
    hideOrbitalObjects() {
        let hiddenCount = 0;
        
        this.scene.traverse((object) => {
            if (object !== this.travelGroup && 
                object.parent !== this.travelGroup &&
                object.visible &&
                (object.type === 'Mesh' || object.type === 'Group') &&
                !object.name.includes('Light') &&
                !object.name.includes('Camera')) {
                
                object.userData.wasVisibleBeforeTravel = true;
                object.visible = false;
                hiddenCount++;
            }
        });
        
        console.log(`🙈 Hidden ${hiddenCount} orbital objects`);
    }
    
    /**
     * Start hyperspace animation phase
     */
    startHyperspacePhase() {
        console.log('⭐ Starting hyperspace phase...');
        
        this.currentPhase = 'hyperspace';
        
        // Make travel group visible
        this.travelGroup.visible = true;
        
        // Show all stars
        let visibleCount = 0;
        this.stars.forEach((star, index) => {
            this.resetStarPosition(star);
            star.visible = true;
            visibleCount++;
            
            // Debug first few stars
            if (index < 3) {
                console.log(`⭐ Star ${index}:`, {
                    visible: star.visible,
                    position: star.position,
                    inScene: this.scene.getObjectById(star.id) !== undefined
                });
            }
        });
        
        console.log(`✅ Hyperspace started - ${visibleCount} stars visible`);
        console.log('📦 Travel group visible:', this.travelGroup.visible);
        console.log('📦 Travel group children:', this.travelGroup.children.length);
    }
    
    /**
     * Transition to planet approach
     */
    transitionToApproach() {
        if (this.currentPhase !== 'hyperspace') return;
        
        console.log('🌍 Transitioning to planet approach...');
        this.currentPhase = 'approach';
        
        // Hide stars
        this.stars.forEach(star => {
            star.visible = false;
        });
        
        // Create approach planet
        this.createApproachPlanet();
        
        this.updateStatus('APPROACHING');
        
        // Schedule arrival
        setTimeout(() => this.arriveAtPlanet(), this.phaseTimings.approach);
    }
    
    /**
     * Create planet for approach sequence
     */
    createApproachPlanet() {
        if (!this.selectedPlanet) return;
        
        console.log('🌍 Creating approach planet...');
        
        // Remove existing approach planet
        if (this.approachPlanet) {
            this.travelGroup.remove(this.approachPlanet);
            this.approachPlanet = null;
        }
        
        // Create new approach planet
        const planetGeometry = new THREE.SphereGeometry(15, 32, 32);
        const planetColors = this.getPlanetColors(this.selectedPlanet.id);
        
        const planetMaterial = new THREE.MeshBasicMaterial({
            color: planetColors.surface,
            emissive: planetColors.surface,
            emissiveIntensity: 0.4
        });
        
        this.approachPlanet = new THREE.Mesh(planetGeometry, planetMaterial);
        this.approachPlanet.position.set(0, 0, this.screenBounds.far - 10);
        this.approachPlanet.scale.setScalar(0.05);
        
        this.travelGroup.add(this.approachPlanet);
        
        console.log('🌍 Approach planet created:', {
            visible: this.approachPlanet.visible,
            position: this.approachPlanet.position,
            scale: this.approachPlanet.scale
        });
    }
    
    /**
     * Get planet colors based on ID
     */
    getPlanetColors(planetId) {
        const colorMap = {
            'work-planet': { surface: new THREE.Color(0xE67E22) },
            'education-planet': { surface: new THREE.Color(0x9B59B6) },
            'skills-planet': { surface: new THREE.Color(0x3498DB) },
            'projects-planet': { surface: new THREE.Color(0xF1C40F) },
            'community-planet': { surface: new THREE.Color(0x2ECC71) },
            'contact-planet': { surface: new THREE.Color(0xECF0F1) }
        };
        
        return colorMap[planetId] || { surface: new THREE.Color(0x4A90E2) };
    }
    
    /**
     * Arrive at planet
     */
    arriveAtPlanet() {
        if (this.currentPhase !== 'approach') return;
        
        console.log('🎯 Arrived at planet');
        this.currentPhase = 'arrived';
        
        this.updateStatus('ARRIVED');
        
        // Show content after delay
        setTimeout(() => {
            this.showPlanetContent();
        }, 500);
    }
    
    /**
     * Show planet content
     */
    showPlanetContent() {
        console.log('📱 Showing planet content...');
        
        this.currentPhase = 'content';
        this.updateStatus('DATA LINK');
        
        // Get content
        const content = this.getContentForPlanet(this.selectedPlanet.id);
        const title = this.getTitleForPlanet(this.selectedPlanet.id);
        
        // Update modal
        this.updateContentModal(title, content);
        
        // Show content overlay
        const contentOverlay = document.getElementById('content-overlay');
        if (contentOverlay) {
            contentOverlay.classList.remove('hidden');
        }
    }
    
    /**
     * Get content for planet
     */
    getContentForPlanet(planetId) {
        if (!this.travelSystem.app) return '<p>Content not available</p>';
        
        switch(planetId) {
            case 'work-planet':
                return this.travelSystem.app.getWorkContent();
            case 'education-planet':
                return this.travelSystem.app.getEducationContent();
            case 'skills-planet':
                return this.travelSystem.app.getSkillsContent();
            case 'projects-planet':
                return this.travelSystem.app.getProjectsContent();
            case 'community-planet':
                return this.travelSystem.app.getCommunityContent();
            case 'contact-planet':
                return this.travelSystem.app.getContactContent();
            case 'portfolio-nebula':
                return this.travelSystem.app.getPortfolioContent();
            default:
                return '<p>Content not available</p>';
        }
    }
    
    /**
     * Get title for planet
     */
    getTitleForPlanet(planetId) {
        const titleMap = {
            'work-planet': 'Work Experience',
            'education-planet': 'Education',
            'skills-planet': 'Technical Skills',
            'projects-planet': 'Accolades & Achievements',
            'community-planet': 'Community Work',
            'contact-planet': 'Contact & Connect',
            'portfolio-nebula': 'Creative Portfolio'
        };
        
        return titleMap[planetId] || 'Information';
    }
    
    /**
     * Update content modal
     */
    updateContentModal(title, content) {
        const contentTitle = document.getElementById('content-title');
        const contentBody = document.getElementById('content-body');
        
        if (contentTitle) contentTitle.textContent = title;
        if (contentBody) contentBody.innerHTML = content;
        
        // Update footer for travel mode
        const modalFooter = document.querySelector('.modal-footer');
        if (modalFooter) {
            modalFooter.innerHTML = `
                <button id="return-to-orbit" class="btn btn-secondary">Return to Orbit</button>
            `;
        }
    }
    
    /**
     * Update status display
     */
    updateStatus(status) {
        const statusElement = document.getElementById('travel-status-display');
        if (statusElement) {
            statusElement.textContent = status;
        }
    }
    
    /**
     * Update debug information
     */
    updateDebugInfo() {
        // Debug info removed - keeping method for compatibility
        // but no longer updating debug displays
    }
    
    /**
     * Return to orbit
     */
    returnToOrbit() {
        console.log('🔄 Returning to orbit...');
        
        // Hide content modal
        const contentOverlay = document.getElementById('content-overlay');
        if (contentOverlay) {
            contentOverlay.classList.add('hidden');
        }
        
        // Execute cleanup with fade
        this.fadeTransition(() => {
            this.executeCompleteCleanup();
        });
    }
    
    /**
     * Execute complete cleanup
     */
    executeCompleteCleanup() {
        console.log('🧹 Executing complete cleanup...');
        
        // Reset state
        this.isActive = false;
        this.currentPhase = 'idle';
        this.selectedPlanet = null;
        this.warpSpeed = 0;
        
        // Hide travel effects
        this.hideTravelEffects();
        
        // Hide interface
        this.hideTravelInterface();
        
        // Restore scene
        this.restoreOriginalScene();
        
        // Restore orbital objects
        this.restoreOrbitalObjects();
        
        // Re-enable interactions
        if (this.travelSystem.app && this.travelSystem.app.enableInteractions) {
            this.travelSystem.app.enableInteractions();
        }
        
        console.log('✅ Complete cleanup finished');
    }
    
    /**
     * Hide travel effects
     */
    hideTravelEffects() {
        this.travelGroup.visible = false;
        
        this.stars.forEach(star => {
            star.visible = false;
            this.resetStarPosition(star);
        });
        
        if (this.approachPlanet) {
            this.travelGroup.remove(this.approachPlanet);
            this.approachPlanet = null;
        }
    }
    
    /**
     * Hide travel interface
     */
    hideTravelInterface() {
        this.blackScreen.style.display = 'none';
        this.cockpitOverlay.style.display = 'none';
        document.body.classList.remove('cockpit-active');
    }
    
    /**
     * Restore original scene state
     */
    restoreOriginalScene() {
        this.scene.background = this.originalSceneState.background;
        this.scene.fog = this.originalSceneState.fog;
        this.renderer.setClearColor(
            this.originalSceneState.clearColor,
            this.originalSceneState.clearAlpha
        );
        
        console.log('🎬 Original scene state restored');
    }
    
    /**
     * Restore orbital objects
     */
    restoreOrbitalObjects() {
        let restoredCount = 0;
        
        this.scene.traverse((object) => {
            if (object.userData.wasVisibleBeforeTravel) {
                object.visible = true;
                object.userData.wasVisibleBeforeTravel = undefined;
                restoredCount++;
            }
        });
        
        console.log(`👁️ Restored ${restoredCount} orbital objects`);
    }
    
    /**
     * Fade transition utility
     */
    fadeTransition(callback) {
        const fadeOverlay = document.createElement('div');
        fadeOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: black;
            z-index: 15000;
            opacity: 0;
            transition: opacity 0.5s ease-in-out;
            pointer-events: auto;
        `;
        
        document.body.appendChild(fadeOverlay);
        
        // Fade to black
        requestAnimationFrame(() => {
            fadeOverlay.style.opacity = '1';
        });
        
        // Execute callback during black screen
        setTimeout(() => {
            callback();
            
            // Fade back
            setTimeout(() => {
                fadeOverlay.style.opacity = '0';
                
                setTimeout(() => {
                    if (fadeOverlay.parentNode) {
                        fadeOverlay.parentNode.removeChild(fadeOverlay);
                    }
                }, 500);
            }, 200);
        }, 500);
    }
    
    /**
     * Update animations
     */
    update() {
        if (!this.isActive) return;
        
        if (this.currentPhase === 'hyperspace') {
            this.updateHyperspace();
        } else if (this.currentPhase === 'approach') {
            this.updatePlanetApproach();
        }
    }
    
    /**
     * Update hyperspace animation
     */
    updateHyperspace() {
        // Accelerate warp speed
        if (this.warpSpeed < this.maxWarpSpeed) {
            this.warpSpeed += this.acceleration * (1/60);
        }
        
        // Animate stars
        this.stars.forEach(star => {
            if (!star.visible) return;
            
            // Move star AWAY from camera (toward the far distance)
            const starSpeed = this.warpSpeed * star.userData.speed;
            star.position.z += starSpeed; // CHANGED: += instead of -=
            
            // Create warp streak effect
            const speedRatio = this.warpSpeed / this.maxWarpSpeed;
            const streakLength = speedRatio * 3;
            
            // Stretch star
            star.scale.z = 1 + streakLength * 5;
            star.scale.x = Math.max(0.2, 1 - streakLength * 0.3);
            star.scale.y = Math.max(0.2, 1 - streakLength * 0.3);
            
            // Brighten star
            star.material.emissiveIntensity = 
                star.userData.originalIntensity * (1 + speedRatio * 3);
            
            // Reset star when it passes beyond far boundary
            if (star.position.z > this.screenBounds.far + 20) { // CHANGED: > instead of <
                this.resetStarPosition(star);
            }
        });
    }
    
    /**
     * Update planet approach animation
     */
    updatePlanetApproach() {
        if (!this.approachPlanet) return;
        
        const elapsed = (Date.now() - this.startTime - this.phaseTimings.hyperspace) / 1000;
        const progress = Math.min(elapsed / (this.phaseTimings.approach / 1000), 1.0);
        
        // Ease the progress
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        
        // Move planet closer
        const startZ = this.screenBounds.far - 10;
        const endZ = this.screenBounds.near + 15;
        this.approachPlanet.position.z = startZ + (endZ - startZ) * easeProgress;
        
        // Scale planet up
        const startScale = 0.05;
        const endScale = 1.5;
        const currentScale = startScale + (endScale - startScale) * easeProgress;
        this.approachPlanet.scale.setScalar(currentScale);
        
        // Rotate planet
        this.approachPlanet.rotation.y += 0.01;
        
        // Add cinematic movement
        const sway = Math.sin(progress * Math.PI) * 8;
        const bob = Math.sin(progress * Math.PI * 1.3) * 3;
        
        this.approachPlanet.position.x = sway;
        this.approachPlanet.position.y = bob;
    }
    
    /**
     * Check if hyperspace is active
     */
    isHyperspaceActive() {
        return this.isActive;
    }
    
    /**
     * Get current phase
     */
    getCurrentPhase() {
        return this.currentPhase;
    }
    
    /**
     * Emergency stop
     */
    emergencyStop() {
        console.log('🚨 Emergency stop');
        this.executeCompleteCleanup();
    }
    
    /**
     * Force hide hyperspace
     */
    forceHideHyperspace() {
        this.hideTravelEffects();
    }
    
    /**
     * Show hyperspace
     */
    showHyperspace() {
        this.startHyperspacePhase();
    }
    
    /**
     * Stop travel
     */
    stop() {
        if (this.isActive) {
            this.returnToOrbit();
        }
    }
    
    /**
     * Reset system
     */
    reset() {
        this.executeCompleteCleanup();
    }
    
    /**
     * Emergency cleanup
     */
    emergencyCleanup() {
        this.emergencyStop();
    }
    
    /**
     * Dispose resources
     */
    dispose() {
        console.log('🗑️ Disposing travel system...');
        
        this.emergencyStop();
        
        // Dispose 3D resources
        this.stars.forEach(star => {
            if (star.geometry) star.geometry.dispose();
            if (star.material) star.material.dispose();
        });
        
        if (this.approachPlanet) {
            if (this.approachPlanet.geometry) this.approachPlanet.geometry.dispose();
            if (this.approachPlanet.material) this.approachPlanet.material.dispose();
        }
        
        // Remove from scene
        if (this.travelGroup && this.scene) {
            this.scene.remove(this.travelGroup);
        }
        
        // Remove DOM elements
        if (this.blackScreen && this.blackScreen.parentNode) {
            this.blackScreen.parentNode.removeChild(this.blackScreen);
        }
        
        if (this.cockpitOverlay && this.cockpitOverlay.parentNode) {
            this.cockpitOverlay.parentNode.removeChild(this.cockpitOverlay);
        }
        
        // Clear references
        this.stars = [];
        this.travelGroup = null;
        this.approachPlanet = null;
        this.blackScreen = null;
        this.cockpitOverlay = null;
        
        console.log('🗑️ Travel system disposed');
    }
}

// Export for ES6 modules
export { HyperspaceTravel };

// Fallback for older browsers
if (typeof window !== 'undefined') {
    window.HyperspaceTravel = HyperspaceTravel;
}