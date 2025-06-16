// Database abstraction layer for Supabase
const { supabase } = require('./supabase');

class DatabaseService {
    constructor() {
        this.defaultDomain = 'code7.co.il';
    }

    async getSiteData(domain = this.defaultDomain) {
        try {
            const { data, error } = await supabase
                .from('sites')
                .select('data')
                .eq('domain', domain)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    // No data found, return default structure
                    return this.getDefaultSiteData();
                }
                throw error;
            }

            return data.data;
        } catch (error) {
            console.error('Error getting site data:', error);
            return this.getDefaultSiteData();
        }
    }

    async updateSiteData(siteData, domain = this.defaultDomain) {
        try {
            const { data, error } = await supabase
                .from('sites')
                .upsert({
                    domain: domain,
                    data: siteData
                }, { 
                    onConflict: 'domain' 
                })
                .select();

            if (error) {
                throw error;
            }

            return { success: true, data: data[0] };
        } catch (error) {
            console.error('Error updating site data:', error);
            return { success: false, error: error.message };
        }
    }

    async getProjects(domain = this.defaultDomain) {
        const siteData = await this.getSiteData(domain);
        return siteData.projects || [];
    }

    async updateProjects(projects, domain = this.defaultDomain) {
        const siteData = await this.getSiteData(domain);
        siteData.projects = projects;
        return await this.updateSiteData(siteData, domain);
    }

    async getServices(domain = this.defaultDomain) {
        const siteData = await this.getSiteData(domain);
        return siteData.services || [];
    }

    async updateServices(services, domain = this.defaultDomain) {
        const siteData = await this.getSiteData(domain);
        siteData.services = services;
        return await this.updateSiteData(siteData, domain);
    }

    async getSubmissions(domain = this.defaultDomain) {
        const siteData = await this.getSiteData(domain);
        return siteData.contact?.submissions || [];
    }

    async addSubmission(submission, domain = this.defaultDomain) {
        const siteData = await this.getSiteData(domain);
        if (!siteData.contact) siteData.contact = {};
        if (!siteData.contact.submissions) siteData.contact.submissions = [];
        
        siteData.contact.submissions.push(submission);
        return await this.updateSiteData(siteData, domain);
    }

    async updateSubmission(submissionId, updates, domain = this.defaultDomain) {
        const siteData = await this.getSiteData(domain);
        if (!siteData.contact?.submissions) return { success: false, error: 'No submissions found' };
        
        const submissionIndex = siteData.contact.submissions.findIndex(s => s.id == submissionId);
        if (submissionIndex === -1) return { success: false, error: 'Submission not found' };
        
        siteData.contact.submissions[submissionIndex] = {
            ...siteData.contact.submissions[submissionIndex],
            ...updates,
            lastUpdated: new Date().toISOString()
        };
        
        return await this.updateSiteData(siteData, domain);
    }

    getDefaultSiteData() {
        return {
            hero: {
                headline: "יוצרים עבורך נוכחות דיגיטלית מושלמת",
                subtitle: "פתרונות מותאמים אישית לאתרים, אפליקציות ומערכות ניהול עסקיות",
                background: "gradient",
                animations: true
            },
            services: [],
            projects: [],
            testimonials: [],
            faq: [],
            contact: {
                fields: [],
                submissions: []
            },
            settings: {
                businessName: "CODE7",
                phone: "",
                email: "",
                logo: "",
                social: {
                    facebook: "",
                    instagram: "",
                    linkedin: ""
                }
            }
        };
    }
}

module.exports = new DatabaseService();