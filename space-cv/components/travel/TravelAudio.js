/**
 * TravelAudio.js - Travel Audio Management Component
 * 
 * Handles voice-over playback during travel sequences
 * Provisions for adding .wav/.mp3 files for each planet
 */

class TravelAudio {
    constructor(travelSystem) {
        this.travelSystem = travelSystem;
        
        // Audio state
        this.isPlaying = false;
        this.currentAudio = null;
        this.audioContext = null;
        
        // Audio configuration
        this.audioConfig = {
            volume: 0.7,
            fadeInDuration: 1000,  // 1 second
            fadeOutDuration: 1000, // 1 second
        };
        
        // Audio files mapping (to be populated when files are added)
        this.audioFiles = {
            'work-planet': {
                url: null, // Will be: './assets/audio/work-experience-vo.mp3'
                duration: 10000, // 10 seconds default
                loaded: false,
                audioBuffer: null
            },
            'education-planet': {
                url: null, // Will be: './assets/audio/education-vo.mp3'
                duration: 10000,
                loaded: false,
                audioBuffer: null
            },
            'skills-planet': {
                url: null, // Will be: './assets/audio/skills-vo.mp3'
                duration: 10000,
                loaded: false,
                audioBuffer: null
            },
            'projects-planet': {
                url: null, // Will be: './assets/audio/projects-vo.mp3'
                duration: 10000,
                loaded: false,
                audioBuffer: null
            },
            'community-planet': {
                url: null, // Will be: './assets/audio/community-vo.mp3'
                duration: 10000,
                loaded: false,
                audioBuffer: null
            },
            'contact-planet': {
                url: null, // Will be: './assets/audio/contact-vo.mp3'
                duration: 10000,
                loaded: false,
                audioBuffer: null
            }
        };
        
        // Audio loading promises
        this.loadingPromises = new Map();
        
        this.init();
    }
    
    init() {
        console.log('🔊 Initializing TravelAudio...');
        
        // Initialize Web Audio API context
        this.initAudioContext();
        
        console.log('✅ TravelAudio initialized (audio files can be added later)');
    }
    
    /**
     * Initialize Web Audio API context
     */
    initAudioContext() {
        try {
            // Create audio context
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            
            console.log('🎵 Web Audio API context initialized');
        } catch (error) {
            console.warn('⚠️ Web Audio API not supported, falling back to HTML5 audio:', error);
            this.audioContext = null;
        }
    }
    
    /**
     * Add audio file for a planet
     * Call this method when audio files are ready
     */
    addPlanetAudio(planetId, audioUrl, duration = 10000) {
        if (!this.audioFiles[planetId]) {
            console.warn(`⚠️ Unknown planet ID: ${planetId}`);
            return;
        }
        
        console.log(`📁 Adding audio for ${planetId}: ${audioUrl}`);
        
        this.audioFiles[planetId].url = audioUrl;
        this.audioFiles[planetId].duration = duration;
        
        // Preload the audio file
        this.preloadAudio(planetId);
    }
    
    /**
     * Preload audio file for better performance
     */
    async preloadAudio(planetId) {
        const audioData = this.audioFiles[planetId];
        
        if (!audioData.url || audioData.loaded) {
            return;
        }
        
        console.log(`⬇️ Preloading audio for ${planetId}...`);
        
        try {
            if (this.audioContext) {
                // Use Web Audio API for better control
                const response = await fetch(audioData.url);
                const arrayBuffer = await response.arrayBuffer();
                const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
                
                audioData.audioBuffer = audioBuffer;
                audioData.duration = audioBuffer.duration * 1000; // Convert to milliseconds
                audioData.loaded = true;
                
                console.log(`✅ Audio loaded for ${planetId} (${audioData.duration}ms)`);
            } else {
                // Fallback to HTML5 Audio
                const audio = new Audio(audioData.url);
                audio.preload = 'auto';
                
                audio.addEventListener('loadeddata', () => {
                    audioData.duration = audio.duration * 1000;
                    audioData.loaded = true;
                    audioData.audioElement = audio;
                    
                    console.log(`✅ Audio loaded for ${planetId} (${audioData.duration}ms)`);
                });
                
                audio.addEventListener('error', (error) => {
                    console.error(`❌ Failed to load audio for ${planetId}:`, error);
                });
            }
        } catch (error) {
            console.error(`❌ Failed to preload audio for ${planetId}:`, error);
        }
    }
    
    /**
     * Play voice-over for specified planet
     */
    playVoiceOver(planetId) {
        if (this.isPlaying) {
            console.log('🔊 Audio already playing, stopping current...');
            this.stop();
        }
        
        const audioData = this.audioFiles[planetId];
        
        if (!audioData || !audioData.url) {
            console.log(`🔇 No audio file configured for ${planetId}, using silence`);
            this.simulateAudioDuration(planetId);
            return;
        }
        
        if (!audioData.loaded) {
            console.log(`⏳ Audio not loaded for ${planetId}, loading now...`);
            this.preloadAudio(planetId).then(() => {
                if (audioData.loaded) {
                    this.playAudio(planetId);
                } else {
                    this.simulateAudioDuration(planetId);
                }
            });
            return;
        }
        
        this.playAudio(planetId);
    }
    
    /**
     * Actually play the audio
     */
    playAudio(planetId) {
        const audioData = this.audioFiles[planetId];
        
        console.log(`🎵 Playing voice-over for ${planetId}`);
        
        this.isPlaying = true;
        
        try {
            if (this.audioContext && audioData.audioBuffer) {
                // Use Web Audio API
                this.playWithWebAudio(audioData);
            } else if (audioData.audioElement) {
                // Use HTML5 Audio
                this.playWithHTML5Audio(audioData);
            } else {
                throw new Error('No audio source available');
            }
        } catch (error) {
            console.error(`❌ Failed to play audio for ${planetId}:`, error);
            this.simulateAudioDuration(planetId);
        }
    }
    
