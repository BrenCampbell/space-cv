/**
 * TravelSystem.js - CRITICAL FIX for Animation Sequence
 * 
 * Key fixes:
 * 1. Ensure hyperspace completely hides orbital view
 * 2. Proper timing to prevent animation freezing
 * 3. Validate each phase transition
 * 4. Emergency recovery if animations fail
 */

import { TravelConfirmation } from './TravelConfirmation.js';
import { HyperspaceTravel } from './HyperspaceTravel.js';
import { TravelAudio } from './TravelAudio.js';

class TravelSystem {
    constructor(spaceCVApp) {
        this.app = spaceCVApp;
        this.scene = spaceCVApp.scene;
        this.camera = spaceCVApp.camera;
        this.renderer = spaceCVApp.renderer;
        
        // Travel state management
        this.isTravel = false;
        this.currentPhase = 'orbit';
        this.selectedPlanet = null;
        this.travelStartTime = 0;
        
        // Store original scene state
        this.originalState = {
            cameraPosition: this.camera.position.clone(),
            cameraRotation: this.camera.rotation.clone(),
            cameraQuaternion: this.camera.quaternion.clone(),
            cameraLookAt: new THREE.Vector3(0, 0, 0),
            sceneBackground: this.scene.background,
            rendererClearColor: this.renderer.getClearColor().clone(),
            rendererClearAlpha: this.renderer.getClearAlpha()
        };
        
        // Travel components
        this.travelConfirmation = null;
        this.hyperspaceTravel = null;
        this.travelAudio = null;
        
        // CRITICAL FIX: Simplified timing to prevent freezing
        this.travelConfig = {
            phases: {
                fadeIntoCockpit: 500,
                cockpitSetup: 300,        // Time for cockpit to fully appear
                hyperspace: 3000,         // Shortened hyperspace duration
                hyperspaceToApproach: 200, // Quick transition
                planetApproach: 2000,     // Planet approach duration
                approachToContent: 300    // Quick transition to content
            }
        };
        
        // Phase timers
        this.phaseTimers = {};
        
        // Debug tracking
        this.debugMode = false;
        
        this.init();
    }
    
    init() {
        console.log('🚀 Initializing CRITICAL FIX TravelSystem...');
        
        // Initialize travel components
        this.travelConfirmation = new TravelConfirmation(this);
        this.hyperspaceTravel = new HyperspaceTravel(this);
        this.travelAudio = new TravelAudio(this);
        
        console.log('✅ CRITICAL FIX TravelSystem initialized');
    }
    
    /**
     * Initiate travel to selected planet
     */
    initiatePlanetTravel(planet) {
        if (this.isTravel) {
            console.log('🚫 Travel already in progress');
            return;
        }
        
        console.log(`🌍 Initiating travel to ${planet.getInfo().name}`);
        
        this.selectedPlanet = planet;
        this.currentPhase = 'confirmation';
        
        this.travelConfirmation.show(planet);
    }
    
    /**
     * Start travel sequence with critical fixes
     */
    startTravelSequence() {
        if (!this.selectedPlanet) {
            console.error('❌ No planet selected');
            return;
        }
        
        console.log('🚀 Starting unified travel sequence...');
        
        this.isTravel = true;
        this.travelStartTime = Date.now();
        this.currentPhase = 'traveling';
        
        // Hide confirmation and disable interactions
        this.travelConfirmation.hide();
        this.disablePlanetInteractions();
        
        // Start unified travel system
        this.hyperspaceTravel.startTravel(this.selectedPlanet);
    }
    
    /**
     * Clear all phase timers
     */
    clearPhaseTimers() {
        Object.values(this.phaseTimers).forEach(timer => {
            if (timer) clearTimeout(timer);
        });
        this.phaseTimers = {};
    }
    
    /**
     * Capture original scene state
     */
    captureOriginalState() {
        console.log('📸 Capturing original state...');
        
        this.originalState = {
            cameraPosition: this.camera.position.clone(),
            cameraRotation: this.camera.rotation.clone(),
            cameraQuaternion: this.camera.quaternion.clone(),
            cameraLookAt: new THREE.Vector3(0, 0, 0),
            sceneBackground: this.scene.background,
            rendererClearColor: this.renderer.getClearColor().clone(),
            rendererClearAlpha: this.renderer.getClearAlpha()
        };
    }
    
