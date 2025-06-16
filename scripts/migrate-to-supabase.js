// Migration script to move data from JSON to Supabase
const fs = require('fs').promises;
const path = require('path');
const { supabase } = require('../lib/supabase');

async function createTables() {
    console.log('Creating tables...');
    
    try {
        // Create sites table to store all site data
        const { error: sitesError } = await supabase.rpc('exec_sql', {
            sql: `
                CREATE TABLE IF NOT EXISTS sites (
                    id SERIAL PRIMARY KEY,
                    domain VARCHAR(255) UNIQUE NOT NULL,
                    data JSONB NOT NULL,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
                
                -- Create update trigger
                CREATE OR REPLACE FUNCTION update_updated_at_column()
                RETURNS TRIGGER AS $$
                BEGIN
                    NEW.updated_at = NOW();
                    RETURN NEW;
                END;
                $$ language 'plpgsql';
                
                DROP TRIGGER IF EXISTS update_sites_updated_at ON sites;
                CREATE TRIGGER update_sites_updated_at
                    BEFORE UPDATE ON sites
                    FOR EACH ROW
                    EXECUTE FUNCTION update_updated_at_column();
            `
        });
        
        if (sitesError) {
            console.error('Error creating sites table:', sitesError);
            return false;
        }
        
        console.log('✅ Tables created successfully');
        return true;
    } catch (error) {
        console.error('Error in createTables:', error);
        return false;
    }
}

async function migrateSiteData() {
    console.log('Migrating site data...');
    
    try {
        // Read current siteData.json
        const dataPath = path.join(__dirname, '../data/siteData.json');
        const jsonData = await fs.readFile(dataPath, 'utf8');
        const siteData = JSON.parse(jsonData);
        
        console.log('Loaded site data from JSON');
        
        // Insert or update site data
        const { data, error } = await supabase
            .from('sites')
            .upsert({
                domain: 'code7.co.il', // Default domain, can be changed
                data: siteData
            }, { 
                onConflict: 'domain' 
            });
        
        if (error) {
            console.error('Error inserting site data:', error);
            return false;
        }
        
        console.log('✅ Site data migrated successfully');
        return true;
    } catch (error) {
        console.error('Error in migrateSiteData:', error);
        return false;
    }
}

async function testConnection() {
    console.log('Testing Supabase connection...');
    
    try {
        const { data, error } = await supabase
            .from('sites')
            .select('domain, created_at')
            .limit(1);
        
        if (error) {
            console.error('Connection test failed:', error);
            return false;
        }
        
        console.log('✅ Connection test successful');
        console.log('Data:', data);
        return true;
    } catch (error) {
        console.error('Error testing connection:', error);
        return false;
    }
}

async function main() {
    console.log('🚀 Starting migration to Supabase...');
    
    // Test connection first
    if (!(await testConnection())) {
        console.error('❌ Migration failed - connection issue');
        return;
    }
    
    // Create tables
    if (!(await createTables())) {
        console.error('❌ Migration failed - table creation issue');
        return;
    }
    
    // Migrate data
    if (!(await migrateSiteData())) {
        console.error('❌ Migration failed - data migration issue');
        return;
    }
    
    console.log('🎉 Migration completed successfully!');
    console.log('✅ All data is now stored in Supabase');
    console.log('✅ JSON file backup remains intact');
}

// Run migration if called directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { createTables, migrateSiteData, testConnection };