/**
 * Enhanced Spaceship.js - Detailed Cartoon Style Spaceship Component
 * 
 * Enhanced version with procedural textures, mechanical details, and visual interest
 * Maintains cartoon aesthetic while adding depth and detail
 */

class Spaceship {
    constructor(scene, position = { x: 0, y: 5, z: 90 }) {
        this.scene = scene;
        this.position = position;
        
        // Spaceship properties
        this.id = 'player-spaceship';
        this.theme = 'cartoon';
        this.scale = 1.0;
        
        // Component groups
        this.group = new THREE.Group();
        this.hull = null;
        this.engines = [];
        this.cockpit = null;
        this.wings = [];
        this.details = [];
        
        // Animation properties
        this.clock = new THREE.Clock();
        this.hoverOffset = 0;
        
        this.init();
    }
    
    init() {
        console.log('🚀 Initializing Enhanced Spaceship component...');
        
        // Set position (bottom center, facing away from camera)
        this.group.position.set(this.position.x, this.position.y, this.position.z);
        
        // Rotate to face away from camera (toward the planets)
        this.group.rotation.y = 1.58;
        
        // Create enhanced spaceship components
        this.createEnhancedSpaceship();
        
        // Add to scene
        this.scene.add(this.group);
        
        console.log('✅ Enhanced Spaceship initialized successfully');
    }
    
