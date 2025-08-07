/**
 * PortfolioNebula.js - Central Star with Floating Space Debris
 * 
 * Creates a bright central star with space rocks and debris floating in a wide oval
 * Simplified design focusing on clean interaction and visual appeal
 */

class PortfolioNebula {
    constructor(scene, position = { x: 0, y: 15, z: 20 }) {
        this.scene = scene;
        this.position = position;
        
        // Nebula properties
        this.id = 'portfolio-nebula';
        this.theme = 'stellar';
        
        // Color scheme - Bright star theme
        this.colors = {
            star: new THREE.Color(0xFFFFFF),        // Bright white star
            starCore: new THREE.Color(0xFFD700),    // Golden core
            debris: new THREE.Color(0x8B7355),     // Rocky brown debris
            rock: new THREE.Color(0x696969),       // Dark gray rocks
            glow: new THREE.Color(0x87CEEB)        // Soft blue glow
        };
        
        // Component groups
        this.group = new THREE.Group();
        this.centralStar = null;
        this.orbitalMist = [];
        this.spaceDebris = [];
        this.spaceRocks = [];
        this.hitBox = null;
        
        // Animation properties
        this.clock = new THREE.Clock();
        this.isHovered = false;
        this.baseScale = 1.0;
        this.targetScale = 1.0;
        
        this.init();
    }
    
    init() {
        console.log('⭐ Initializing PortfolioNebula with central star...');
        
        // Set position
        this.group.position.set(this.position.x, this.position.y, this.position.z);
        
        // Create components
        this.createCentralStar();
        this.createOrbitalMist();
        this.createSpaceRocks();
        this.createSpaceDebris();
        this.createHitBox();
        this.addStarLighting();
        
        // Add to scene
        this.scene.add(this.group);
        
        console.log('✅ PortfolioNebula initialized with central star, orbital mist, and space debris');
    }
    
    /**
     * Creates a bright central star with gravitational stretching effect
     */
    createCentralStar() {
        // Main star sphere
        const starGeometry = new THREE.SphereGeometry(2.5, 32, 32);
        
        // Deform the star geometry to create tapered oval shape
        const vertices = starGeometry.attributes.position;
        for (let i = 0; i < vertices.count; i++) {
            const x = vertices.getX(i);
            const y = vertices.getY(i);
            const z = vertices.getZ(i);
            
            // Calculate distance from center along X-axis (horizontal)
            const xDistance = Math.abs(x) / 2.5; // Normalize to 0-1
            
            // Taper factor - thinner at the sides
            const taperFactor = 1.0 - (xDistance * xDistance * 0.4); // Quadratic taper
            
            // Apply taper to Y and Z dimensions
            vertices.setY(i, y * taperFactor);
            vertices.setZ(i, z * taperFactor);
        }
        starGeometry.computeVertexNormals();
        
        const starMaterial = new THREE.MeshBasicMaterial({
            color: this.colors.star,
            emissive: this.colors.starCore,
            emissiveIntensity: 0.8
        });
        
        this.centralStar = new THREE.Mesh(starGeometry, starMaterial);
        this.centralStar.position.set(0, 0, 0);
        
        // Make star much wider horizontally with gravitational stretching
        this.centralStar.scale.set(1.8, 0.7, 1.0); // Much wider horizontally, shorter vertically
        
        // Add star glow effect with reduced pulsing
        const glowGeometry = new THREE.SphereGeometry(4, 16, 16);
        const glowMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0.0 },
                glowColor: { value: this.colors.glow }
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
                uniform float time;
                uniform vec3 glowColor;
                varying vec3 vNormal;
                varying vec3 vPosition;
                
                void main() {
                    float glow = pow(0.8 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
                    // Reduced pulse: stays around 0.9-1.0 instead of 0.8-1.0
                    float pulse = sin(time * 2.0) * 0.05 + 0.95;
                    gl_FragColor = vec4(glowColor * glow * pulse, glow * 0.3);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide
        });
        
        const starGlow = new THREE.Mesh(glowGeometry, starMaterial);
        
        // Apply same scaling and deformation to glow as main star
        const glowVertices = glowGeometry.attributes.position;
        for (let i = 0; i < glowVertices.count; i++) {
            const x = glowVertices.getX(i);
            const y = glowVertices.getY(i);
            const z = glowVertices.getZ(i);
            
            // Calculate distance from center along X-axis
            const xDistance = Math.abs(x) / 4; // Normalize to 0-1 for glow sphere
            
            // Same taper factor as main star
            const taperFactor = 1.0 - (xDistance * xDistance * 0.4);
            
            // Apply taper to Y and Z dimensions
            glowVertices.setY(i, y * taperFactor);
            glowVertices.setZ(i, z * taperFactor);
        }
        glowGeometry.computeVertexNormals();
        