    /**
     * Cancel travel
     */
    cancelTravel() {
        console.log('❌ Travel cancelled');
        
        this.currentPhase = 'orbit';
        this.selectedPlanet = null;
        this.travelConfirmation.hide();
        this.clearPhaseTimers();
        this.resetTravelState();
        this.enablePlanetInteractions();
        
        console.log('✅ Travel cancelled - no animation needed');
    }
    
    /**
     * CRITICAL FIX: Fade to cockpit with proper sequencing
     */
    fadeIntoCockpit() {
        console.log('🌑 Fading into cockpit...');
        
        this.quickFadeTransition(() => {
            // During black screen: setup cockpit
            console.log('⚫ Setting up cockpit during black screen...');
            
            this.cockpitView.showStandaloneCockpit();
            this.currentPhase = 'cockpit';
            document.body.classList.add('cockpit-active');
            
        }, () => {
            // After fade in: wait for cockpit, then start hyperspace
            console.log('🌅 Cockpit visible, preparing hyperspace...');
            
            this.phaseTimers.hyperspaceStart = setTimeout(() => {
                this.startHyperspaceSequence();
            }, this.travelConfig.phases.cockpitSetup);
        });
    }
    
    /**
     * CRITICAL FIX: Start hyperspace with validation
     */
    startHyperspaceSequence() {
        if (this.currentPhase !== 'cockpit') {
            console.warn('⚠️ Wrong phase for hyperspace, aborting');
            return;
        }
        
        console.log('⭐ Starting hyperspace sequence...');
        
        this.currentPhase = 'hyperspace';
        
        // CRITICAL: Ensure planet approach is hidden
        if (this.planetApproach) {
            this.planetApproach.hide();
        }
        
        // Start hyperspace
        if (this.hyperspaceTravel) {
            this.hyperspaceTravel.start();
            
            // CRITICAL: Validate hyperspace started
            this.phaseTimers.hyperspaceValidation = setTimeout(() => {
                this.validateHyperspaceStarted();
            }, 100);
        }
        
        // Start audio
        if (this.travelAudio) {
            this.travelAudio.playVoiceOver(this.selectedPlanet.id);
        }
        
        // Set timer for approach transition
        this.phaseTimers.approachTransition = setTimeout(() => {
            this.transitionToApproach();
        }, this.travelConfig.phases.hyperspace);
        
        console.log(`⏱️ Hyperspace will run for ${this.travelConfig.phases.hyperspace}ms`);
    }
    
    /**
     * CRITICAL: Validate hyperspace actually started
     */
    validateHyperspaceStarted() {
        if (!this.hyperspaceTravel.isHyperspaceActive()) {
            console.error('❌ Hyperspace failed to start! Emergency restart...');
            this.hyperspaceTravel.start();
        }
        
        if (this.hyperspaceTravel.hyperspaceGroup && !this.hyperspaceTravel.hyperspaceGroup.visible) {
            console.error('❌ Hyperspace not visible! Forcing visibility...');
            this.hyperspaceTravel.showHyperspace();
        }
        
        console.log('✅ Hyperspace validation passed');
    }
    
    /**
     * CRITICAL FIX: Smooth transition to approach
     */
    transitionToApproach() {
        if (this.currentPhase !== 'hyperspace') {
            console.warn('⚠️ Wrong phase for approach transition');
            return;
        }
        
        console.log('🔄 Transitioning to planet approach...');
        
        this.currentPhase = 'transitioning';
        
        // Stop hyperspace but keep it visible briefly
        if (this.hyperspaceTravel) {
            this.hyperspaceTravel.stop();
            
            // Hide hyperspace after short delay
            this.phaseTimers.hyperspaceHide = setTimeout(() => {
                this.hyperspaceTravel.forceHideHyperspace();
            }, this.travelConfig.phases.hyperspaceToApproach);
        }
        
        // Start planet approach with overlap
        this.phaseTimers.approachStart = setTimeout(() => {
            this.startPlanetApproachSequence();
        }, this.travelConfig.phases.hyperspaceToApproach / 2);
    }
    
