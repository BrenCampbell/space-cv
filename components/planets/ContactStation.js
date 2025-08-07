/**
 * ContactStation.js - Contact Station & Call-to-Action Component
 * 
 * FIXED VERSION: Improved lighting system similar to Spaceship.js
 * Space station/hub themed representing connection point
 * Silver/white color scheme for clean, professional contact interface
 */

class ContactStation {
    constructor(scene, position = { x: 30, y: -40, z: -150 }) {
        this.scene = scene;
        this.position = position;
        
        // Station properties
        this.id = 'contact-planet';
        this.theme = 'station';
        this.radius = 15;
        this.rotationSpeed = 0.002;
        
        // Contact color scheme - Silver/white theme
        this.colors = {
            surface: new THREE.Color(0xECF0F1),      // Light silver
            metal: new THREE.Color(0xBDC3C7),       // Metallic silver
            energy: new THREE.Color(0x3498DB),      // Blue energy
            atmosphere: new THREE.Color(0xD5DBDB),  // Soft silver atmosphere
            signal: new THREE.Color(0x00FFFF),      // Cyan signals
        };
        
        // Component groups
        this.group = new THREE.Group();
        this.station = null;
        this.atmosphere = null;
        this.antennas = [];
        this.signals = [];
        
        // Animation properties
        this.clock = new THREE.Clock();
        this.isHovered = false;
        this.baseScale = 1.0;
        this.targetScale = 1.0;
        
        // Individual rotation
        this.isRotating = false;
        this.rotationStartMouse = { x: 0, y: 0 };
        
        this.init();
    }
    
    init() {
        console.log('📞 Initializing ContactStation component...');
        
        // Set position
        this.group.position.set(this.position.x, this.position.y, this.position.z);
        
        // Create station components
        this.createSpaceStation();
        this.createAtmosphere();
        this.createCommunicationArrays();
        this.createSignalEffects();
        this.addStationLighting(); // Enhanced lighting system
        
        // Add to scene
        this.scene.add(this.group);
        
        console.log('✅ ContactStation initialized successfully');
    }
    
    /**
     * Creates futuristic digital station material with sci-fi aesthetics
     */
    createStationMaterial() {
        return new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0.0 },
                baseColor: { value: new THREE.Color(0xB8C6DB) },      // Brighter silver-blue
                panelColor: { value: new THREE.Color(0x95A5A6) },     // Medium gray panels
                accentColor: { value: new THREE.Color(0x00FFFF) },    // Bright cyan accents
                energyColor: { value: new THREE.Color(0x3498DB) }     // Electric blue
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
                uniform vec3 energyColor;
                
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
                    // Create digital hexagonal panel pattern
                    vec2 hexUv = vUv * 8.0;
                    vec2 hexGrid = abs(fract(hexUv) - 0.5);
                    float hexPattern = smoothstep(0.05, 0.15, min(hexGrid.x, hexGrid.y));
                    
                    // Add circuit board traces
                    vec2 circuitUv = vUv * 12.0;
                    float circuitH = step(0.9, sin(circuitUv.x * 6.28)) * step(0.85, cos(circuitUv.y * 6.28));
                    float circuitV = step(0.9, sin(circuitUv.y * 6.28)) * step(0.85, cos(circuitUv.x * 6.28));
                    float circuits = max(circuitH, circuitV);
                    
                    // Digital noise for futuristic texture
                    float digitalNoise = noise(vUv * 20.0) * 0.15;
                    
                    // Create glowing connection points
                    vec2 pointUv = vUv * 6.0;
                    vec2 pointGrid = fract(pointUv) - 0.5;
                    float connectionPoints = 1.0 - smoothstep(0.1, 0.2, length(pointGrid));
                    connectionPoints *= step(0.8, hash(floor(pointUv)));
                    
                    // Mix colors for futuristic appearance
                    vec3 finalColor = mix(panelColor, baseColor, hexPattern);
                    finalColor += digitalNoise;
                    finalColor = mix(finalColor, accentColor, circuits * 0.4);
                    finalColor = mix(finalColor, energyColor, connectionPoints * 0.3);
                    
                    // Add animated energy flow
                    float energyFlow = sin(vUv.x * 15.0 + time * 3.0) * sin(vUv.y * 10.0 + time * 2.0);
                    energyFlow = smoothstep(0.6, 0.8, energyFlow);
                    finalColor += accentColor * energyFlow * 0.25;
                    