        starGlow.material = glowMaterial; // Apply the glow material
        starGlow.scale.set(1.8, 0.7, 1.0); // Match main star scaling
        this.centralStar.add(starGlow);
        
        this.group.add(this.centralStar);
        
        console.log('⭐ Created bright central star with glow effect');
    }
    
    /**
     * Creates multiple subtle red/black mist rings for smoke effect
     */
    createOrbitalMist() {
        const mistRings = 6; // Increased from 4 to 6 rings for richer smoke effect
        
        for (let i = 0; i < mistRings; i++) {
            // Create wider ring geometry for each layer
            const mistGeometry = new THREE.RingGeometry(
                8 + i * 2,  // Inner radius - varies per ring
                28 + i * 3, // Outer radius - much wider, varies per ring
                32,         // Theta segments
                8           // Phi segments
            );
            
            const mistMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    time: { value: 0.0 },
                    mistColor: { value: new THREE.Color(0xDC143C) }, // Brighter crimson red
                    darkColor: { value: new THREE.Color(0x8B0000) }, // Brighter dark red
                    ringIndex: { value: i }
                },
                vertexShader: `
                    varying vec3 vPosition;
                    varying vec2 vUv;
                    
                    void main() {
                        vPosition = position;
                        vUv = uv;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    uniform float time;
                    uniform vec3 mistColor;
                    uniform vec3 darkColor;
                    uniform float ringIndex;
                    
                    varying vec3 vPosition;
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
                        // Create flowing mist pattern with ring variation
                        vec2 mistUv = vUv * (3.0 + ringIndex) + vec2(time * (0.02 + ringIndex * 0.01), time * 0.015);
                        float mistPattern = noise(mistUv);
                        
                        // Add wispy details - different for each ring
                        float wisps = noise(mistUv * (2.0 + ringIndex)) * 0.6;
                        
                        // Create density variation
                        float density = mistPattern + wisps * 0.4;
                        density = smoothstep(0.1, 0.8, density);
                        
                        // Mix colors
                        vec3 finalColor = mix(darkColor, mistColor, mistPattern);
                        
                        // Radial fade from center
                        float distanceFromCenter = length(vUv - 0.5);
                        float radialFade = 1.0 - smoothstep(0.2, 0.5, distanceFromCenter);
                        
                        // Edge fade for soft mist - different per ring
                        float edgeFade = smoothstep(0.45, 0.25, distanceFromCenter) * 
                                        smoothstep(0.1, 0.3, distanceFromCenter);
                        
                        // Layer opacity - higher base opacity, less reduction per ring
                        float layerOpacity = 0.45 - (ringIndex * 0.04);
                        
                        // Final opacity
                        float opacity = density * edgeFade * radialFade * layerOpacity;
                        
                        gl_FragColor = vec4(finalColor, opacity);
                    }
                `,
                transparent: true,
                blending: THREE.AdditiveBlending,
                side: THREE.DoubleSide,
                depthWrite: false
            });
            
            const mistRing = new THREE.Mesh(mistGeometry, mistMaterial);
            
            // Position and orient each ring differently for 3D smoke effect
            mistRing.rotation.x = Math.PI / 2 + (i * 0.05 - 0.1); // Reduced tilt variation
            mistRing.rotation.z = (i * Math.PI) / 3; // Different rotational positions
            mistRing.position.y = (i - mistRings/2) * 0.8; // Reduced vertical spread (was 1.5)
            
            // Scale to create oval shape with variation
            const ovalFactorX = 1.0 + (i * 0.1);
            const ovalFactorY = 0.6 + (i * 0.05);
            mistRing.scale.set(ovalFactorX, ovalFactorY, 1.0);
            
            // Store for animation
            mistRing.userData = {
                rotationSpeed: 0.0001 + (i * 0.00005),
                index: i
            };
            
            this.orbitalMist.push(mistRing);
            this.group.add(mistRing);
        }
        
        console.log(`🌫️ Created ${mistRings} layered mist rings for smoke effect`);
    }
    
    /**
     * Creates space rocks floating in wide oval formation
     */
    createSpaceRocks() {
        const rockCount = 6;
        
        for (let i = 0; i < rockCount; i++) {
            // Create irregular rock geometry
            const rockGeometry = new THREE.SphereGeometry(
                0.8 + Math.random() * 1.2, // Varying sizes
                8 + Math.floor(Math.random() * 8), // Low poly count for rocky look
                6 + Math.floor(Math.random() * 6)
            );
            
            // Distort vertices for irregular shape
            const vertices = rockGeometry.attributes.position;
            for (let j = 0; j < vertices.count; j++) {
                const x = vertices.getX(j);
                const y = vertices.getY(j);
                const z = vertices.getZ(j);
                
                // Add random distortion
                const distortion = 0.3;
                vertices.setX(j, x + (Math.random() - 0.5) * distortion);
                vertices.setY(j, y + (Math.random() - 0.5) * distortion);
                vertices.setZ(j, z + (Math.random() - 0.5) * distortion);
            }
            rockGeometry.computeVertexNormals();
            
            // Create procedural rock material with surface details
            const rockMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    time: { value: 0.0 },
                    baseColor: { value: new THREE.Color(0x696969) },
                    darkColor: { value: new THREE.Color(0x404040) },
                    lightColor: { value: new THREE.Color(0x808080) }
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
                    uniform vec3 darkColor;
                    uniform vec3 lightColor;
                    
                    varying vec3 vPosition;
                    varying vec3 vNormal;
                    varying vec2 vUv;
                    
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
                        // Create rocky surface pattern
                        vec3 noisePos = vPosition * 8.0;
                        float pattern = noise3D(noisePos);
                        
                        // Add surface cracks and variations
                        float cracks = noise3D(noisePos * 3.0);
                        float surface = noise3D(noisePos * 15.0) * 0.3;
                        
                        // Mix colors based on surface features
                        vec3 rockColor = mix(darkColor, baseColor, pattern);
                        rockColor = mix(rockColor, lightColor, cracks * 0.4);
                        rockColor *= (0.8 + surface);
                        
                        // Simple lighting
                        vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
                        float light = max(dot(vNormal, lightDir), 0.3);
                        
                        gl_FragColor = vec4(rockColor * light, 1.0);
                    }
                `,
                flatShading: true
            });
            
            const rock = new THREE.Mesh(rockGeometry, rockMaterial);
            
            // Position rocks evenly around the full circle - prevent clustering
            const baseAngle = (i / rockCount) * Math.PI * 2;
            const angleVariation = (Math.random() - 0.5) * (Math.PI / 3); // ±30 degrees variation
            const angle = baseAngle + angleVariation;
            
            const ovalRadiusX = 15 + Math.random() * 10; // Wide oval - X axis
            const ovalRadiusZ = 10 + Math.random() * 8;  // Wide oval - Z axis
            const height = (Math.random() - 0.5) * 8;    // Vertical variation
            
            rock.position.set(
                Math.cos(angle) * ovalRadiusX,
                height,
                Math.sin(angle) * ovalRadiusZ
            );
            
            // Random rotation
            rock.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            
            // Store animation data including material reference for updates
            rock.userData = {
                basePosition: rock.position.clone(),
                baseRotation: rock.rotation.clone(),
                orbitSpeed: 0.0008 + Math.random() * 0.0004,
                rotationSpeed: 0.005 + Math.random() * 0.01,
                material: rockMaterial
            };
            
            this.spaceRocks.push(rock);
            this.group.add(rock);
        }
        
        console.log(`🪨 Created ${rockCount} space rocks in oval formation`);
    }
    
    /**
     * Creates smaller space debris scattered around
     */
    createSpaceDebris() {
        const debrisCount = 12;
        
        for (let i = 0; i < debrisCount; i++) {
            // Mix of small spheres and irregular shapes for debris
            let debrisGeometry;
            if (Math.random() > 0.5) {
                // Small spherical debris
                debrisGeometry = new THREE.SphereGeometry(0.2 + Math.random() * 0.4, 6, 6);
            } else {
                // Small irregular chunks
                debrisGeometry = new THREE.BoxGeometry(
                    0.3 + Math.random() * 0.4,
                    0.2 + Math.random() * 0.3,
                    0.3 + Math.random() * 0.4
                );
            }
            
            // Create textured debris material
            const debrisMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    time: { value: 0.0 },
                    baseColor: { value: new THREE.Color(0x8B7355) },
                    metalColor: { value: new THREE.Color(0xC0C0C0) },
                    darkColor: { value: new THREE.Color(0x4A4A4A) }
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
                    uniform vec3 metalColor;
                    uniform vec3 darkColor;
                    
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
                        // Create debris surface pattern
                        vec2 noiseUv = vUv * 6.0;
                        float pattern = noise(noiseUv);
                        
                        // Add metallic patches (space debris often has metal)
                        float metalPatch = noise(noiseUv * 3.0);
                        float isMetal = step(0.7, metalPatch);
                        
                        // Add scratches and wear
                        float scratches = noise(noiseUv * 20.0) * 0.2;
                        
                        // Mix colors
                        vec3 debrisColor = mix(baseColor, darkColor, pattern);
                        debrisColor = mix(debrisColor, metalColor, isMetal);
                        debrisColor *= (0.9 + scratches);
                        
                        // Simple lighting
                        vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
                        float light = max(dot(vNormal, lightDir), 0.4);
                        
                        gl_FragColor = vec4(debrisColor * light, 1.0);
                    }
                `
            });
            
            const debris = new THREE.Mesh(debrisGeometry, debrisMaterial);
            
            // Scatter debris in wider area than rocks
            const angle = Math.random() * Math.PI * 2;
            const distance = 6 + Math.random() * 18; // Between star and rocks
            const height = (Math.random() - 0.5) * 8;
            
            // Some debris closer to center, some further out
            const ovalFactorX = 0.8 + Math.random() * 0.4;
            const ovalFactorZ = 0.6 + Math.random() * 0.3;
            
            debris.position.set(
                Math.cos(angle) * distance * ovalFactorX,
                height,
                Math.sin(angle) * distance * ovalFactorZ
            );
            
            // Random rotation
            debris.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            
            // Store animation data including material reference
            debris.userData = {
                basePosition: debris.position.clone(),
                baseRotation: debris.rotation.clone(),
                orbitSpeed: 0.001 + Math.random() * 0.0008,
                rotationSpeed: 0.01 + Math.random() * 0.02,
                floatOffset: Math.random() * Math.PI * 2,
                material: debrisMaterial
            };
            
            this.spaceDebris.push(debris);
            this.group.add(debris);
        }
        
        console.log(`💫 Created ${debrisCount} pieces of space debris`);
    }
    
    /**
     * Creates invisible hitbox for the entire nebula
     */
    createHitBox() {
        const hitBoxGeometry = new THREE.SphereGeometry(15, 16, 16);
        const hitBoxMaterial = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0,
            visible: false
        });
        
        this.hitBox = new THREE.Mesh(hitBoxGeometry, hitBoxMaterial);
        this.hitBox.userData.isPortfolioNebula = true;
        this.group.add(this.hitBox);
        
        console.log('📦 Created hitbox for nebula interaction');
    }
    
    /**
     * Adds lighting for the star system
     */
    addStarLighting() {
        // Point light from the central star
        const starLight = new THREE.PointLight(this.colors.starCore, 1.2, 50);
        starLight.position.set(0, 0, 0);
        this.centralStar.add(starLight);
        
        // Subtle ambient light
        const ambientLight = new THREE.AmbientLight(this.colors.glow, 0.2);
        this.group.add(ambientLight);
        
        console.log('💡 Added star lighting system');
    }
    
    /**
     * Handle hover interactions
     */
    onHover(isHovering) {
        this.isHovered = isHovering;
        this.targetScale = isHovering ? 1.05 : 1.0;
        
        // Enhanced star glow when hovered
        if (this.centralStar) {
            this.centralStar.material.emissiveIntensity = isHovering ? 1.0 : 0.8;
        }
        
        console.log(`⭐ Portfolio Nebula ${isHovering ? 'hovered' : 'unhovered'}`);
    }
    
    /**
     * Handle click interactions
     */
    onClick() {
        console.log('⭐ Portfolio Nebula clicked - Opening portfolio showcase');
        
        // Brief scale animation
        this.targetScale = 1.15;
        setTimeout(() => {
            this.targetScale = this.isHovered ? 1.05 : 1.0;
        }, 200);
        
        // Use travel system if not currently traveling
        if (typeof window !== 'undefined' && window.spaceCVApp && window.spaceCVApp.travelSystem) {
            const travelSystem = window.spaceCVApp.travelSystem;
            if (!travelSystem.isTraveling()) {
                console.log('🌍 Initiating travel to Portfolio Nebula');
                // Create a pseudo-planet object for the nebula
                const nebulaPlanet = {
                    id: 'portfolio-nebula',
                    getInfo: () => ({
                        id: 'portfolio-nebula',
                        name: 'Portfolio Nebula',
                        theme: 'portfolio',
                        description: 'Explore Brendan\'s creative portfolio and design work',
                        unlocked: true
                    })
                };
                travelSystem.initiatePlanetTravel(nebulaPlanet);
            }
        } else {
            // Fallback for direct content display
            document.dispatchEvent(new CustomEvent('showPortfolioContent', {
                detail: { nebulaId: 'portfolio' }
            }));
        }
    }
    
    /**
     * Update nebula animations
     */
    update() {
        const elapsedTime = this.clock.getElapsedTime();
        
        // Animate central star
        if (this.centralStar) {
            // Gentle rotation
            this.centralStar.rotation.y += 0.005;
            
            // Update star glow shader
            const starGlow = this.centralStar.children[0];
            if (starGlow && starGlow.material.uniforms) {
                starGlow.material.uniforms.time.value = elapsedTime;
            }
        }
        
        // Animate orbital mist rings
        this.orbitalMist.forEach((mistRing, index) => {
            if (mistRing && mistRing.material.uniforms) {
                mistRing.material.uniforms.time.value = elapsedTime;
                // Each ring rotates at slightly different speed
                mistRing.rotation.z += mistRing.userData.rotationSpeed;
            }
        });
        
        // Animate space rocks - orbital motion
        this.spaceRocks.forEach((rock, index) => {
            const userData = rock.userData;
            
            // Update rock material shader time
            if (userData.material && userData.material.uniforms) {
                userData.material.uniforms.time.value = elapsedTime;
            }
            
            // Orbital motion around central star
            const orbitTime = elapsedTime * userData.orbitSpeed;
            const orbitRadius = Math.sqrt(
                userData.basePosition.x * userData.basePosition.x + 
                userData.basePosition.z * userData.basePosition.z
            );
            
            rock.position.x = Math.cos(orbitTime) * orbitRadius;
            rock.position.z = Math.sin(orbitTime) * orbitRadius * 0.7; // Oval shape
            rock.position.y = userData.basePosition.y + Math.sin(elapsedTime * 0.5 + index) * 0.5;
            
            // Rotation
            rock.rotation.x += userData.rotationSpeed;
            rock.rotation.y += userData.rotationSpeed * 0.7;
            rock.rotation.z += userData.rotationSpeed * 0.5;
        });
        
        // Animate space debris - more chaotic motion
        this.spaceDebris.forEach((debris, index) => {
            const userData = debris.userData;
            
            // Update debris material shader time
            if (userData.material && userData.material.uniforms) {
                userData.material.uniforms.time.value = elapsedTime;
            }
            
            // Orbital motion with more variation
            const orbitTime = elapsedTime * userData.orbitSpeed;
            const baseDistance = Math.sqrt(
                userData.basePosition.x * userData.basePosition.x + 
                userData.basePosition.z * userData.basePosition.z
            );
            
            debris.position.x = Math.cos(orbitTime + userData.floatOffset) * baseDistance;
            debris.position.z = Math.sin(orbitTime + userData.floatOffset) * baseDistance * 0.6;
            
            // Floating motion
            debris.position.y = userData.basePosition.y + 
                               Math.sin(elapsedTime * 0.8 + userData.floatOffset) * 1.2;
            
            // Faster, more chaotic rotation
            debris.rotation.x += userData.rotationSpeed;
            debris.rotation.y += userData.rotationSpeed * 1.2;
            debris.rotation.z += userData.rotationSpeed * 0.8;
        });
        
        // Gentle nebula rotation
        this.group.rotation.y += 0.0005;
        
        // Smooth scaling for hover effects
        const scaleDiff = this.targetScale - this.baseScale;
        this.baseScale += scaleDiff * 0.1;
        this.group.scale.set(this.baseScale, this.baseScale, this.baseScale);
    }
    
    /**
     * Get hitbox for raycasting
     */
    getGroup() {
        return this.group;
    }
    
    /**
     * Get hitbox specifically for interaction
     */
    getHitBox() {
        return this.hitBox;
    }
    
    getInfo() {
        return {
            id: this.id,
            name: 'Portfolio Nebula',
            theme: this.theme,
            description: 'Explore Brendan\'s creative portfolio and past projects',
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
        
        console.log('🗑️ Portfolio Nebula disposed');
    }
}

// Export for ES6 modules
export { PortfolioNebula };

// Fallback for older browsers
if (typeof window !== 'undefined') {
    window.PortfolioNebula = PortfolioNebula;
}