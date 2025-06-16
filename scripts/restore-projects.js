// Script to restore projects to Supabase
const { supabase } = require('../lib/supabase');
const fs = require('fs').promises;

async function restoreProjects() {
    console.log('🔄 משחזר פרויקטים ל-Supabase...');
    
    try {
        // Read projects from backup
        const projectsData = await fs.readFile('/tmp/projects_backup.json', 'utf8');
        const projects = JSON.parse(projectsData);
        
        console.log(`📂 נמצאו ${projects.length} פרויקטים לשחזור`);
        
        // Get current site data
        const { data: currentSite, error: fetchError } = await supabase
            .from('sites')
            .select('data')
            .eq('domain', 'code7.co.il')
            .single();
        
        if (fetchError) {
            throw new Error('לא ניתן לטעון נתוני אתר נוכחיים: ' + fetchError.message);
        }
        
        // Update projects in site data
        const updatedData = {
            ...currentSite.data,
            projects: projects
        };
        
        // Save back to Supabase
        const { error: updateError } = await supabase
            .from('sites')
            .update({ data: updatedData })
            .eq('domain', 'code7.co.il');
        
        if (updateError) {
            throw new Error('שגיאה בעדכון פרויקטים: ' + updateError.message);
        }
        
        console.log('✅ הפרויקטים שוחזרו בהצלחה ל-Supabase!');
        console.log('📊 סה"כ פרויקטים:', projects.length);
        
        // Verify restoration
        const { data: verifyData } = await supabase
            .from('sites')
            .select('data')
            .eq('domain', 'code7.co.il')
            .single();
        
        console.log('🔍 אימות: נמצאו', verifyData.data.projects.length, 'פרויקטים');
        
    } catch (error) {
        console.error('❌ שגיאה בשחזור פרויקטים:', error.message);
        process.exit(1);
    }
}

// Run restoration
restoreProjects()
    .then(() => {
        console.log('🎉 שחזור הושלם בהצלחה!');
        process.exit(0);
    })
    .catch(error => {
        console.error('💥 שחזור נכשל:', error);
        process.exit(1);
    });