                    // Digital scan lines effect
                    float scanLines = sin(vUv.y * 100.0 + time * 5.0) * 0.05 + 0.95;
                    finalColor *= scanLines;
                    
                    // Brighten overall appearance
                    finalColor *= 1.3;
                    
                    gl_FragColor = vec4(finalColor, 1.0);
                }
            `
        });
    }
    
    /**
     * Creates bright digital panel material
     */
    createPanelMaterial() {
        return new THREE.MeshBasicMaterial({
            color: 0x1E3A8A  // Bright electric blue
        });
    }
    
    /**
     * Creates enhanced metallic material with digital glow
     */
    createMetallicMaterial(baseColor, intensity = 1.2) {
        return new THREE.MeshBasicMaterial({
            color: new THREE.Color(baseColor).multiplyScalar(intensity)
        });
    }
    
    /**
     * Creates textured satellite material
     */
    createSatelliteMaterial() {
        return new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0.0 },
                baseColor: { value: new THREE.Color(0x7F8C8D) },
                detailColor: { value: new THREE.Color(0x566573) },
                lightColor: { value: new THREE.Color(0xFF6B35) }
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
                uniform vec3 baseColor;
                uniform vec3 detailColor;
                uniform vec3 lightColor;
                varying vec3 vPosition;
                varying vec2 vUv;
                
                float hash(vec2 p) {
                    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
                }
                
                void main() {
                    // Create panel pattern
                    vec2 panelUv = vUv * 4.0;
                    vec2 panelGrid = abs(fract(panelUv) - 0.5);
                    float panels = smoothstep(0.1, 0.2, min(panelGrid.x, panelGrid.y));
                    
                    // Add antenna details
                    float antennaLines = step(0.95, sin(vUv.y * 20.0));
                    
                    // Blinking status light
                    float statusLight = step(0.8, hash(floor(vUv * 2.0)));
                    float blink = sin(time * 3.0) * 0.5 + 0.5;
                    statusLight *= blink;
                    
                    // Mix colors
                    vec3 finalColor = mix(detailColor, baseColor, panels);
                    finalColor = mix(finalColor, baseColor * 1.2, antennaLines);
                    finalColor += lightColor * statusLight * 0.7;
                    
                    gl_FragColor = vec4(finalColor, 1.0);
                }
            `
        });
    }
    createAntennaMaterial() {
        return new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0.0 },
                glowColor: { value: new THREE.Color(0x00FFFF) }
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
                uniform vec3 glowColor;
                varying vec2 vUv;
                
                void main() {
                    float glow = sin(vUv.y * 10.0 + time * 4.0) * 0.3 + 0.7;
                    vec3 finalColor = mix(vec3(0.4, 0.4, 0.5), glowColor, glow);
                    gl_FragColor = vec4(finalColor, 1.0);
                }
            `
        });
    }
    /**
     * Creates the main space station structure with lighting-independent materials
     */
    createSpaceStation() {
        const stationGroup = new THREE.Group();
        
        // Central hub with procedural material (like Spaceship.js)
        const hubGeometry = new THREE.SphereGeometry(this.radius * 0.6, 32, 32);
        const hubMaterial = this.createStationMaterial();
        
        const hub = new THREE.Mesh(hubGeometry, hubMaterial);
        stationGroup.add(hub);
        
        // Enhanced outer ring with lights and tech details
        const ringGeometry = new THREE.TorusGeometry(this.radius * 1.2, this.radius * 0.15, 8, 32);
        const ringMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0.0 },
                ringColor: { value: new THREE.Color(0xAEB6BF) },
                lightColor: { value: new THREE.Color(0x00FFFF) }
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
                uniform vec3 ringColor;
                uniform vec3 lightColor;
                varying vec3 vPosition;
                varying vec2 vUv;
                
                float hash(vec2 p) {
                    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
                }
                
                void main() {
                    // Create running lights around the ring
                    float lightPattern = sin(vUv.x * 20.0 + time * 4.0) * 0.5 + 0.5;
                    lightPattern = step(0.7, lightPattern);
                    
                    // Add random blinking indicators
                    vec2 indicatorUv = vUv * 15.0;
                    float indicators = hash(floor(indicatorUv));
                    indicators = step(0.85, indicators);
                    float blink = sin(time * 6.0 + indicators * 10.0) * 0.5 + 0.5;
                    indicators *= blink;
                    
                    // Create panel lines
                    float panels = sin(vUv.x * 40.0) * 0.1 + 0.9;
                    
                    // Mix everything together
                    vec3 finalColor = ringColor * panels;
                    finalColor += lightColor * lightPattern * 0.8;
                    finalColor += lightColor * indicators * 0.6;
                    
                    // Brighten the ring
                    finalColor *= 1.1;
                    
                    gl_FragColor = vec4(finalColor, 1.0);
                }
            `
        });
        
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2;
        stationGroup.add(ring);
        
        // Add discrete LED lights around the ring
        for (let i = 0; i < 24; i++) {
            const ledGeometry = new THREE.SphereGeometry(0.3, 6, 6);
            const ledMaterial = new THREE.MeshBasicMaterial({
                color: i % 3 === 0 ? 0x00FFFF : (i % 3 === 1 ? 0x0080FF : 0x00FF80),
                emissive: i % 3 === 0 ? 0x00FFFF : (i % 3 === 1 ? 0x0080FF : 0x00FF80),
                emissiveIntensity: 0.5
            });
            
            const led = new THREE.Mesh(ledGeometry, ledMaterial);
            const angle = (i / 24) * Math.PI * 2;
            led.position.set(
                Math.cos(angle) * this.radius * 1.2,
                0,
                Math.sin(angle) * this.radius * 1.2
            );
            
            stationGroup.add(led);
        }
        
        // Solar panels with bright digital material
        for (let i = 0; i < 4; i++) {
            const panelGeometry = new THREE.BoxGeometry(8, 0.2, 3);
            const panelMaterial = this.createPanelMaterial();
            
            const panel = new THREE.Mesh(panelGeometry, panelMaterial);
            const angle = (i / 4) * Math.PI * 2;
            panel.position.set(
                Math.cos(angle) * this.radius * 1.8,
                0,
                Math.sin(angle) * this.radius * 1.8
            );
            panel.rotation.y = angle;
            stationGroup.add(panel);
        }
        
        // Structural beams with enhanced brightness
        for (let i = 0; i < 8; i++) {
            const beamGeometry = new THREE.BoxGeometry(0.3, 0.3, this.radius * 1.5);
            const beamMaterial = this.createMetallicMaterial(0x85929E, 1.0);  // Brighter beams
            
            const beam = new THREE.Mesh(beamGeometry, beamMaterial);
            const angle = (i / 8) * Math.PI * 2;
            beam.position.set(
                Math.cos(angle) * this.radius * 0.8,
                0,
                Math.sin(angle) * this.radius * 0.8
            );
            beam.rotation.y = angle;
            stationGroup.add(beam);
        }
        
        // Central command module with futuristic glow
        const commandGeometry = new THREE.CylinderGeometry(this.radius * 0.3, this.radius * 0.4, this.radius * 0.8, 12);
        const commandMaterial = this.createMetallicMaterial(0xBDC3C7, 1.2);  // Bright command module
        
        const commandModule = new THREE.Mesh(commandGeometry, commandMaterial);
        commandModule.position.y = this.radius * 0.4;
        stationGroup.add(commandModule);
        
        // Add holographic communication dome
        const domeGeometry = new THREE.SphereGeometry(this.radius * 0.2, 16, 16);
        const domeMaterial = new THREE.MeshBasicMaterial({
            color: 0x00FFFF,
            transparent: true,
            opacity: 0.3,
            wireframe: true
        });
        const dome = new THREE.Mesh(domeGeometry, domeMaterial);
        dome.position.y = this.radius * 0.9;
        stationGroup.add(dome);
        
        this.station = stationGroup;
        this.group.add(stationGroup);
    }
    
    /**
     * Creates atmospheric field effect
     */
    createAtmosphere() {
        const atmosphereGeometry = new THREE.SphereGeometry(this.radius * 1.4, 32, 32);
        const atmosphereMaterial = new THREE.ShaderMaterial({
            uniforms: {
                atmosphereColor: { value: this.colors.atmosphere },
                intensity: { value: 0.25 },
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
                    float glow = pow(0.8 - dot(vNormal, vec3(0, 0, 1.0)), 1.5);
                    float pulse = sin(time * 3.0) * 0.1 + 0.9; // Tech-like pulse
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
     * Creates communication arrays with enhanced textures and details
     */
    createCommunicationArrays() {
        // Enhanced main communication dishes
        for (let i = 0; i < 3; i++) {
            const dishGroup = new THREE.Group();
            
            // Main dish with detailed texture
            const dishGeometry = new THREE.CylinderGeometry(3, 2, 0.5, 16);
            const dishMaterial = this.createSatelliteMaterial();
            const dish = new THREE.Mesh(dishGeometry, dishMaterial);
            dish.rotation.x = Math.PI;
            dishGroup.add(dish);
            
            // Support arm with texture
            const armGeometry = new THREE.CylinderGeometry(0.2, 0.2, 6, 8);
            const armMaterial = this.createSatelliteMaterial();
            const arm = new THREE.Mesh(armGeometry, armMaterial);
            arm.position.y = -3;
            dishGroup.add(arm);
            
            // Add blinking status lights to dishes
            for (let j = 0; j < 3; j++) {
                const lightGeometry = new THREE.SphereGeometry(0.15, 6, 6);
                const lightMaterial = new THREE.MeshBasicMaterial({
                    color: j === 0 ? 0xFF0000 : (j === 1 ? 0x00FF00 : 0x0000FF),
                    emissive: j === 0 ? 0xFF0000 : (j === 1 ? 0x00FF00 : 0x0000FF),
                    emissiveIntensity: 0.8
                });
                
                const statusLight = new THREE.Mesh(lightGeometry, lightMaterial);
                const lightAngle = (j / 3) * Math.PI * 2;
                statusLight.position.set(
                    Math.cos(lightAngle) * 2.5,
                    0.3,
                    Math.sin(lightAngle) * 2.5
                );
                dish.add(statusLight);
            }
            
            // Position around station
            const angle = (i / 3) * Math.PI * 2;
            dishGroup.position.set(
                Math.cos(angle) * this.radius * 2.5,
                5 + Math.sin(i * 2) * 3,
                Math.sin(angle) * this.radius * 2.5
            );
            
            dishGroup.lookAt(0, 0, 0);
            
            this.antennas.push(dishGroup);
            this.group.add(dishGroup);
        }
        
        // Enhanced vertical antennas with details
        for (let i = 0; i < 6; i++) {
            const antennaGroup = new THREE.Group();
            
            // Main antenna shaft with texture
            const antennaGeometry = new THREE.CylinderGeometry(0.1, 0.1, 10 + Math.random() * 5, 8);
            const antennaMaterial = this.createSatelliteMaterial();
            const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
            antennaGroup.add(antenna);
            
            // Add small details to antennas
            for (let j = 0; j < 3; j++) {
                const detailGeometry = new THREE.BoxGeometry(0.3, 0.1, 0.1);
                const detailMaterial = new THREE.MeshBasicMaterial({ color: 0x95A5A6 });
                const detail = new THREE.Mesh(detailGeometry, detailMaterial);
                detail.position.y = (j - 1) * 3;
                detail.rotation.y = (j * Math.PI) / 3;
                antennaGroup.add(detail);
            }
            
            // Enhanced glowing antenna tips
            const tipGeometry = new THREE.SphereGeometry(0.3, 8, 8);
            const tipMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    time: { value: 0.0 },
                    glowColor: { value: new THREE.Color(0x00FFFF) }
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
                    uniform vec3 glowColor;
                    varying vec2 vUv;
                    
                    void main() {
                        float pulse = sin(time * 4.0) * 0.3 + 0.7;
                        float glow = 1.0 - length(vUv - 0.5) * 2.0;
                        vec3 finalColor = glowColor * pulse * glow;
                        gl_FragColor = vec4(finalColor, glow * 0.9);
                    }
                `,
                transparent: true
            });
            const tip = new THREE.Mesh(tipGeometry, tipMaterial);
            tip.position.y = antenna.geometry.parameters.height;
            antennaGroup.add(tip);
            
            // Position around station
            const angle = (i / 6) * Math.PI * 2;
            antennaGroup.position.set(
                Math.cos(angle) * this.radius * 1.1,
                antenna.geometry.parameters.height / 2,
                Math.sin(angle) * this.radius * 1.1
            );
            
            this.antennas.push(antennaGroup);
            this.group.add(antennaGroup);
        }
    }
    
    /**
     * Creates enhanced signal beam effects with digital aesthetics
     */
    createSignalEffects() {
        // Digital data rings
        for (let i = 0; i < 8; i++) {
            const signalGeometry = new THREE.RingGeometry(1, 2, 8);
            const signalMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    time: { value: 0.0 },
                    signalColor: { value: new THREE.Color(0x00FFFF) }
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
                    uniform vec3 signalColor;
                    varying vec2 vUv;
                    
                    void main() {
                        float ring = sin(length(vUv - 0.5) * 20.0 + time * 6.0) * 0.5 + 0.5;
                        float fade = 1.0 - length(vUv - 0.5) * 2.0;
                        gl_FragColor = vec4(signalColor * ring * fade, ring * fade * 0.8);
                    }
                `,
                transparent: true,
                side: THREE.DoubleSide
            });
            
            const signal = new THREE.Mesh(signalGeometry, signalMaterial);
            const angle = (i / 8) * Math.PI * 2;
            const distance = this.radius * (2 + Math.random() * 1);
            
            signal.position.set(
                Math.cos(angle) * distance,
                (Math.random() - 0.5) * 10,
                Math.sin(angle) * distance
            );
            
            signal.lookAt(0, 0, 0);
            signal.scale.setScalar(0.5 + Math.random() * 0.5);
            
            this.signals.push(signal);
            this.group.add(signal);
        }
        
        // Add holographic data streams
        for (let i = 0; i < 4; i++) {
            const streamGeometry = new THREE.PlaneGeometry(0.2, 15);
            const streamMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    time: { value: 0.0 }
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
                    varying vec2 vUv;
                    
                    void main() {
                        float dataFlow = sin(vUv.y * 30.0 - time * 8.0) * 0.5 + 0.5;
                        vec3 color = mix(vec3(0.0, 1.0, 1.0), vec3(0.0, 0.5, 1.0), dataFlow);
                        gl_FragColor = vec4(color * dataFlow, dataFlow * 0.6);
                    }
                `,
                transparent: true,
                side: THREE.DoubleSide
            });
            
            const stream = new THREE.Mesh(streamGeometry, streamMaterial);
            const angle = (i / 4) * Math.PI * 2;
            stream.position.set(
                Math.cos(angle) * this.radius * 1.5,
                0,
                Math.sin(angle) * this.radius * 1.5
            );
            stream.rotation.y = angle + Math.PI / 2;
            
            this.signals.push(stream);
            this.group.add(stream);
        }
    }
    
    /**
     * No lighting needed - using basic materials like Spaceship.js
     */
    addStationLighting() {
        // ContactStation now uses MeshBasicMaterial and ShaderMaterial
        // which are completely independent of scene lighting
        console.log('💡 ContactStation using lighting-independent materials like Spaceship');
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
     * Updates station animation and effects
     */
    update() {
        const elapsedTime = this.clock.getElapsedTime();
        
        // Rotate the station
        if (this.station && !this.isRotating) {
            this.station.rotation.y += this.rotationSpeed;
        }
        
        // Animate communication dishes
        this.antennas.forEach((antenna, index) => {
            if (!this.isRotating && index < 3) { // Only dishes, not vertical antennas
                antenna.rotation.y += 0.01;
                
                // Subtle tracking motion
                antenna.rotation.x = Math.sin(elapsedTime + index) * 0.2;
            }
        });
        
        // Animate signal effects
        this.signals.forEach((signal, index) => {
            if (!this.isRotating) {
                // Pulsing signal rings
                const pulse = Math.sin(elapsedTime * 3 + index * 0.5) * 0.3 + 1.0;
                signal.scale.setScalar(pulse * (0.5 + Math.random() * 0.1));
                
                // Fade in/out signals
                signal.material.opacity = (Math.sin(elapsedTime * 2 + index) * 0.3 + 0.5) * 0.6;
            }
        });
        
        // Update atmosphere
        if (this.atmosphere && this.atmosphere.material.uniforms) {
            this.atmosphere.material.uniforms.time.value = elapsedTime;
            this.atmosphere.material.uniforms.intensity.value = this.isHovered ? 0.4 : 0.25;
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
        console.log('📞 ContactStation clicked - Opening contact content');
        
        this.targetScale = 1.15;
        setTimeout(() => {
            this.targetScale = this.isHovered ? 1.05 : 1.0;
        }, 200);
        
        if (typeof window !== 'undefined') {
            document.dispatchEvent(new CustomEvent('showContactContent', {
                detail: { planetId: 'contact' }
            }));
        }
    }
    
    getGroup() {
        return this.group;
    }
    
    getInfo() {
        return {
            id: this.id,
            name: 'Contact Station',
            theme: this.theme,
            description: 'Connect with Brendan - let\'s start a conversation',
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
        
        console.log('🗑️ ContactStation disposed');
    }
}

// Export for ES6 modules
export { ContactStation };

// Fallback for older browsers
if (typeof window !== 'undefined') {
    window.ContactStation = ContactStation;
}