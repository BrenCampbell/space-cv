/**
 * EducationWorld.js - Education & Learning Experience Planet Component
 * 
 * FIXED VERSION: Seamless textures and proper individual planet rotation
 * Knowledge-themed planet with academic visual elements and educational content
 */

class EducationWorld {
    constructor(scene, position = { x: 40, y: 0, z: 0 }) {
        this.scene = scene;
        this.position = position;
        
        // Planet properties
        this.id = 'education-planet';
        this.theme = 'academic';
        this.radius = 18;
        this.rotationSpeed = 0.0015;
        
        // Academic color scheme
        this.colors = {
            surface: new THREE.Color(0x9B59B6),      // Rich purple
            knowledge: new THREE.Color(0x8E44AD),    // Deep violet
            wisdom: new THREE.Color(0xBB8FCE),       // Light purple
            atmosphere: new THREE.Color(0xD7BDE2),   // Soft lavender atmosphere
            energy: new THREE.Color(0xE8DAEF),       // Light energy fields
        };
        
        // Component groups
        this.group = new THREE.Group();
        this.surface = null;
        this.atmosphere = null;
        this.knowledgeRings = [];
        
        // Animation properties
        this.clock = new THREE.Clock();
        this.isHovered = false;
        this.baseScale = 1.0;
        this.targetScale = 1.0;
        
        // Individual planet rotation
        this.isRotating = false;
        this.rotationStartMouse = { x: 0, y: 0 };
        this.rotationDelta = { x: 0, y: 0 };
        
        this.init();
    }
    
    init() {
        console.log('📚 Initializing EducationWorld component...');
        
        // Set position
        this.group.position.set(this.position.x, this.position.y, this.position.z);
        
        // Create planet components
        this.createPlanetSurface();
        this.createAtmosphere();
        this.createKnowledgeRings();
        this.addPlanetLighting();
        
        // Add to scene
        this.scene.add(this.group);
        
        console.log('✅ EducationWorld initialized successfully');
    }
    
