// Setup script for new client with their own Supabase project
const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function setupNewClient() {
    console.log('🚀 הגדרת לקוח חדש עם Supabase');
    console.log('=====================================\n');
    
    try {
        // Get client information
        const clientName = await question('שם הלקוח (אנגלית, ללא רווחים): ');
        const clientDomain = await question('דומיין הלקוח (למשל: barbershop.com): ');
        const supabaseUrl = await question('Supabase URL (https://xxx.supabase.co): ');
        const supabaseKey = await question('Supabase Anon Key: ');
        
        console.log('\n📋 פרטי הלקוח:');
        console.log(`   שם: ${clientName}`);
        console.log(`   דומיין: ${clientDomain}`);
        console.log(`   Supabase: ${supabaseUrl}`);
        
        const confirm = await question('\nהאם הפרטים נכונים? (y/n): ');
        if (confirm.toLowerCase() !== 'y') {
            console.log('❌ ביטול הגדרה');
            process.exit(0);
        }
        
        // Create Supabase client for this specific project
        const clientSupabase = createClient(supabaseUrl, supabaseKey);
        
        // Test connection
        console.log('\n🔍 בדיקת חיבור ל-Supabase...');
        const { error: testError } = await clientSupabase
            .from('sites')
            .select('count')
            .limit(1);
        
        if (testError) {
            console.error('❌ שגיאה בחיבור:', testError.message);
            console.log('🔧 ודא שהטבלאות נוצרו ב-SQL Editor:');
            console.log('   scripts/setup-supabase.sql');
            process.exit(1);
        }
        
        console.log('✅ חיבור תקין ל-Supabase');
        
        // Create default site data
        console.log('\n📝 יוצר נתוני ברירת מחדל...');
        const defaultData = {
            hero: {
                headline: `ברוכים הבאים ל-${clientName}`,
                subtitle: "פתרונות מותאמים אישית עבור העסק שלכם",
                background: "gradient",
                animations: true
            },
            services: [
                {
                    id: 1,
                    name: "שירות ראשי",
                    description: "תיאור השירות הראשי שלנו",
                    icon: "service",
                    active: true,
                    order: 0
                }
            ],
            projects: [],
            testimonials: [
                {
                    id: "testimonial1",
                    name: "לקוח מרוצה",
                    company: "",
                    role: "בעל עסק",
                    text: "שירות מעולה ומקצועי",
                    rating: 5,
                    image: ""
                }
            ],
            faq: [
                {
                    id: "faq1",
                    question: "איך ניתן ליצור איתכם קשר?",
                    answer: "ניתן ליצור קשר דרך הטלפון או הטופס באתר"
                }
            ],
            contact: {
                fields: [],
                submissions: []
            },
            settings: {
                businessName: clientName,
                phone: "",
                email: "",
                logo: "",
                social: {
                    facebook: "",
                    instagram: "",
                    linkedin: ""
                }
            },
            design: {
                colors: {
                    primary: "#007AFF",
                    dark: "#1D1D1F",
                    light: "#F2F2F7"
                },
                typography: {
                    fontFamily: "Heebo",
                    sizes: {
                        h1: 48,
                        h2: 36,
                        body: 16
                    }
                }
            },
            seo: {
                title: `${clientName} - ברוכים הבאים`,
                description: `${clientName} - פתרונות מותאמים אישית`,
                keywords: "עסק, שירותים, מקצועי"
            }
        };
        
        // Insert data to Supabase
        console.log('💾 שומר נתונים ל-Supabase...');
        const { data, error } = await clientSupabase
            .from('sites')
            .insert({
                domain: clientDomain,
                data: defaultData
            });
        
        if (error) {
            console.error('❌ שגיאה בשמירת נתונים:', error.message);
            process.exit(1);
        }
        
        // Create configuration file
        console.log('📁 יוצר קובץ קונפיגורציה...');
        const configContent = `// Supabase configuration for ${clientName}
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = '${supabaseUrl}';
const supabaseKey = '${supabaseKey}';

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = { supabase };
`;
        
        const fs = require('fs').promises;
        const path = require('path');
        
        await fs.writeFile(
            path.join(__dirname, `../lib/supabase-${clientName}.js`), 
            configContent
        );
        
        console.log('\n🎉 הגדרת הלקוח הושלמה בהצלחה!');
        console.log('=================================');
        console.log('✅ נתונים נוצרו ב-Supabase');
        console.log(`✅ קובץ קונפיגורציה: lib/supabase-${clientName}.js`);
        console.log(`✅ דומיין: ${clientDomain}`);
        
        console.log('\n📋 מה הלאה:');
        console.log('1. עדכן את server.js להשתמש בקונפיגורציה החדשה');
        console.log('2. התאם צבעים וטקסטים דרך פאנל הניהול');
        console.log('3. העלה תמונות ותוכן');
        console.log('4. בדוק שהכל עובד במובייל');
        
    } catch (error) {
        console.error('❌ שגיאה כללית:', error.message);
    } finally {
        rl.close();
    }
}

// Run if called directly
if (require.main === module) {
    setupNewClient();
}

module.exports = { setupNewClient };