    /**
     * CRITICAL FIX: Start planet approach with validation
     */
    startPlanetApproachSequence() {
        if (!this.selectedPlanet) {
            console.error('❌ No planet for approach!');
            return;
        }
        
        console.log('🌍 Starting planet approach sequence...');
        
        this.currentPhase = 'approach';
        
        // Ensure hyperspace is fully hidden
        if (this.hyperspaceTravel) {
            this.hyperspaceTravel.forceHideHyperspace();
        }
        
        // Start planet approach
        if (this.planetApproach) {
            this.planetApproach.start(this.selectedPlanet);
            
            // Validate approach started
            this.phaseTimers.approachValidation = setTimeout(() => {
                this.validateApproachStarted();
            }, 100);
        }
        
        // Set timer for content display
        this.phaseTimers.contentDisplay = setTimeout(() => {
            this.arriveAtPlanet();
        }, this.travelConfig.phases.planetApproach);
        
        console.log(`⏱️ Planet approach will run for ${this.travelConfig.phases.planetApproach}ms`);
    }
    
    /**
     * CRITICAL: Validate approach actually started
     */
    validateApproachStarted() {
        if (!this.planetApproach.isApproachActive()) {
            console.error('❌ Planet approach failed to start! Emergency restart...');
            this.planetApproach.start(this.selectedPlanet);
        }
        
        if (!this.planetApproach.isVisible()) {
            console.error('❌ Planet approach not visible! Forcing visibility...');
            this.planetApproach.show();
        }
        
        console.log('✅ Planet approach validation passed');
    }
    
    /**
     * Arrive at planet and prepare content
     */
    arriveAtPlanet() {
        console.log('🎯 Arrived at planet...');
        
        this.currentPhase = 'arrived';
        
        // Stop approach animation but keep planet visible
        if (this.planetApproach) {
            this.planetApproach.stop();
        }
        
        // Show content after brief delay
        this.phaseTimers.showContent = setTimeout(() => {
            this.showPlanetContent();
        }, this.travelConfig.phases.approachToContent);
    }
    
    /**
     * Show planet content
     */
    showPlanetContent() {
        const planetInfo = this.selectedPlanet.getInfo();
        console.log(`📋 Showing content for ${planetInfo.name}`);
        
        this.currentPhase = 'content';
        
        // Get content based on planet type
        let content = '';
        let title = '';
        let indicatorClass = '';
        
        switch(this.selectedPlanet.id) {
            case 'work-planet':
                title = 'Work Experience';
                content = this.app.getWorkContent();
                indicatorClass = 'indicator-work';
                break;
            case 'education-planet':
                title = 'Education';
                content = this.app.getEducationContent();
                indicatorClass = 'indicator-education';
                break;
            case 'skills-planet':
                title = 'Technical Skills';
                content = this.app.getSkillsContent();
                indicatorClass = 'indicator-skills';
                break;
            case 'projects-planet':
                title = 'Accolades & Achievements';
                content = this.app.getProjectsContent();
                indicatorClass = 'indicator-projects';
                break;
            case 'community-planet':
                title = 'Community Work';
                content = this.app.getCommunityContent();
                indicatorClass = 'indicator-community';
                break;
            case 'contact-planet':
                title = 'Contact & Connect';
                content = this.app.getContactContent();
                indicatorClass = 'indicator-contact';
                break;
            default:
                title = planetInfo.name;
                content = '<p>Content not available</p>';
                indicatorClass = 'indicator-primary';
        }
        
        // Update content for cockpit mode
        this.updateCockpitContentDisplay(title, content, indicatorClass);
        this.showTravelContent();
    }
    
    /**
     * Update content display for cockpit mode
     */
    updateCockpitContentDisplay(title, content, indicatorClass) {
        const contentTitle = document.getElementById('content-title');
        const contentBody = document.getElementById('content-body');
        const indicator = document.querySelector('.indicator');
        
        if (contentTitle) contentTitle.textContent = title;
        if (contentBody) contentBody.innerHTML = content;
        if (indicator) indicator.className = `indicator ${indicatorClass}`;
        
        // Update footer for travel mode
        const modalFooter = document.querySelector('.modal-footer');
        if (modalFooter) {
            modalFooter.innerHTML = `
                <button id="return-to-orbit" class="btn btn-secondary">Return to Orbit</button>
            `;
            
            const returnBtn = document.getElementById('return-to-orbit');
            if (returnBtn) {
                returnBtn.addEventListener('click', () => {
                    this.returnToOrbit();
                });
            }
        }
    }
    