    /**
     * Play audio using Web Audio API
     */
    playWithWebAudio(audioData) {
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        // Create audio source
        const source = this.audioContext.createBufferSource();
        source.buffer = audioData.audioBuffer;
        
        // Create gain node for volume control
        const gainNode = this.audioContext.createGain();
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(this.audioConfig.volume, 
            this.audioContext.currentTime + this.audioConfig.fadeInDuration / 1000);
        
        // Connect audio graph
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Store reference for stopping
        this.currentAudio = { source, gainNode, type: 'webaudio' };
        
        // Handle audio end
        source.addEventListener('ended', () => {
            this.onAudioEnd();
        });
        
        // Start playback
        source.start();
        
        console.log('🎵 Started Web Audio API playback');
    }
    
    /**
     * Play audio using HTML5 Audio
     */
    playWithHTML5Audio(audioData) {
        const audio = audioData.audioElement;
        
        audio.volume = 0;
        audio.currentTime = 0;
        
        // Store reference
        this.currentAudio = { element: audio, type: 'html5' };
        
        // Fade in
        this.fadeInHTML5Audio(audio);
        
        // Handle audio end
        audio.addEventListener('ended', () => {
            this.onAudioEnd();
        }, { once: true });
        
        // Start playback
        audio.play().catch(error => {
            console.error('❌ HTML5 audio play failed:', error);
            this.onAudioEnd();
        });
        
        console.log('🎵 Started HTML5 audio playback');
    }
    
    /**
     * Fade in HTML5 audio
     */
    fadeInHTML5Audio(audio) {
        const startTime = Date.now();
        const fadeIn = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / this.audioConfig.fadeInDuration, 1);
            
            audio.volume = this.audioConfig.volume * progress;
            
            if (progress < 1) {
                requestAnimationFrame(fadeIn);
            }
        };
        
        fadeIn();
    }
    
    /**
     * Simulate audio duration when no file is available
     */
    simulateAudioDuration(planetId) {
        const audioData = this.audioFiles[planetId];
        const duration = audioData ? audioData.duration : 10000;
        
        console.log(`⏱️ Simulating audio duration for ${planetId}: ${duration}ms`);
        
        this.isPlaying = true;
        
        setTimeout(() => {
            this.onAudioEnd();
        }, duration);
    }
    
    /**
     * Handle audio playback end
     */
    onAudioEnd() {
        console.log('🔇 Audio playback ended');
        this.isPlaying = false;
        this.currentAudio = null;
    }
    
    /**
     * Stop current audio playback
     */
    stop() {
        if (!this.isPlaying || !this.currentAudio) {
            return;
        }
        
        console.log('⏹️ Stopping audio playback...');
        
        try {
            if (this.currentAudio.type === 'webaudio') {
                // Stop Web Audio API
                if (this.currentAudio.source) {
                    this.currentAudio.source.stop();
                }
            } else if (this.currentAudio.type === 'html5') {
                // Stop HTML5 Audio
                if (this.currentAudio.element) {
                    this.currentAudio.element.pause();
                    this.currentAudio.element.currentTime = 0;
                }
            }
        } catch (error) {
            console.warn('⚠️ Error stopping audio:', error);
        }
        
        this.onAudioEnd();
    }
    
    /**
     * Set audio volume (0 to 1)
     */
    setVolume(volume) {
        this.audioConfig.volume = Math.max(0, Math.min(1, volume));
        
        // Update current playing audio if any
        if (this.currentAudio) {
            if (this.currentAudio.type === 'webaudio' && this.currentAudio.gainNode) {
                this.currentAudio.gainNode.gain.setValueAtTime(this.audioConfig.volume, 
                    this.audioContext.currentTime);
            } else if (this.currentAudio.type === 'html5' && this.currentAudio.element) {
                this.currentAudio.element.volume = this.audioConfig.volume;
            }
        }
        
        console.log(`🔊 Audio volume set to ${this.audioConfig.volume}`);
    }
    
    /**
     * Get current audio volume
     */
    getVolume() {
        return this.audioConfig.volume;
    }
    
    /**
     * Check if audio is currently playing
     */
    isAudioPlaying() {
        return this.isPlaying;
    }
    
    /**
     * Get travel duration for planet (including audio duration)
     */
    getTravelDuration(planetId) {
        const audioData = this.audioFiles[planetId];
        return audioData ? audioData.duration : 10000;
    }
    
    /**
     * Dispose of audio resources
     */
    dispose() {
        console.log('🗑️ Disposing TravelAudio...');
        
        // Stop any playing audio
        this.stop();
        
        // Close audio context
        if (this.audioContext && this.audioContext.state !== 'closed') {
            this.audioContext.close();
        }
        
        // Clear audio data
        Object.values(this.audioFiles).forEach(audioData => {
            if (audioData.audioElement) {
                audioData.audioElement.src = '';
                audioData.audioElement = null;
            }
            audioData.audioBuffer = null;
        });
        
        this.audioFiles = {};
        this.loadingPromises.clear();
        this.currentAudio = null;
        this.audioContext = null;
        
        console.log('🗑️ TravelAudio disposed');
    }
}

// Export for ES6 modules
export { TravelAudio };

// Fallback for older browsers
if (typeof window !== 'undefined') {
    window.TravelAudio = TravelAudio;
}