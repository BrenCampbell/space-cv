/**
 * CommunitySphere.js - Community Work & Giving Back Planet Component
 * 
 * Earth-like/organic themed planet representing humanity and community
 * Green/earth tones color scheme for community and environmental themes
 */

class CommunitySphere {
    constructor(scene, position = { x: -80, y: -20, z: -120 }) {
        this.scene = scene;
        this.position = position;
        
        // Planet properties
        this.id = 'community-planet';
        this.theme = 'organic';
        this.radius = 17;
        this.rotationSpeed = 0.0018;
        
        // Community color scheme - Green/earth tones
        this.colors = {
            surface: new THREE.Color(0x2ECC71),      // Vibrant green
            forest: new THREE.Color(0x27AE60),      // Forest green
            earth: new THREE.Color(0x8B4513),       // Earth brown
            atmosphere: new THREE.Color(0x7DCEA0),  // Soft green atmosphere
            life: new THREE.Color(0x58D68D),        // Life energy
        };
        
        // Component groups
        this.group = new THREE.Group();
        this.surface = null;
        this.atmosphere = null;
        this.clouds = [];
        
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
        console.log('🤝 Initializing CommunitySphere component...');
        
        // Set position
        this.group.position.set(this.position.x, this.position.y, this.position.z);
        
        // Create planet components
        this.createPlanetSurface();
        this.createAtmosphere();
        this.createCloudFormations();
        this.addPlanetLighting();
        
        // Add to scene
        this.scene.add(this.group);
        
        console.log('✅ CommunitySphere initialized successfully');
    }
    
    /**
     * Creates the main planet surface with organic earth-like patterns
     */
    createPlanetSurface() {
        const geometry = new THREE.SphereGeometry(this.radius, 64, 64);
        
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0.0 },
                surfaceColor: { value: this.colors.surface },
                forestColor: { value: this.colors.forest },
                earthColor: { value: this.colors.earth },
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
                uniform vec3 forestColor;
                uniform vec3 earthColor;
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
                    
                    vec3 frontLightDir = normalize(vec3(0.0, 0.0, 1.0));
                    float frontLight = max(dot(vNormal, frontLightDir), 0.0) * 0.4;
                    
                    float totalLight = diff + frontLight + 0.3;
                    totalLight = min(totalLight, 1.0);
                    
                    // Create organic earth-like patterns
                    vec3 noisePos = vSpherePosition * 3.0;
                    float terrain = fbm(noisePos);
                    
                    // Add forest regions
                    float forestPattern = fbm(noisePos * 2.0);
                    
                    // Create land/forest distinction
                    float forestLevel = 0.4;
                    float earthLevel = 0.2;
                    
                    vec3 baseColor;
                    if (terrain < earthLevel) {
                        baseColor = earthColor;
                    } else if (terrain < forestLevel) {
                        baseColor = mix(earthColor, surfaceColor, (terrain - earthLevel) / (forestLevel - earthLevel));
                    } else {
                        baseColor = mix(surfaceColor, forestColor, forestPattern);
                    }
                    
                    // Add living, breathing effect
                    float lifeEnergy = sin(time * 1.5 + terrain * 8.0) * 0.1 + 0.9;
                    baseColor *= lifeEnergy;
                    
                    // Add organic variation
                    float organicVariation = noise3D(vSpherePosition * 10.0) * 0.2 + 0.8;
                    baseColor *= organicVariation;
                    
                    // Apply lighting
                    vec3 finalColor = baseColor * totalLight;
                    
                    // Add life glow
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
                    float glow = pow(0.65 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
                    float pulse = sin(time * 1.2) * 0.15 + 0.85; // Gentle, life-like pulse
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
     * Creates floating cloud formations
     */
    createCloudFormations() {
        for (let i = 0; i < 5; i++) {
            const cloudGeometry = new THREE.SphereGeometry(2 + Math.random() * 3, 8, 8);
            const cloudMaterial = new THREE.MeshPhongMaterial({
                color: 0xFFFFFF,
                transparent: true,
                opacity: 0.3 + Math.random() * 0.2,
                emissive: new THREE.Color(0x7DCEA0),
                emissiveIntensity: 0.1
            });
            
            const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
            
            // Position clouds around planet
            const angle = (i / 5) * Math.PI * 2;
            const distance = this.radius * (1.3 + Math.random() * 0.3);
            const height = (Math.random() - 0.5) * this.radius * 0.4;
            
            cloud.position.set(
                Math.cos(angle) * distance,
                height,
                Math.sin(angle) * distance
            );
            
            cloud.scale.set(
                1 + Math.random() * 0.5,
                0.5 + Math.random() * 0.3,
                1 + Math.random() * 0.5
            );
            
            this.clouds.push(cloud);
            this.group.add(cloud);
        }
    }
    
    /**
     * Adds dedicated lighting
     */
    addPlanetLighting() {
        const frontLight = new THREE.DirectionalLight(0xFFFFFF, 0.7);
        frontLight.position.set(20, 15, 50);
        frontLight.target.position.set(0, 0, 0);
        this.group.add(frontLight);
        this.group.add(frontLight.target);
        
        const fillLight = new THREE.DirectionalLight(0x7DCEA0, 0.4);
        fillLight.position.set(-30, -10, 30);
        fillLight.target.position.set(0, 0, 0);
        this.group.add(fillLight);
        this.group.add(fillLight.target);
        
        const rimLight = new THREE.DirectionalLight(0x2ECC71, 0.5);
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
        
        // Animate floating clouds
        this.clouds.forEach((cloud, index) => {
            if (!this.isRotating) {
                // Gentle cloud drift
                cloud.rotation.y += 0.005;
                
                // Slow cloud movement
                const driftSpeed = 0.0005 * (index + 1);
                cloud.position.x += Math.cos(elapsedTime * driftSpeed) * 0.08;
                cloud.position.z += Math.sin(elapsedTime * driftSpeed) * 0.08;
                
                // Gentle vertical bobbing
                cloud.position.y += Math.sin(elapsedTime * 1.5 + index * 2) * 0.03;
                
                // Breathing effect
                const breathe = Math.sin(elapsedTime * 0.8 + index) * 0.1 + 1.0;
                cloud.scale.x = breathe;
                cloud.scale.z = breathe;
            }
        });
        
        // Update surface shader
        if (this.surface && this.surface.material.uniforms) {
            this.surface.material.uniforms.time.value = elapsedTime;
        }
        
        // Update atmosphere
        if (this.atmosphere && this.atmosphere.material.uniforms) {
            this.atmosphere.material.uniforms.time.value = elapsedTime;
            this.atmosphere.material.uniforms.intensity.value = this.isHovered ? 0.55 : 0.4;
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
        console.log('🤝 CommunitySphere clicked - Opening community content');
        
        this.targetScale = 1.15;
        setTimeout(() => {
            this.targetScale = this.isHovered ? 1.05 : 1.0;
        }, 200);
        
        if (typeof window !== 'undefined') {
            document.dispatchEvent(new CustomEvent('showCommunityContent', {
                detail: { planetId: 'community' }
            }));
        }
    }
    
    getGroup() {
        return this.group;
    }
    
    getInfo() {
        return {
            id: this.id,
            name: 'Community Sphere',
            theme: this.theme,
            description: 'Explore Brendan\'s community work and contributions to society',
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
        
        console.log('🗑️ CommunitySphere disposed');
    }
}

// Export for ES6 modules
export { CommunitySphere };

// Fallback for older browsers
if (typeof window !== 'undefined') {
    window.CommunitySphere = CommunitySphere;
}