    /**
     * Show travel content modal
     */
    showTravelContent() {
        const contentOverlay = document.getElementById('content-overlay');
        if (contentOverlay) {
            contentOverlay.classList.remove('hidden');
        }
        
        console.log('📱 Content modal displayed in cockpit');
    }
    
    /**
     * Return to orbit from planet
     */
    returnToOrbit() {
        console.log('🔄 Returning to orbit...');
        
        // Hide content modal
        const contentOverlay = document.getElementById('content-overlay');
        if (contentOverlay) {
            contentOverlay.classList.add('hidden');
        }
        
        // Clear timers and execute restoration
        this.clearPhaseTimers();
        this.executeCompleteRestoration();
    }
    
    /**
     * CRITICAL FIX: Execute complete restoration
     */
    executeCompleteRestoration() {
        console.log('🔧 Executing complete restoration...');
        
        // Reset travel state
        this.isTravel = false;
        this.currentPhase = 'orbit';
        this.selectedPlanet = null;
        this.travelStartTime = 0;
        
        // Use unified system's cleanup
        if (this.hyperspaceTravel) {
            this.hyperspaceTravel.returnToOrbit();
        }
        
        // Re-enable interactions
        this.enablePlanetInteractions();
        
        // Restart app animations
        if (this.app && this.app.restartAnimations) {
            this.app.restartAnimations();
        }
        
        console.log('✅ Complete restoration finished');
    }
    
    /**
     * Force stop all travel components
     */
    forceStopAllTravelComponents() {
        this.clearPhaseTimers();
        
        if (this.hyperspaceTravel) {
            this.hyperspaceTravel.stop();
            this.hyperspaceTravel.emergencyCleanup();
        }
        
        if (this.planetApproach) {
            this.planetApproach.stop();
            this.planetApproach.hide();
            this.planetApproach.reset();
        }
        
        if (this.travelAudio) {
            this.travelAudio.stop();
        }
        
        if (this.cockpitView) {
            this.cockpitView.hideStandaloneCockpit();
            this.cockpitView.reset();
        }
    }
    
    /**
     * Force DOM cleanup
     */
    forceDOMCleanup() {
        document.body.classList.remove('cockpit-active');
        
        const cockpitOverlay = document.getElementById('cockpit-overlay');
        if (cockpitOverlay) {
            cockpitOverlay.style.display = 'none';
        }
        
        const fadeOverlay = document.getElementById('quick-travel-fade');
        if (fadeOverlay) {
            fadeOverlay.remove();
        }
        
        document.body.style.cursor = 'default';
        document.body.style.overflow = 'hidden';
        
        const contentOverlay = document.getElementById('content-overlay');
        if (contentOverlay) {
            contentOverlay.classList.add('hidden');
        }
    }
    
    /**
     * Restore camera completely
     */
    restoreCameraCompletely() {
        this.camera.position.copy(this.originalState.cameraPosition);
        this.camera.quaternion.copy(this.originalState.cameraQuaternion);
        this.camera.lookAt(this.originalState.cameraLookAt);
        
        this.camera.updateMatrix();
        this.camera.updateMatrixWorld(true);
        this.camera.updateProjectionMatrix();
    }
    
    /**
     * Restore scene state
     */
    restoreSceneState() {
        this.renderer.setClearColor(this.originalState.rendererClearColor, this.originalState.rendererClearAlpha);
        this.scene.background = this.originalState.sceneBackground;
        this.renderer.render(this.scene, this.camera);
    }
    
    /**
     * Reset travel state
     */
    resetTravelState() {
        this.isTravel = false;
        this.currentPhase = 'orbit';
        this.selectedPlanet = null;
        this.travelStartTime = 0;
        this.clearPhaseTimers();
    }
    
