/**
 * ContentManager.js
 * Handles loading and rendering CV content from JSON data
 */

class ContentManager {
    constructor() {
        this.contentData = null;
        this.isLoaded = false;
    }

    /**
     * Load CV content from JSON file
     */
    async loadContent() {
        try {
            const response = await fetch('./data/cv-content.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.contentData = await response.json();
            this.isLoaded = true;
            console.log('✅ CV content loaded successfully');
            return this.contentData;
        } catch (error) {
            console.error('❌ Failed to load CV content:', error);
            // Fallback to default content
            this.contentData = this.getDefaultContent();
            this.isLoaded = true;
            return this.contentData;
        }
    }

    /**
     * Get work experience content
     */
    getWorkContent() {
        if (!this.isLoaded || !this.contentData) return this.getDefaultWorkContent();
        
        const work = this.contentData.workExperience;
        
        return `
            <div class="content-section">
                <h3>${work.subtitle}</h3>
                
                ${work.experiences.map(exp => `
                    <div class="content-item">
                        <div class="content-item-header">
                            <div>
                                <h4 class="content-item-title">${exp.position}</h4>
                                <span class="content-item-company">${exp.company}</span>
                            </div>
                            <span class="content-item-meta">${exp.period}</span>
                        </div>
                        <p class="text-secondary">${exp.description}</p>
                        
                        ${exp.highlights && exp.highlights.length > 0 ? `
                            <ul class="m-lg text-muted">
                                ${exp.highlights.map(highlight => `<li>${highlight}</li>`).join('')}
                            </ul>
                        ` : ''}
                        
                        ${exp.technologies && exp.technologies.length > 0 ? `
                            <div class="tech-tags">
                                ${exp.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * Get education content
     */
    getEducationContent() {
        if (!this.isLoaded || !this.contentData) return this.getDefaultEducationContent();
        
        const education = this.contentData.education;
        
        return `
            <div class="content-section">
                <h3>${education.subtitle}</h3>
                
                ${education.qualifications.map(qual => `
                    <div class="content-item">
                        <div class="content-item-header">
                            <div>
                                <h4 class="content-item-title">${qual.degree}</h4>
                                <span class="content-item-company">${qual.institution}</span>
                            </div>
                            <span class="content-item-meta">${qual.period}</span>
                        </div>
                        <p class="text-secondary">${qual.description}</p>
                    </div>
                `).join('')}
                
                ${education.certifications && education.certifications.length > 0 ? `
                    <div class="content-item">
                        <h4 class="content-item-title">🎓 Certifications & Learning</h4>
                        <div class="certification-list">
                            ${education.certifications.map(cert => `
                                <div class="certification-item">
                                    <strong>${cert.name}</strong> - ${cert.issuer} (${cert.year})
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Get skills content with enhanced visualization
     */
    getSkillsContent() {
        if (!this.isLoaded || !this.contentData) return this.getDefaultSkillsContent();
        
        const skills = this.contentData.skills;
        
        return `
            <div class="content-section">
                <h3>${skills.subtitle}</h3>
                
                <div class="highlight-grid grid-cols-2 gap-lg">
                    ${skills.coreSkills.map(skill => `
                        <div class="highlight-item">
                            <h4>${skill.icon} ${skill.name}</h4>
                            <p class="text-secondary">${skill.description}</p>
                            ${skill.level ? `
                                <div class="skill-level">
                                    <div class="skill-bar">
                                        <div class="skill-progress" style="width: ${skill.level}%"></div>
                                    </div>
                                    <span class="skill-percentage">${skill.level}%</span>
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
                
                ${skills.technicalSkills && skills.technicalSkills.length > 0 ? `
                    <div class="technical-skills-section">
                        <h4>🛠️ Technical Expertise</h4>
                        ${skills.technicalSkills.map(category => `
                            <div class="tech-category">
                                <h5>${category.category}</h5>
                                <div class="tech-tags">
                                    ${category.skills.map(skill => `<span class="tech-tag">${skill}</span>`).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Get projects/achievements content
     */
    getProjectsContent() {
        if (!this.isLoaded || !this.contentData) return this.getDefaultProjectsContent();
        
        const projects = this.contentData.projects;
        
        return `
            <div class="content-section">
                <h3>${projects.subtitle}</h3>
                
                ${projects.achievements.map(achievement => `
                    <div class="content-item">
                        <h4 class="content-item-title">${achievement.title}</h4>
                        <p class="text-secondary">${achievement.description}</p>
                        
                        ${achievement.metrics && achievement.metrics.length > 0 ? `
                            <div class="achievement-metrics">
                                ${achievement.metrics.map(metric => `<span class="metric-badge">${metric}</span>`).join('')}
                            </div>
                        ` : ''}
                        
                        <span class="achievement-year">${achievement.year}</span>
                    </div>
                `).join('')}
                
                ${projects.stats && projects.stats.length > 0 ? `
                    <div class="stats-grid">
                        ${projects.stats.map(stat => `
                            <div class="stat-item">
                                <span class="stat-number">${stat.number}</span>
                                <span class="stat-label">${stat.label}</span>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Get community content
     */
    getCommunityContent() {
        if (!this.isLoaded || !this.contentData) return this.getDefaultCommunityContent();
        
        const community = this.contentData.community;
        
        return `
            <div class="content-section">
                <h3>${community.subtitle}</h3>
                
                ${community.philosophy ? `
                    <div class="philosophy-section">
                        <p class="text-secondary philosophy-text">"${community.philosophy}"</p>
                    </div>
                ` : ''}
                
                ${community.initiatives.map(initiative => `
                    <div class="content-item">
                        <h4 class="content-item-title">${initiative.title}</h4>
                        <p class="text-secondary">${initiative.description}</p>
                        
                        ${initiative.activities && initiative.activities.length > 0 ? `
                            <ul class="m-lg text-muted">
                                ${initiative.activities.map(activity => `<li>${activity}</li>`).join('')}
                            </ul>
                        ` : ''}
                    </div>
                `).join('')}
                
                ${community.stats && community.stats.length > 0 ? `
                    <div class="stats-grid">
                        ${community.stats.map(stat => `
                            <div class="stat-item">
                                <span class="stat-number">${stat.number}</span>
                                <span class="stat-label">${stat.label}</span>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Get contact content
     */
    getContactContent() {
        if (!this.isLoaded || !this.contentData) return this.getDefaultContactContent();
        
        const contact = this.contentData.contact;
        
        return `
            <div class="content-section">
                <h3>${contact.subtitle}</h3>
                <p class="text-secondary">${contact.description}</p>
                
                <div class="contact-methods">
                    ${contact.contactMethods.map(method => `
                        <div class="contact-item ${method.primary ? 'primary' : ''}">
                            <span class="contact-icon">${method.icon}</span>
                            <div class="contact-details">
                                <span class="contact-label">${method.label}</span>
                                <span class="contact-value">${method.value}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                ${contact.availability ? `
                    <div class="availability-section">
                        <h4>📅 Availability</h4>
                        <p class="text-secondary">
                            <strong>Status:</strong> ${contact.availability.status}<br>
                            <strong>Response Time:</strong> ${contact.availability.responseTime}<br>
                            <strong>Preferred Contact:</strong> ${contact.availability.preferredContact}
                        </p>
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Get portfolio content (if available)
     */
    getPortfolioContent() {
        if (!this.isLoaded || !this.contentData) return this.getDefaultPortfolioContent();
        
        // This could be expanded with portfolio data in the JSON
        return `
            <div class="content-section">
                <h3>Creative Portfolio</h3>
                <p class="text-secondary">Explore my creative work and projects across various domains.</p>
                
                <div class="portfolio-placeholder">
                    <p>Portfolio content coming soon...</p>
                </div>
            </div>
        `;
    }

    /**
     * Get personal info for other components
     */
    getPersonalInfo() {
        if (!this.isLoaded || !this.contentData) return null;
        return this.contentData.personal;
    }

    /**
     * Get metadata
     */
    getMetadata() {
        if (!this.isLoaded || !this.contentData) return null;
        return this.contentData.metadata;
    }

    /**
     * Fallback content methods (existing content as backup)
     */
    getDefaultWorkContent() {
        return `
            <div class="content-section">
                <h3>Professional Journey</h3>
                <div class="content-item">
                    <div class="content-item-header">
                        <div>
                            <h4 class="content-item-title">Co-founder & Director</h4>
                            <span class="content-item-company">Kilonova & GIGiFY</span>
                        </div>
                        <span class="content-item-meta">2024 - Present</span>
                    </div>
                    <p class="text-secondary">Loading content...</p>
                </div>
            </div>
        `;
    }

    getDefaultEducationContent() {
        return `<div class="content-section"><h3>Education</h3><p>Loading content...</p></div>`;
    }

    getDefaultSkillsContent() {
        return `<div class="content-section"><h3>Skills</h3><p>Loading content...</p></div>`;
    }

    getDefaultProjectsContent() {
        return `<div class="content-section"><h3>Projects</h3><p>Loading content...</p></div>`;
    }

    getDefaultCommunityContent() {
        return `<div class="content-section"><h3>Community Work</h3><p>Loading content...</p></div>`;
    }

    getDefaultContactContent() {
        return `<div class="content-section"><h3>Contact</h3><p>Loading content...</p></div>`;
    }

    getDefaultPortfolioContent() {
        return `<div class="content-section"><h3>Portfolio</h3><p>Loading content...</p></div>`;
    }

    getDefaultContent() {
        return {
            personal: { name: "Brendan Campbell", title: "Loading..." },
            workExperience: { title: "Work Experience", subtitle: "Loading...", experiences: [] },
            education: { title: "Education", subtitle: "Loading...", qualifications: [] },
            skills: { title: "Skills", subtitle: "Loading...", coreSkills: [] },
            projects: { title: "Projects", subtitle: "Loading...", achievements: [] },
            community: { title: "Community", subtitle: "Loading...", initiatives: [] },
            contact: { title: "Contact", subtitle: "Loading...", contactMethods: [] }
        };
    }
}

// Export for ES6 modules
export { ContentManager };

// Fallback for older browsers
if (typeof window !== 'undefined') {
    window.ContentManager = ContentManager;
}