    /**
     * Creates the main planet surface with seamless academic-themed terrain
     */
    createPlanetSurface() {
        const geometry = new THREE.SphereGeometry(this.radius, 64, 64);
        
        // Create custom shader material with seamless academic surface
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0.0 },
                surfaceColor: { value: this.colors.surface },
                knowledgeColor: { value: this.colors.knowledge },
                wisdomColor: { value: this.colors.wisdom },
                lightPosition: { value: new THREE.Vector3(100, 100, 100) }
            },
            vertexShader: `
                varying vec3 vPosition;
                varying vec3 vNormal;
                varying vec2 vUv;
                varying vec3 vWorldPosition;
                varying vec3 vSpherePosition;
                uniform float time;
                
                void main() {
                    vPosition = position;
                    vNormal = normal;
                    vUv = uv;
                    vSpherePosition = normalize(position); // Seamless sphere mapping
                    
                    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                    vWorldPosition = worldPosition.xyz;
                    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 surfaceColor;
                uniform vec3 knowledgeColor;
                uniform vec3 wisdomColor;
                uniform vec3 lightPosition;
                uniform float time;
                
                varying vec3 vPosition;
                varying vec3 vNormal;
                varying vec2 vUv;
                varying vec3 vWorldPosition;
                varying vec3 vSpherePosition;
                
                // Improved 3D noise for seamless mapping
                float hash(vec3 p) {
                    p = fract(p * 0.3183099 + 0.1);
                    p *= 17.0;
                    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
                }
                
                float noise3D(vec3 p) {
                    vec3 i = floor(p);
                    vec3 f = fract(p);
                    f = f * f * (3.0 - 2.0 * f);
                    
                    return mix(
                        mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
                            mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
                        mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
                            mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
                }
                
                float fbm(vec3 p) {
                    float value = 0.0;
                    float amplitude = 0.5;
                    float frequency = 1.0;
                    
                    for(int i = 0; i < 4; i++) {
                        value += amplitude * noise3D(p * frequency);
                        amplitude *= 0.5;
                        frequency *= 2.0;
                    }
                    return value;
                }
                
                void main() {
                    // Calculate lighting
                    vec3 lightDir = normalize(lightPosition - vWorldPosition);
                    float diff = max(dot(vNormal, lightDir), 0.2);
                    
                    // Add front lighting boost
                    vec3 frontLightDir = normalize(vec3(0.0, 0.0, 1.0));
                    float frontLight = max(dot(vNormal, frontLightDir), 0.0) * 0.4;
                    
                    // Combine lighting
                    float totalLight = diff + frontLight + 0.3;
                    totalLight = min(totalLight, 1.0);
                    
                    // Use 3D sphere position for seamless academic patterns
                    vec3 noisePos = vSpherePosition * 6.0;
                    float pattern = fbm(noisePos);
                    
                    // Add neural network-like fine detail
                    pattern += fbm(noisePos * 2.0) * 0.4;
                    
                    // Create knowledge/wisdom distinction
                    float knowledgeLevel = 0.5;
                    float isWisdom = smoothstep(knowledgeLevel - 0.1, knowledgeLevel + 0.1, pattern);
                    
                    // Mix colors based on pattern
                    vec3 baseColor = mix(knowledgeColor, wisdomColor, isWisdom);
                    
                    // Add pulsing energy lines using 3D coordinates (synapses effect)
                    vec3 energyPos = vSpherePosition * 20.0 + time * 0.5;
                    float energyLines = sin(energyPos.x) * sin(energyPos.y) * sin(energyPos.z);
                    energyLines = smoothstep(0.6, 0.8, energyLines);
                    baseColor += surfaceColor * energyLines * 0.3;
                    
                    // Add surface variation using 3D noise
                    float surfaceVariation = noise3D(vSpherePosition * 12.0) * 0.15 + 0.85;
                    baseColor *= surfaceVariation;
                    
                    // Apply enhanced lighting
                    vec3 finalColor = baseColor * totalLight;
                    
                    // Add mystical rim lighting
                    float rimFactor = 1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0));
                    finalColor += wisdomColor * rimFactor * 0.2;
                    
                    gl_FragColor = vec4(finalColor, 1.0);
                }
            `
        });
        
        this.surface = new THREE.Mesh(geometry, material);
        this.group.add(this.surface);
    }
    
    /**
     * Creates atmospheric glow effect with academic theme
     */
    createAtmosphere() {
        const atmosphereGeometry = new THREE.SphereGeometry(this.radius * 1.3, 32, 32);
        const atmosphereMaterial = new THREE.ShaderMaterial({
            uniforms: {
                atmosphereColor: { value: this.colors.atmosphere },
                intensity: { value: 0.3 },
                time: { value: 0.0 }
            },
            vertexShader: `
                varying vec3 vNormal;
                varying vec3 vPosition;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    vPosition = position;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 atmosphereColor;
                uniform float intensity;
                uniform float time;
                varying vec3 vNormal;
                varying vec3 vPosition;
                
                void main() {
                    float glow = pow(0.65 - dot(vNormal, vec3(0, 0, 1.0)), 2.5);
                    float pulse = sin(time * 0.8) * 0.2 + 0.8;
                    gl_FragColor = vec4(atmosphereColor * glow * intensity * pulse, glow * 0.4);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide
        });
        
        this.atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        this.group.add(this.atmosphere);
    }
    
    /**
     * Creates knowledge rings around the planet
     */
    createKnowledgeRings() {
        // Inner knowledge ring
        const innerRingGeometry = new THREE.RingGeometry(this.radius * 1.4, this.radius * 1.6, 32);
        const innerRingMaterial = new THREE.MeshBasicMaterial({
            color: this.colors.knowledge,
            transparent: true,
            opacity: 0.4,
            side: THREE.DoubleSide
        });
        
        const innerRing = new THREE.Mesh(innerRingGeometry, innerRingMaterial);
        innerRing.rotation.x = Math.PI / 2 + 0.2;
        this.group.add(innerRing);
        
        // Outer wisdom ring
        const outerRingGeometry = new THREE.RingGeometry(this.radius * 1.8, this.radius * 2.0, 32);
        const outerRingMaterial = new THREE.MeshBasicMaterial({
            color: this.colors.wisdom,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        
        const outerRing = new THREE.Mesh(outerRingGeometry, outerRingMaterial);
        outerRing.rotation.x = Math.PI / 2 - 0.1;
        this.group.add(outerRing);
        
        this.knowledgeRings = [innerRing, outerRing];
    }
    
    /**
     * Adds dedicated lighting for better planet visibility
     */
    addPlanetLighting() {
        // Front key light with purple tint
        const frontLight = new THREE.DirectionalLight(0xFFFFFF, 0.7);
        frontLight.position.set(20, 15, 50);
        frontLight.target.position.set(0, 0, 0);
        this.group.add(frontLight);
        this.group.add(frontLight.target);
        
        // Subtle fill light with wisdom color
        const fillLight = new THREE.DirectionalLight(0xD7BDE2, 0.4);
        fillLight.position.set(-30, -10, 30);
        fillLight.target.position.set(0, 0, 0);
        this.group.add(fillLight);
        this.group.add(fillLight.target);
        
        // Academic rim light
        const rimLight = new THREE.DirectionalLight(0x9B59B6, 0.5);
        rimLight.position.set(0, 0, -40);
        rimLight.target.position.set(0, 0, 0);
        this.group.add(rimLight);
        this.group.add(rimLight.target);
    }
    
    /**
     * Handle individual planet rotation start
     */
    startRotation(mouseX, mouseY) {
        this.isRotating = true;
        this.rotationStartMouse.x = mouseX;
        this.rotationStartMouse.y = mouseY;
        console.log('🔄 Started EducationWorld individual rotation');
    }
    
    /**
     * Handle individual planet rotation update
     */
    updateRotation(mouseX, mouseY) {
        if (!this.isRotating) return;
        
        const deltaX = mouseX - this.rotationStartMouse.x;
        const deltaY = mouseY - this.rotationStartMouse.y;
        
        // Apply rotation to the planet group
        this.group.rotation.y += deltaX * 0.01;
        this.group.rotation.x += deltaY * 0.01;
        
        // Update start position for next frame
        this.rotationStartMouse.x = mouseX;
        this.rotationStartMouse.y = mouseY;
    }
    
    /**
     * Handle individual planet rotation end
     */
    stopRotation() {
        this.isRotating = false;
        console.log('⏹️ Stopped EducationWorld individual rotation');
    }
    
    /**
     * Check if point is within planet bounds for rotation detection
     */
    isPointOnPlanet(mouse, camera) {
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(this.group, true);
        return intersects.length > 0;
    }
    
    /**
     * Updates planet animation and effects
     */
    update() {
        const elapsedTime = this.clock.getElapsedTime();
        
        // Rotate the planet surface (automatic rotation)
        if (this.surface && !this.isRotating) {
            this.surface.rotation.y += this.rotationSpeed;
        }
        
        // Animate knowledge rings in opposite directions
        if (this.knowledgeRings && !this.isRotating) {
            this.knowledgeRings[0].rotation.z += 0.003; // Inner ring
            this.knowledgeRings[1].rotation.z -= 0.002; // Outer ring (opposite direction)
        }
        
        // Update surface shader
        if (this.surface && this.surface.material.uniforms) {
            this.surface.material.uniforms.time.value = elapsedTime;
        }
        
        // Update atmosphere
        if (this.atmosphere && this.atmosphere.material.uniforms) {
            this.atmosphere.material.uniforms.time.value = elapsedTime;
            this.atmosphere.material.uniforms.intensity.value = this.isHovered ? 0.5 : 0.3;
        }
        
        // Smooth scaling for hover effects
        const scaleDiff = this.targetScale - this.baseScale;
        this.baseScale += scaleDiff * 0.1;
        this.group.scale.set(this.baseScale, this.baseScale, this.baseScale);
    }
    
    /**
     * Handle hover interaction
     */
    onHover(isHovering) {
        this.isHovered = isHovering;
        this.targetScale = isHovering ? 1.05 : 1.0;
        
        console.log(`EducationWorld ${isHovering ? 'hovered' : 'unhovered'}`);
    }
    
    /**
     * Handle click interaction
     */
    onClick() {
        console.log('📚 EducationWorld clicked - Opening education content');
        
        // Brief animation effect
        this.targetScale = 1.15;
        setTimeout(() => {
            this.targetScale = this.isHovered ? 1.05 : 1.0;
        }, 200);
        
        // Trigger content display event
        if (typeof window !== 'undefined') {
            document.dispatchEvent(new CustomEvent('showEducationContent', {
                detail: { planetId: 'education' }
            }));
        }
    }
    
    /**
     * Get the planet's 3D group for raycasting
     */
    getGroup() {
        return this.group;
    }
    
    /**
     * Get planet information for UI
     */
    getInfo() {
        return {
            id: this.id,
            name: 'Knowledge World',
            theme: this.theme,
            description: 'Explore Brendan\'s educational background and learning journey',
            unlocked: true
        };
    }
    
    /**
     * Set planet position
     */
    setPosition(x, y, z) {
        this.position = { x, y, z };
        this.group.position.set(x, y, z);
    }
    
    /**
     * Get current planet position
     */
    getPosition() {
        return this.group.position.clone();
    }
    
    /**
     * Show/hide planet
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
                if (child.material.uniforms) {
                    // Dispose shader uniforms if needed
                }
                child.material.dispose();
            }
        });
        
        if (this.scene) {
            this.scene.remove(this.group);
        }
        
        console.log('🗑️ EducationWorld disposed');
    }
}

// Export for ES6 modules
export { EducationWorld };

// Fallback for older browsers
if (typeof window !== 'undefined') {
    window.EducationWorld = EducationWorld;
}