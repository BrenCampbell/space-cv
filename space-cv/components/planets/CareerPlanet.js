/**
 * CareerPlanet.js - Professional Work Experience Planet Component
 * 
 * FIXED VERSION: Seamless textures and proper individual planet rotation
 * Professional orange-themed planet with procedural terrain and atmospheric effects
 */

class CareerPlanet {
    constructor(scene, position = { x: 0, y: 0, z: 0 }) {
        this.scene = scene;
        this.position = position;
        
        // Planet properties
        this.id = 'work-planet';
        this.theme = 'professional';
        this.radius = 20;
        this.rotationSpeed = 0.002;
        
        // Professional color scheme
        this.colors = {
            surface: new THREE.Color(0xE67E22),      // Professional orange
            ocean: new THREE.Color(0x2E5984),       // Deep blue seas
            continent: new THREE.Color(0xCD853F),   // Earth-like continents
            atmosphere: new THREE.Color(0x87CEEB),  // Sky blue atmosphere
        };
        
        // Component groups
        this.group = new THREE.Group();
        this.surface = null;
        this.atmosphere = null;
        
        // Animation properties
        this.clock = new THREE.Clock();
        this.isHovered = false;
        this.baseScale = 1.0;
        this.targetScale = 1.0;
        
        // Individual planet rotation (separate from camera)
        this.isRotating = false;
        this.rotationStartMouse = { x: 0, y: 0 };
        this.rotationDelta = { x: 0, y: 0 };
        
        this.init();
    }
    
    init() {
        console.log('🏢 Initializing CareerPlanet component...');
        
        // Set position
        this.group.position.set(this.position.x, this.position.y, this.position.z);
        
        // Create planet components
        this.createPlanetSurface();
        this.createAtmosphere();
        this.addPlanetLighting();
        
        // Add to scene
        this.scene.add(this.group);
        
        console.log('✅ CareerPlanet initialized successfully');
    }
    
    /**
     * Creates the main planet surface with seamless procedural terrain
     */
    createPlanetSurface() {
        const geometry = new THREE.SphereGeometry(this.radius, 64, 64);
        
        // Create custom shader material with seamless textures
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0.0 },
                surfaceColor: { value: this.colors.surface },
                oceanColor: { value: this.colors.ocean },
                continentColor: { value: this.colors.continent },
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
                    vSpherePosition = normalize(position); // Normalized sphere position for seamless mapping
                    
                    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                    vWorldPosition = worldPosition.xyz;
                    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 surfaceColor;
                uniform vec3 oceanColor;
                uniform vec3 continentColor;
                uniform vec3 lightPosition;
                uniform float time;
                
                varying vec3 vPosition;
                varying vec3 vNormal;
                varying vec2 vUv;
                varying vec3 vWorldPosition;
                varying vec3 vSpherePosition;
                
                // Improved 3D noise function for seamless sphere mapping
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
                    
                    for(int i = 0; i < 5; i++) {
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
                    
                    // Use 3D sphere position for seamless noise - NO MORE SEAMS!
                    vec3 noisePos = vSpherePosition * 4.0;
                    float terrain = fbm(noisePos);
                    
                    // Add fine detail with different scale
                    terrain += fbm(noisePos * 3.0) * 0.3;
                    
                    // Create land/water distinction
                    float waterLevel = 0.45;
                    float isLand = smoothstep(waterLevel - 0.05, waterLevel + 0.05, terrain);
                    
                    // Mix colors based on terrain
                    vec3 baseColor = mix(oceanColor, continentColor, isLand);
                    
                    // Add surface variation using 3D noise for consistency
                    float surfaceVariation = noise3D(vSpherePosition * 15.0) * 0.15 + 0.85;
                    baseColor *= surfaceVariation;
                    
                    // Apply enhanced lighting
                    vec3 finalColor = baseColor * totalLight;
                    
                    // Add slight rim lighting for atmosphere effect
                    float rimFactor = 1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0));
                    finalColor += surfaceColor * rimFactor * 0.15;
                    
                    gl_FragColor = vec4(finalColor, 1.0);
                }
            `
        });
        
        this.surface = new THREE.Mesh(geometry, material);
        this.group.add(this.surface);
    }
    
    /**
     * Creates atmospheric glow effect
     */
    createAtmosphere() {
        const atmosphereGeometry = new THREE.SphereGeometry(this.radius * 1.25, 32, 32);
        const atmosphereMaterial = new THREE.ShaderMaterial({
            uniforms: {
                atmosphereColor: { value: this.colors.atmosphere },
                intensity: { value: 0.4 },
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
                    float glow = pow(0.6 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
                    float pulse = sin(time * 1.5) * 0.1 + 0.9;
                    gl_FragColor = vec4(atmosphereColor * glow * intensity * pulse, glow * 0.5);
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
     * Adds dedicated lighting for better planet visibility
     */
    addPlanetLighting() {
        // Front key light (slightly off-center for depth)
        const frontLight = new THREE.DirectionalLight(0xFFFFFF, 0.6);
        frontLight.position.set(20, 15, 50);
        frontLight.target.position.set(0, 0, 0);
        this.group.add(frontLight);
        this.group.add(frontLight.target);
        
        // Subtle fill light from the opposite side
        const fillLight = new THREE.DirectionalLight(0x87CEEB, 0.3);
        fillLight.position.set(-30, -10, 30);
        fillLight.target.position.set(0, 0, 0);
        this.group.add(fillLight);
        this.group.add(fillLight.target);
        
        // Warm rim light to enhance the professional orange theme
        const rimLight = new THREE.DirectionalLight(0xE67E22, 0.4);
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
        console.log('🔄 Started CareerPlanet individual rotation');
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
        console.log('⏹️ Stopped CareerPlanet individual rotation');
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
        
        // Update surface shader
        if (this.surface && this.surface.material.uniforms) {
            this.surface.material.uniforms.time.value = elapsedTime;
        }
        
        // Update atmosphere
        if (this.atmosphere && this.atmosphere.material.uniforms) {
            this.atmosphere.material.uniforms.time.value = elapsedTime;
            this.atmosphere.material.uniforms.intensity.value = this.isHovered ? 0.6 : 0.4;
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
        
        console.log(`CareerPlanet ${isHovering ? 'hovered' : 'unhovered'}`);
    }
    
    /**
     * Handle click interaction
     */
    onClick() {
        console.log('🏢 CareerPlanet clicked - Opening work experience content');
        
        // Brief animation effect
        this.targetScale = 1.15;
        setTimeout(() => {
            this.targetScale = this.isHovered ? 1.05 : 1.0;
        }, 200);
        
        // Trigger content display event
        if (typeof window !== 'undefined') {
            document.dispatchEvent(new CustomEvent('showWorkContent', {
                detail: { planetId: 'work' }
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
            name: 'Career Planet',
            theme: this.theme,
            description: 'Explore Brendan\'s professional journey and work experience',
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
        
        console.log('🗑️ CareerPlanet disposed');
    }
}

// Export for ES6 modules
export { CareerPlanet };

// Fallback for older browsers
if (typeof window !== 'undefined') {
    window.CareerPlanet = CareerPlanet;
}