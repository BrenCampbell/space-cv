/**
 * AchievementStar.js - Accolades & Achievements Planet Component
 * 
 * Golden/metallic themed planet representing awards and achievements
 * Gold/yellow color scheme for prestigious accomplishments
 */

class AchievementStar {
    constructor(scene, position = { x: -20, y: 35, z: -80 }) {
        this.scene = scene;
        this.position = position;
        
        // Planet properties
        this.id = 'projects-planet';
        this.theme = 'achievements';
        this.radius = 19;
        this.rotationSpeed = 0.001; // Majestic, slow rotation
        
        // Achievement color scheme - Gold/yellow theme
        this.colors = {
            surface: new THREE.Color(0xF1C40F),      // Bright gold
            core: new THREE.Color(0xF39C12),        // Deep gold
            platinum: new THREE.Color(0xE8E8E8),    // Platinum
            atmosphere: new THREE.Color(0xFCF3CF),  // Soft golden atmosphere
            energy: new THREE.Color(0xFFD700),      // Pure gold energy
        };
        
        // Component groups
        this.group = new THREE.Group();
        this.surface = null;
        this.atmosphere = null;
        this.trophies = [];
        
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
        console.log('🏆 Initializing AchievementStar component...');
        
        // Set position
        this.group.position.set(this.position.x, this.position.y, this.position.z);
        
        // Create planet components
        this.createPlanetSurface();
        this.createAtmosphere();
        this.createOrbitingTrophies();
        this.addPlanetLighting();
        
        // Add to scene
        this.scene.add(this.group);
        
        console.log('✅ AchievementStar initialized successfully');
    }
    
    /**
     * Creates the main planet surface with golden achievement patterns
     */
    createPlanetSurface() {
        const geometry = new THREE.SphereGeometry(this.radius, 64, 64);
        
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0.0 },
                surfaceColor: { value: this.colors.surface },
                coreColor: { value: this.colors.core },
                platinumColor: { value: this.colors.platinum },
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
                uniform vec3 platinumColor;
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
                    // Enhanced lighting for metallic surface
                    vec3 lightDir = normalize(lightPosition - vWorldPosition);
                    float diff = max(dot(vNormal, lightDir), 0.2);
                    
                    vec3 frontLightDir = normalize(vec3(0.0, 0.0, 1.0));
                    float frontLight = max(dot(vNormal, frontLightDir), 0.0) * 0.5;
                    
                    float totalLight = diff + frontLight + 0.4;
                    totalLight = min(totalLight, 1.2); // Allow overexposure for metallic shine
                    
                    // Create achievement medallion patterns
                    vec3 noisePos = vSpherePosition * 5.0;
                    float pattern = noise3D(noisePos);
                    
                    // Add medal/trophy shaped regions
                    float medalPattern = sin(noisePos.x * 3.0) * sin(noisePos.y * 3.0) * sin(noisePos.z * 3.0);
                    medalPattern = smoothstep(0.3, 0.7, medalPattern);
                    
                    // Create platinum vs gold distinction
                    float platinumLevel = 0.7;
                    float isPlatinum = step(platinumLevel, pattern + medalPattern * 0.3);
                    
                    // Mix colors based on pattern
                    vec3 baseColor = mix(coreColor, surfaceColor, pattern);
                    baseColor = mix(baseColor, platinumColor, isPlatinum);
                    
                    // Add shimmering effect
                    float shimmer = sin(time * 2.0 + pattern * 15.0) * 0.3 + 0.7;
                    baseColor *= shimmer;
                    
                    // Apply metallic lighting with enhanced reflectivity
                    vec3 finalColor = baseColor * totalLight;
                    
