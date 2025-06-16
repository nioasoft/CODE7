// Simple migration script - just move data
const fs = require('fs').promises;
const path = require('path');
const { supabase } = require('../lib/supabase');

async function migrateSiteData() {
    console.log('🚀 Migrating site data to Supabase...');
    
    try {
        // Read current siteData.json
        const dataPath = path.join(__dirname, '../data/siteData.json');
        const jsonData = await fs.readFile(dataPath, 'utf8');
        const siteData = JSON.parse(jsonData);
        
        console.log('✅ Loaded site data from JSON');
        console.log('📊 Data includes:');
        console.log(`   - ${siteData.projects?.length || 0} projects`);
        console.log(`   - ${siteData.services?.length || 0} services`);
        console.log(`   - ${siteData.testimonials?.length || 0} testimonials`);
        console.log(`   - ${siteData.faq?.length || 0} FAQ items`);
        
        // Insert or update site data
        const { data, error } = await supabase
            .from('sites')
            .upsert({
                domain: 'code7.co.il',
                data: siteData
            }, { 
                onConflict: 'domain' 
            });
        
        if (error) {
            console.error('❌ Error inserting site data:', error);
            return false;
        }
        
        console.log('✅ Site data migrated successfully to Supabase!');
        
        // Test retrieval
        const { data: retrievedData, error: retrieveError } = await supabase
            .from('sites')
            .select('domain, created_at, updated_at')
            .eq('domain', 'code7.co.il')
            .single();
        
        if (retrieveError) {
            console.error('❌ Error testing data retrieval:', retrieveError);
            return false;
        }
        
        console.log('✅ Data retrieval test successful:');
        console.log(`   Domain: ${retrievedData.domain}`);
        console.log(`   Created: ${retrievedData.created_at}`);
        console.log(`   Updated: ${retrievedData.updated_at}`);
        
        return true;
    } catch (error) {
        console.error('❌ Error in migration:', error);
        return false;
    }
}

// Run migration
migrateSiteData()
    .then(success => {
        if (success) {
            console.log('🎉 Migration completed successfully!');
            console.log('🔄 Next step: Update server to use Supabase');
        } else {
            console.log('💥 Migration failed');
        }
        process.exit(success ? 0 : 1);
    })
    .catch(error => {
        console.error('💥 Migration crashed:', error);
        process.exit(1);
    });