    /**
     * Creates procedural hull texture with panels and details
     */
    createHullMaterial() {
        return new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0.0 },
                baseColor: { value: new THREE.Color(0xDDDDDD) },
                panelColor: { value: new THREE.Color(0xCCCCCC) },
                accentColor: { value: new THREE.Color(0x4A90E2) }
            },
            vertexShader: `
                varying vec3 vPosition;
                varying vec3 vNormal;
                varying vec2 vUv;
                
                void main() {
                    vPosition = position;
                    vNormal = normal;
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec3 baseColor;
                uniform vec3 panelColor;
                uniform vec3 accentColor;
                
                varying vec3 vPosition;
                varying vec3 vNormal;
                varying vec2 vUv;
                
                float hash(vec2 p) {
                    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
                }
                
                float noise(vec2 p) {
                    vec2 i = floor(p);
                    vec2 f = fract(p);
                    f = f * f * (3.0 - 2.0 * f);
                    
                    return mix(
                        mix(hash(i), hash(i + vec2(1,0)), f.x),
                        mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x), f.y);
                }
                
                void main() {
                    // Create panel grid pattern
                    vec2 panelUv = vUv * 4.0;
                    vec2 panelGrid = abs(fract(panelUv) - 0.5);
                    float panelLines = smoothstep(0.05, 0.1, min(panelGrid.x, panelGrid.y));
                    
                    // Add some surface noise for weathering
                    float surfaceNoise = noise(vUv * 20.0) * 0.1;
                    
                    // Create rivet/bolt pattern
                    vec2 rivetUv = vUv * 8.0;
                    vec2 rivetGrid = fract(rivetUv) - 0.5;
                    float rivets = 1.0 - smoothstep(0.15, 0.2, length(rivetGrid));
                    rivets *= step(0.8, hash(floor(rivetUv))); // Random rivet placement
                    
                    // Mix colors
                    vec3 finalColor = mix(panelColor, baseColor, panelLines);
                    finalColor += surfaceNoise;
                    finalColor = mix(finalColor, accentColor, rivets * 0.3);
                    
                    // Add subtle pulsing energy lines
                    float energyLines = sin(vUv.x * 20.0 + time * 2.0) * sin(vUv.y * 15.0 + time * 1.5);
                    energyLines = smoothstep(0.7, 0.9, energyLines);
                    finalColor += accentColor * energyLines * 0.2;
                    
                    gl_FragColor = vec4(finalColor, 1.0);
                }
            `
        });
    }
    
    /**
     * Creates wing material with tech patterns
     */
    createWingMaterial() {
        return new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0.0 },
                baseColor: { value: new THREE.Color(0xAAAAAA) },
                techColor: { value: new THREE.Color(0x4A90E2) }
            },
            vertexShader: `
                varying vec3 vPosition;
                varying vec3 vNormal;
                varying vec2 vUv;
                
                void main() {
                    vPosition = position;
                    vNormal = normal;
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec3 baseColor;
                uniform vec3 techColor;
                
                varying vec3 vPosition;
                varying vec3 vNormal;
                varying vec2 vUv;
                
                void main() {
                    // Create circuit-like patterns
                    vec2 circuitUv = vUv * 6.0;
                    float circuit1 = step(0.95, sin(circuitUv.x * 3.14159));
                    float circuit2 = step(0.95, sin(circuitUv.y * 3.14159));
                    float circuits = max(circuit1, circuit2);
                    
                    // Add wing edge highlights
                    float edgeGlow = smoothstep(0.1, 0.0, min(vUv.x, 1.0 - vUv.x));
                    edgeGlow += smoothstep(0.1, 0.0, min(vUv.y, 1.0 - vUv.y));
                    
                    // Mix colors
                    vec3 finalColor = baseColor;
                    finalColor = mix(finalColor, techColor, circuits * 0.5);
                    finalColor += techColor * edgeGlow * 0.3;
                    
                    gl_FragColor = vec4(finalColor, 1.0);
                }
            `
        });
    }
    
    /**
     * Creates the enhanced spaceship with detailed components
     */
    createEnhancedSpaceship() {
        // Main hull with procedural texture
        const hullGeometry = new THREE.BoxGeometry(8, 2, 3);
        const hullMaterial = this.createHullMaterial();
        
        this.hull = new THREE.Mesh(hullGeometry, hullMaterial);
        this.hull.position.set(0, 0, 0);
        this.group.add(this.hull);
        
        // Add hull details - side panels
        const sidePanelGeometry = new THREE.BoxGeometry(6, 1.8, 0.2);
        const sidePanelMaterial = new THREE.MeshBasicMaterial({ color: 0xBBBBBB });
        
        const leftSidePanel = new THREE.Mesh(sidePanelGeometry, sidePanelMaterial);
        leftSidePanel.position.set(0, 0, 1.6);
        this.group.add(leftSidePanel);
        
        const rightSidePanel = new THREE.Mesh(sidePanelGeometry, sidePanelMaterial);
        rightSidePanel.position.set(0, 0, -1.6);
        this.group.add(rightSidePanel);
        
        // Cockpit with enhanced transparency and inner detail
        const cockpitGeometry = new THREE.SphereGeometry(1.5, 12, 12);
        const cockpitMaterial = new THREE.MeshBasicMaterial({
            color: 0x4A90E2,
            transparent: true,
            opacity: 0.7
        });
        
        this.cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
        this.cockpit.position.set(3, 0.5, 0);
        this.group.add(this.cockpit);
        
        // Cockpit inner frame
        const frameGeometry = new THREE.SphereGeometry(1.3, 8, 8);
        const frameMaterial = new THREE.MeshBasicMaterial({
            color: 0x333333,
            wireframe: true
        });
        const cockpitFrame = new THREE.Mesh(frameGeometry, frameMaterial);
        cockpitFrame.position.copy(this.cockpit.position);
        this.group.add(cockpitFrame);
        
        // Enhanced wings - wider using simple geometry
        const wingMaterial = this.createWingMaterial();
        
        // Use simple box geometry but make it wider and simulate taper with multiple segments
        const wingRootGeometry = new THREE.BoxGeometry(4, 0.5, 1.5); // Root section - wider
        const wingTipGeometry = new THREE.BoxGeometry(2.5, 0.4, 1); // Tip section - narrower
        
        // Left wing - create tapered effect with two segments
        const leftWingRoot = new THREE.Mesh(wingRootGeometry, wingMaterial);
        leftWingRoot.position.set(-1, 0, 2.5); // Root positioned normally
        this.wings.push(leftWingRoot);
        this.group.add(leftWingRoot);
        
        const leftWingTip = new THREE.Mesh(wingTipGeometry, wingMaterial);
        leftWingTip.position.set(-1.75, 0, 4.5); // Tip moved back to create front taper
        this.wings.push(leftWingTip);
        this.group.add(leftWingTip);
        
        // Right wing - create tapered effect with two segments  
        const rightWingRoot = new THREE.Mesh(wingRootGeometry, wingMaterial);
        rightWingRoot.position.set(-1, 0, -2.5); // Root positioned normally
        this.wings.push(rightWingRoot);
        this.group.add(rightWingRoot);
        
        const rightWingTip = new THREE.Mesh(wingTipGeometry, wingMaterial);
        rightWingTip.position.set(-1.75, 0, -4.5); // Tip moved back to create front taper
        this.wings.push(rightWingTip);
        this.group.add(rightWingTip);
        
        // Wing tip lights
        const tipLightGeometry = new THREE.SphereGeometry(0.3, 8, 8);
        const redLightMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xFF0000,
            emissive: 0xFF0000,
            emissiveIntensity: 0.5
        });
        const greenLightMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x00FF00,
            emissive: 0x00FF00,
            emissiveIntensity: 0.5
        });
        
        const leftTipLight = new THREE.Mesh(tipLightGeometry, redLightMaterial);
        leftTipLight.position.set(-1.75, 0, 5.5); // Position at left wing tip
        this.group.add(leftTipLight);
        
        const rightTipLight = new THREE.Mesh(tipLightGeometry, greenLightMaterial);
        rightTipLight.position.set(-1.75, 0, -5.5); // Position at right wing tip
        this.group.add(rightTipLight);
        
        // Enhanced engines with more detail
        const engineGeometry = new THREE.BoxGeometry(2, 1, 1);
        const engineMaterial = new THREE.MeshBasicMaterial({ color: 0x666666 });
        
        const leftEngine = new THREE.Mesh(engineGeometry, engineMaterial);
        leftEngine.position.set(-4, 0, 1.5);
        this.engines.push(leftEngine);
        this.group.add(leftEngine);
        
        const rightEngine = new THREE.Mesh(engineGeometry, engineMaterial);
        rightEngine.position.set(-4, 0, -1.5);
        this.engines.push(rightEngine);
        this.group.add(rightEngine);
        
        // Engine exhausts with animated material
        const exhaustGeometry = new THREE.CylinderGeometry(0.4, 0.6, 0.8, 8);
        const exhaustMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0.0 },
                exhaustColor: { value: new THREE.Color(0xFF4444) }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec3 exhaustColor;
                varying vec2 vUv;
                
                void main() {
                    float heat = sin(vUv.y * 10.0 + time * 8.0) * 0.3 + 0.7;
                    vec3 finalColor = exhaustColor * heat;
                    gl_FragColor = vec4(finalColor, 1.0);
                }
            `
        });
        
        const leftExhaust = new THREE.Mesh(exhaustGeometry, exhaustMaterial);
        leftExhaust.position.set(-5, 0, 1.5);
        leftExhaust.rotation.z = Math.PI / 2;
        this.group.add(leftExhaust);
        
        const rightExhaust = new THREE.Mesh(exhaustGeometry, exhaustMaterial.clone());
        rightExhaust.position.set(-5, 0, -1.5);
        rightExhaust.rotation.z = Math.PI / 2;
        this.group.add(rightExhaust);
        
        // Engine glow effects with better animation
        const glowGeometry = new THREE.SphereGeometry(0.8, 8, 8);
        const glowMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0.0 },
                glowColor: { value: new THREE.Color(0x00FFFF) }
            },
            vertexShader: `
                varying vec3 vNormal;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec3 glowColor;
                varying vec3 vNormal;
                
                void main() {
                    float glow = pow(0.7 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
                    float pulse = sin(time * 6.0) * 0.3 + 0.7;
                    gl_FragColor = vec4(glowColor * glow * pulse, glow * 0.8);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending
        });
        
        const leftGlow = new THREE.Mesh(glowGeometry, glowMaterial);
        leftGlow.position.set(-5.5, 0, 1.5);
        this.group.add(leftGlow);
        
        const rightGlow = new THREE.Mesh(glowGeometry, glowMaterial.clone());
        rightGlow.position.set(-5.5, 0, -1.5);
        this.group.add(rightGlow);
        
        // Add mechanical details - antenna
        const antennaGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2, 8);
        const antennaMaterial = new THREE.MeshBasicMaterial({ color: 0x888888 });
        const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
        antenna.position.set(2, 2, 0);
        this.group.add(antenna);
        
        // Antenna tip light
        const antennaLightGeometry = new THREE.SphereGeometry(0.1, 6, 6);
        const antennaLightMaterial = new THREE.MeshBasicMaterial({
            color: 0x00FF00,
            emissive: 0x00FF00,
            emissiveIntensity: 0.8
        });
        const antennaLight = new THREE.Mesh(antennaLightGeometry, antennaLightMaterial);
        antennaLight.position.set(2, 3, 0);
        this.group.add(antennaLight);
        
        // Add ventilation grilles
        for (let i = 0; i < 6; i++) {
            const grillGeometry = new THREE.BoxGeometry(0.8, 0.1, 0.1);
            const grillMaterial = new THREE.MeshBasicMaterial({ color: 0x333333 });
            const grill = new THREE.Mesh(grillGeometry, grillMaterial);
            grill.position.set(-2 + i * 0.5, 0.8, 0);
            this.group.add(grill);
        }
        
        // Add hull bolts/rivets
        for (let i = 0; i < 8; i++) {
            const boltGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.2, 6);
            const boltMaterial = new THREE.MeshBasicMaterial({ color: 0x444444 });
            const bolt = new THREE.Mesh(boltGeometry, boltMaterial);
            bolt.position.set(-3 + i * 0.8, 0.9, 0);
            bolt.rotation.x = Math.PI / 2;
            this.group.add(bolt);
        }
        
        console.log('🎨 Created enhanced spaceship with procedural textures and mechanical details');
    }
    
    /**
     * Updates spaceship animations and shader uniforms
     */
    update() {
        const elapsedTime = this.clock.getElapsedTime();
        
        // Gentle hovering motion
        this.hoverOffset = Math.sin(elapsedTime * 1.5) * 0.5;
        this.group.position.y = this.position.y + this.hoverOffset;
        
        // Subtle roll motion
        this.group.rotation.z = Math.sin(elapsedTime * 0.8) * 0.03;
        
        // Update shader uniforms
        this.group.traverse(child => {
            if (child.material && child.material.uniforms) {
                if (child.material.uniforms.time) {
                    child.material.uniforms.time.value = elapsedTime;
                }
            }
        });
        
        // Animate antenna light
        const antennaLightIntensity = 0.5 + Math.sin(elapsedTime * 3) * 0.3;
        this.group.traverse(child => {
            if (child.material && child.material.emissive && child.position.y > 2.5) {
                child.material.emissiveIntensity = antennaLightIntensity;
            }
        });
    }
    
    /**
     * Get the spaceship's 3D group
     */
    getGroup() {
        return this.group;
    }
    
    /**
     * Get spaceship information
     */
    getInfo() {
        return {
            id: this.id,
            name: 'Explorer Vessel MK-II',
            theme: this.theme,
            description: 'Your enhanced spacecraft for navigating the professional galaxy'
        };
    }
    
    /**
     * Set spaceship position
     */
    setPosition(x, y, z) {
        this.position = { x, y, z };
        this.group.position.set(x, y, z);
    }
    
    /**
     * Get current spaceship position
     */
    getPosition() {
        return this.group.position.clone();
    }
    
    /**
     * Show/hide spaceship
     */
    setVisible(visible) {
        this.group.visible = visible;
    }
    
    /**
     * Dispose of resources
     */
    dispose() {
        this.group.traverse(child => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(material => material.dispose());
                } else {
                    child.material.dispose();
                }
            }
        });
        
        if (this.scene) {
            this.scene.remove(this.group);
        }
        
        console.log('🗑️ Enhanced Spaceship disposed');
    }
}

// Export for ES6 modules
export { Spaceship };

// Fallback for older browsers
if (typeof window !== 'undefined') {
    window.Spaceship = Spaceship;
}