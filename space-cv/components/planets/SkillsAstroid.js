/**
 * SkillsAstroid.js - Technical Skills & Abilities Planet Component
 * 
 * Crystalline/geometric themed planet representing structured knowledge and technical skills
 * Blue/cyan color scheme for tech-focused theme
 */

class SkillsAstroid {
    constructor(scene, position = { x: 70, y: 15, z: -30 }) {
        this.scene = scene;
        this.position = position;
        
        // Planet properties
        this.id = 'skills-planet';
        this.theme = 'technical';
        this.radius = 16;
        this.rotationSpeed = 0.003; // Faster rotation for dynamic feel
        
        // Technical color scheme - Blue/cyan theme
        this.colors = {
            surface: new THREE.Color(0x3498DB),      // Bright blue
            core: new THREE.Color(0x2980B9),        // Deeper blue
            crystal: new THREE.Color(0x5DADE2),     // Light blue
            atmosphere: new THREE.Color(0x85C1E9),  // Soft blue atmosphere
            energy: new THREE.Color(0x00FFFF),      // Cyan energy
        };
        
        // Component groups
        this.group = new THREE.Group();
        this.surface = null;
        this.atmosphere = null;
        this.crystals = [];
        
        // Animation properties
        this.clock = new THREE.Clock();
        this.isHovered = false;
        this.baseScale = 1.0;
        this.targetScale = 1.0;
        
        // Individual planet rotation
        this.isRotating = false;
        this.rotationStartMouse = { x: 0, y: 0 };
        
        this.init();
    }
    
    init() {
        console.log('🛠️ Initializing SkillsAstroid component...');
        
        // Set position
        this.group.position.set(this.position.x, this.position.y, this.position.z);
        
        // Create planet components
        this.createPlanetSurface();
        this.createAtmosphere();
        this.createFloatingCrystals();
        this.addPlanetLighting();
        
        // Add to scene
        this.scene.add(this.group);
        
        console.log('✅ SkillsAstroid initialized successfully');
    }
    
    /**
     * Creates the main planet surface with crystalline patterns
     */
    createPlanetSurface() {
        const geometry = new THREE.SphereGeometry(this.radius, 64, 64);
        
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0.0 },
                surfaceColor: { value: this.colors.surface },
                coreColor: { value: this.colors.core },
                crystalColor: { value: this.colors.crystal },
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
                    vSpherePosition = normalize(position);
                    
                    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                    vWorldPosition = worldPosition.xyz;
                    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 surfaceColor;
                uniform vec3 coreColor;
                uniform vec3 crystalColor;
                uniform vec3 lightPosition;
                uniform float time;
                
                varying vec3 vPosition;
                varying vec3 vNormal;
                varying vec2 vUv;
                varying vec3 vWorldPosition;
                varying vec3 vSpherePosition;
                
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
                