    /**
     * Enhanced fade transition
     */
    quickFadeTransition(duringBlackCallback, afterFadeCallback) {
        console.log('🌑 Starting fade transition...');
        
        const fadeOverlay = document.createElement('div');
        fadeOverlay.id = 'quick-travel-fade';
        fadeOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: black;
            z-index: 15000;
            opacity: 0;
            transition: opacity 0.4s ease-in-out;
            pointer-events: auto;
        `;
        
        document.body.appendChild(fadeOverlay);
        
        // Fade to black
        requestAnimationFrame(() => {
            fadeOverlay.style.opacity = '1';
        });
        
        // Execute during black screen
        setTimeout(() => {
            console.log('⚫ Executing during black screen...');
            duringBlackCallback();
            
            // Fade back in
            setTimeout(() => {
                console.log('🌅 Fading back in...');
                fadeOverlay.style.opacity = '0';
                
                setTimeout(() => {
                    if (fadeOverlay && fadeOverlay.parentNode) {
                        fadeOverlay.parentNode.removeChild(fadeOverlay);
                    }
                    if (afterFadeCallback) {
                        afterFadeCallback();
                    }
                }, 400);
            }, 200);
        }, 400);
    }
    
    /**
     * Disable planet interactions
     */
    disablePlanetInteractions() {
        const canvas = document.getElementById('space-canvas');
        if (canvas) {
            canvas.style.pointerEvents = 'none';
        }
        
        const planetInfo = document.getElementById('planet-info');
        if (planetInfo) {
            planetInfo.classList.add('hidden');
        }
        
        // ADDED: Hide navigation during travel
        const navigationPanel = document.getElementById('controls-info');
        if (navigationPanel) {
            navigationPanel.classList.add('travel-hidden');
        }
        
        console.log('🚫 Planet interactions and navigation disabled');
    }
    
    /**
     * Re-enable planet interactions
     */
    enablePlanetInteractions() {
        console.log('🎮 Re-enabling planet interactions...');
        
        const canvas = document.getElementById('space-canvas');
        if (canvas) {
            canvas.style.pointerEvents = 'auto';
        }
        
        document.body.style.cursor = 'default';
        
        const planetInfo = document.getElementById('planet-info');
        if (planetInfo && !planetInfo.classList.contains('hidden')) {
            planetInfo.classList.add('hidden');
        }
        
        // ADDED: Restore navigation after travel
        const navigationPanel = document.getElementById('controls-info');
        if (navigationPanel) {
            navigationPanel.classList.remove('travel-hidden');
        }
        
        // Re-enable app interactions
        if (this.app.enableInteractions) {
            this.app.enableInteractions();
        }
        
        console.log('✅ Planet interactions and navigation re-enabled');
    }
    
    /**
     * CRITICAL FIX: Update travel system with validation
     */
    update() {
        // Update unified travel system
        if (this.hyperspaceTravel) {
            this.hyperspaceTravel.update();
        }
    }
    
    /**
     * Maintain orbital view integrity
     */
    maintainOrbitalView() {
        // Ensure hyperspace is hidden
        if (this.hyperspaceTravel && this.hyperspaceTravel.hyperspaceGroup) {
            this.hyperspaceTravel.hyperspaceGroup.visible = false;
        }
        
        // Ensure approach is hidden
        if (this.planetApproach && this.planetApproach.isVisible()) {
            this.planetApproach.hide();
        }
        
        // Ensure cockpit is hidden
        if (document.body.classList.contains('cockpit-active')) {
            document.body.classList.remove('cockpit-active');
        }
        
        // Check canvas interactions occasionally
        if (Math.random() < 0.01) {
            const canvas = document.getElementById('space-canvas');
            if (canvas && canvas.style.pointerEvents === 'none') {
                console.warn('⚠️ Canvas interactions disabled, re-enabling...');
                canvas.style.pointerEvents = 'auto';
            }
        }
    }
    
    /**
     * Get current phase for debugging
     */
    getCurrentPhase() {
        return this.currentPhase;
    }
    
    /**
     * Check if traveling
     */
    isTraveling() {
        return this.isTravel;
    }
    
    /**
     * Emergency stop
     */
    emergencyReturnToOrbit() {
        console.log('🚨 Emergency return to orbit!');
        
        this.clearPhaseTimers();
        this.forceStopAllTravelComponents();
        this.executeCompleteRestoration();
    }
    
    /**
     * Dispose of travel system
     */
    dispose() {
        console.log('🗑️ Disposing TravelSystem...');
        
        this.clearPhaseTimers();
        
        if (this.travelConfirmation) this.travelConfirmation.dispose();
        if (this.hyperspaceTravel) this.hyperspaceTravel.dispose();
        if (this.travelAudio) this.travelAudio.dispose();
        
        console.log('🗑️ TravelSystem disposed');
    }
}

// Export for ES6 modules
export { TravelSystem };