                    // Add golden rim glow
                    float rimFactor = 1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0));
                    finalColor += surfaceColor * rimFactor * 0.3;
                    
                    // Add specular highlights
                    vec3 viewDir = normalize(-vWorldPosition);
                    vec3 reflectDir = reflect(-lightDir, vNormal);
                    float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
                    finalColor += vec3(1.0, 1.0, 0.8) * spec * 0.5;
                    
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
                    float glow = pow(0.6 - dot(vNormal, vec3(0, 0, 1.0)), 2.2);
                    float pulse = sin(time * 1.0) * 0.15 + 0.85; // Slow, majestic pulse
                    gl_FragColor = vec4(atmosphereColor * glow * intensity * pulse, glow * 0.3);
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
     * Creates orbiting trophy/medal objects
     */
    createOrbitingTrophies() {
        for (let i = 0; i < 6; i++) {
            // Create trophy geometry (simplified trophy shape)
            const trophyGroup = new THREE.Group();
            
            // Trophy cup
            const cupGeometry = new THREE.CylinderGeometry(1, 1.5, 2, 8);
            const cupMaterial = new THREE.MeshPhongMaterial({
                color: i % 2 === 0 ? this.colors.surface : this.colors.platinum,
                shininess: 100,
                emissive: i % 2 === 0 ? this.colors.surface : this.colors.platinum,
                emissiveIntensity: 0.1
            });
            const cup = new THREE.Mesh(cupGeometry, cupMaterial);
            cup.position.y = 1;
            trophyGroup.add(cup);
            
            // Trophy base
            const baseGeometry = new THREE.CylinderGeometry(2, 2, 0.5, 8);
            const base = new THREE.Mesh(baseGeometry, cupMaterial);
            base.position.y = -0.5;
            trophyGroup.add(base);
            
            // Position trophies in orbit around planet
            const angle = (i / 6) * Math.PI * 2;
            const distance = this.radius * (1.8 + Math.random() * 0.4);
            const height = (Math.random() - 0.5) * this.radius * 0.6;
            
            trophyGroup.position.set(
                Math.cos(angle) * distance,
                height,
                Math.sin(angle) * distance
            );
            
            trophyGroup.scale.setScalar(0.5 + Math.random() * 0.3);
            
            this.trophies.push(trophyGroup);
            this.group.add(trophyGroup);
        }
    }
    
    /**
     * Adds dedicated lighting
     */
    addPlanetLighting() {
        const frontLight = new THREE.DirectionalLight(0xFFFFFF, 0.9);
        frontLight.position.set(20, 15, 50);
        frontLight.target.position.set(0, 0, 0);
        this.group.add(frontLight);
        this.group.add(frontLight.target);
        
        const fillLight = new THREE.DirectionalLight(0xFCF3CF, 0.5);
        fillLight.position.set(-30, -10, 30);
        fillLight.target.position.set(0, 0, 0);
        this.group.add(fillLight);
        this.group.add(fillLight.target);
        
        const rimLight = new THREE.DirectionalLight(0xF1C40F, 0.6);
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
        
        // Animate orbiting trophies
        this.trophies.forEach((trophy, index) => {
            if (!this.isRotating) {
                trophy.rotation.y += 0.02;
                
                // Majestic orbital motion
                const orbitSpeed = 0.0008 * (index + 1);
                trophy.position.x += Math.cos(elapsedTime * orbitSpeed) * 0.15;
                trophy.position.z += Math.sin(elapsedTime * orbitSpeed) * 0.15;
                
                // Gentle bobbing motion
                trophy.position.y += Math.sin(elapsedTime * 2 + index) * 0.05;
            }
        });
        
        // Update surface shader
        if (this.surface && this.surface.material.uniforms) {
            this.surface.material.uniforms.time.value = elapsedTime;
        }
        
        // Update atmosphere
        if (this.atmosphere && this.atmosphere.material.uniforms) {
            this.atmosphere.material.uniforms.time.value = elapsedTime;
            this.atmosphere.material.uniforms.intensity.value = this.isHovered ? 0.45 : 0.3;
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
        console.log('🏆 AchievementStar clicked - Opening projects content');
        
        this.targetScale = 1.15;
        setTimeout(() => {
            this.targetScale = this.isHovered ? 1.05 : 1.0;
        }, 200);
        
        if (typeof window !== 'undefined') {
            document.dispatchEvent(new CustomEvent('showProjectsContent', {
                detail: { planetId: 'projects' }
            }));
        }
    }
    
    getGroup() {
        return this.group;
    }
    
    getInfo() {
        return {
            id: this.id,
            name: 'Achievement Star',
            theme: this.theme,
            description: 'Explore Brendan\'s accolades, awards, and major achievements',
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
        
        console.log('🗑️ AchievementStar disposed');
    }
}

// Export for ES6 modules
export { AchievementStar };

// Fallback for older browsers
if (typeof window !== 'undefined') {
    window.AchievementStar = AchievementStar;
}