                void main() {
                    // Calculate lighting
                    vec3 lightDir = normalize(lightPosition - vWorldPosition);
                    float diff = max(dot(vNormal, lightDir), 0.2);
                    
                    vec3 frontLightDir = normalize(vec3(0.0, 0.0, 1.0));
                    float frontLight = max(dot(vNormal, frontLightDir), 0.0) * 0.4;
                    
                    float totalLight = diff + frontLight + 0.3;
                    totalLight = min(totalLight, 1.0);
                    
                    // Create crystalline geometric patterns
                    vec3 noisePos = vSpherePosition * 8.0;
                    float pattern = noise3D(noisePos);
                    
                    // Add circuit-like patterns
                    float circuits = sin(noisePos.x * 10.0) * sin(noisePos.y * 10.0) * sin(noisePos.z * 10.0);
                    circuits = step(0.7, circuits);
                    
                    // Create crystal formations
                    float crystalLevel = 0.6;
                    float isCrystal = step(crystalLevel, pattern + circuits * 0.3);
                    
                    // Mix colors based on pattern
                    vec3 baseColor = mix(coreColor, surfaceColor, pattern);
                    baseColor = mix(baseColor, crystalColor, isCrystal);
                    
                    // Add pulsing energy lines
                    float energyPulse = sin(time * 3.0 + pattern * 10.0) * 0.5 + 0.5;
                    baseColor += crystalColor * circuits * energyPulse * 0.4;
                    
                    // Apply lighting
                    vec3 finalColor = baseColor * totalLight;
                    
                    // Add tech glow
                    float rimFactor = 1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0));
                    finalColor += surfaceColor * rimFactor * 0.2;
                    
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
        const atmosphereGeometry = new THREE.SphereGeometry(this.radius * 1.2, 32, 32);
        const atmosphereMaterial = new THREE.ShaderMaterial({
            uniforms: {
                atmosphereColor: { value: this.colors.atmosphere },
                intensity: { value: 0.35 },
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
                    float glow = pow(0.7 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
                    float pulse = sin(time * 2.0) * 0.2 + 0.8;
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
     * Creates floating crystals around the planet
     */
    createFloatingCrystals() {
        for (let i = 0; i < 8; i++) {
            const crystalGeometry = new THREE.OctahedronGeometry(1 + Math.random() * 2, 0);
            const crystalMaterial = new THREE.MeshPhongMaterial({
                color: this.colors.crystal,
                transparent: true,
                opacity: 0.7,
                emissive: this.colors.energy,
                emissiveIntensity: 0.2
            });
            
            const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
            
            // Position crystals in orbit around planet
            const angle = (i / 8) * Math.PI * 2;
            const distance = this.radius * (1.5 + Math.random() * 0.5);
            const height = (Math.random() - 0.5) * this.radius * 0.8;
            
            crystal.position.set(
                Math.cos(angle) * distance,
                height,
                Math.sin(angle) * distance
            );
            
            crystal.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            
            this.crystals.push(crystal);
            this.group.add(crystal);
        }
    }
    
    /**
     * Adds dedicated lighting
     */
    addPlanetLighting() {
        const frontLight = new THREE.DirectionalLight(0xFFFFFF, 0.8);
        frontLight.position.set(20, 15, 50);
        frontLight.target.position.set(0, 0, 0);
        this.group.add(frontLight);
        this.group.add(frontLight.target);
        
        const fillLight = new THREE.DirectionalLight(0x85C1E9, 0.4);
        fillLight.position.set(-30, -10, 30);
        fillLight.target.position.set(0, 0, 0);
        this.group.add(fillLight);
        this.group.add(fillLight.target);
        
        const rimLight = new THREE.DirectionalLight(0x3498DB, 0.5);
        rimLight.position.set(0, 0, -40);
        rimLight.target.position.set(0, 0, 0);
        this.group.add(rimLight);
        this.group.add(rimLight.target);
    }
    
    startRotation(mouseX, mouseY) {
        this.isRotating = true;
        this.rotationStartMouse.x = mouseX;
        this.rotationStartMouse.y = mouseY;
    }
    
    updateRotation(mouseX, mouseY) {
        if (!this.isRotating) return;
        
        const deltaX = mouseX - this.rotationStartMouse.x;
        const deltaY = mouseY - this.rotationStartMouse.y;
        
        this.group.rotation.y += deltaX * 0.01;
        this.group.rotation.x += deltaY * 0.01;
        
        this.rotationStartMouse.x = mouseX;
        this.rotationStartMouse.y = mouseY;
    }
    
    stopRotation() {
        this.isRotating = false;
    }
    
    /**
     * Updates planet animation and effects
     */
    update() {
        const elapsedTime = this.clock.getElapsedTime();
        
        // Rotate the planet surface
        if (this.surface && !this.isRotating) {
            this.surface.rotation.y += this.rotationSpeed;
        }
        
        // Animate floating crystals
        this.crystals.forEach((crystal, index) => {
            if (!this.isRotating) {
                crystal.rotation.x += 0.02;
                crystal.rotation.y += 0.015;
                crystal.rotation.z += 0.01;
                
                // Subtle orbital motion
                const orbitSpeed = 0.001 * (index + 1);
                crystal.position.x += Math.cos(elapsedTime * orbitSpeed) * 0.1;
                crystal.position.z += Math.sin(elapsedTime * orbitSpeed) * 0.1;
            }
        });
        
        // Update surface shader
        if (this.surface && this.surface.material.uniforms) {
            this.surface.material.uniforms.time.value = elapsedTime;
        }
        
        // Update atmosphere
        if (this.atmosphere && this.atmosphere.material.uniforms) {
            this.atmosphere.material.uniforms.time.value = elapsedTime;
            this.atmosphere.material.uniforms.intensity.value = this.isHovered ? 0.5 : 0.35;
        }
        
        // Smooth scaling for hover effects
        const scaleDiff = this.targetScale - this.baseScale;
        this.baseScale += scaleDiff * 0.1;
        this.group.scale.set(this.baseScale, this.baseScale, this.baseScale);
    }
    
    onHover(isHovering) {
        this.isHovered = isHovering;
        this.targetScale = isHovering ? 1.05 : 1.0;
    }
    
    onClick() {
        console.log('🛠️ SkillsAstroid clicked - Opening skills content');
        
        this.targetScale = 1.15;
        setTimeout(() => {
            this.targetScale = this.isHovered ? 1.05 : 1.0;
        }, 200);
        
        if (typeof window !== 'undefined') {
            document.dispatchEvent(new CustomEvent('showSkillsContent', {
                detail: { planetId: 'skills' }
            }));
        }
    }
    
    getGroup() {
        return this.group;
    }
    
    getInfo() {
        return {
            id: this.id,
            name: 'Skills Asteroid',
            theme: this.theme,
            description: 'Explore Brendan\'s technical skills and core competencies',
            unlocked: true
        };
    }
    
    setPosition(x, y, z) {
        this.position = { x, y, z };
        this.group.position.set(x, y, z);
    }
    
    getPosition() {
        return this.group.position.clone();
    }
    
    setVisible(visible) {
        this.group.visible = visible;
    }
    
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
        
        console.log('🗑️ SkillsAstroid disposed');
    }
}

// Export for ES6 modules
export { SkillsAstroid };

// Fallback for older browsers
if (typeof window !== 'undefined') {
    window.SkillsAstroid = SkillsAstroid;
}