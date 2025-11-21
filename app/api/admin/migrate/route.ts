import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Check if tables already exist
        const { data: existingPersonas, error: checkError } = await supabase
            .from('investor_personas')
            .select('id')
            .limit(1);

        let results = [];

        // If tables don't exist, create them
        if (checkError && checkError.code === 'PGRST116') {
            // Create investor_personas table
            const { error: createTablesError } = await supabase.rpc('exec_sql', {
                sql: `
          -- Enable necessary extensions
          CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
          CREATE EXTENSION IF NOT EXISTS "pgcrypto";

          -- Create investor_personas table
          CREATE TABLE investor_personas (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name TEXT NOT NULL,
            role TEXT NOT NULL,
            region TEXT NOT NULL,
            language_code TEXT DEFAULT 'en',
            avatar_url TEXT,
            risk_appetite TEXT NOT NULL DEFAULT 'Moderate',
            target_sector TEXT NOT NULL DEFAULT 'General Technology',
            check_size TEXT NOT NULL DEFAULT '$1M - $5M',
            investment_thesis TEXT NOT NULL,
            talking_style_json JSONB NOT NULL DEFAULT '{}',
            created_at TIMESTAMPTZ DEFAULT NOW()
          );

          -- Create pitch_sessions table  
          CREATE TABLE pitch_sessions (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id TEXT,
            persona_id UUID REFERENCES investor_personas(id) ON DELETE CASCADE,
            chat_transcript JSONB DEFAULT '[]',
            outcome TEXT CHECK (outcome IN ('win', 'lose')),
            started_at TIMESTAMPTZ DEFAULT NOW(),
            ended_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ DEFAULT NOW()
          );

          -- Create indexes for performance
          CREATE INDEX idx_investor_personas_region ON investor_personas(region);
          CREATE INDEX idx_investor_personas_created_at ON investor_personas(created_at);
          CREATE INDEX idx_pitch_sessions_user_id ON pitch_sessions(user_id);
          CREATE INDEX idx_pitch_sessions_persona_id ON pitch_sessions(persona_id);

          -- Enable Row Level Security
          ALTER TABLE investor_personas ENABLE ROW LEVEL SECURITY;
          ALTER TABLE pitch_sessions ENABLE ROW LEVEL SECURITY;

          -- RLS policies for investor_personas (public read access)
          DROP POLICY IF EXISTS "Public read access to investor personas" ON investor_personas;
          CREATE POLICY "Public read access to investor personas"
            ON investor_personas FOR SELECT
            TO public
            USING (true);

          -- RLS policies for pitch_sessions (user-specific access)
          DROP POLICY IF EXISTS "Users can view own pitch sessions" ON pitch_sessions;
          CREATE POLICY "Users can view own pitch sessions"
            ON pitch_sessions FOR SELECT
            TO authenticated
            USING (user_id IS NOT NULL AND user_id = current_setting('request.jwt.claims', true)::json->>'sub');

          DROP POLICY IF EXISTS "Users can insert own pitch sessions" ON pitch_sessions;
          CREATE POLICY "Users can insert own pitch sessions"
            ON pitch_sessions FOR INSERT
            TO authenticated
            WITH CHECK (user_id IS NOT NULL AND user_id = current_setting('request.jwt.claims', true)::json->>'sub');

          DROP POLICY IF EXISTS "Users can update own pitch sessions" ON pitch_sessions;
          CREATE POLICY "Users can update own pitch sessions"
            ON pitch_sessions FOR UPDATE
            TO authenticated
            USING (user_id IS NOT NULL AND user_id = current_setting('request.jwt.claims', true)::json->>'sub')
            WITH CHECK (user_id IS NOT NULL AND user_id = current_setting('request.jwt.claims', true)::json->>'sub');

          DROP POLICY IF EXISTS "Users can delete own pitch sessions" ON pitch_sessions;
          CREATE POLICY "Users can delete own pitch sessions"
            ON pitch_sessions FOR DELETE
            TO authenticated
            USING (user_id IS NOT NULL AND user_id = current_setting('request.jwt.claims', true)::json->>'sub');
        `
            });

            if (createTablesError) {
                results.push({
                    step: 'create_tables',
                    status: 'error',
                    error: createTablesError.message
                });
            } else {
                results.push({
                    step: 'create_tables',
                    status: 'success',
                    message: 'Database tables created successfully'
                });
            }
        } else {
            results.push({
                step: 'create_tables',
                status: 'skipped',
                message: 'Database tables already exist'
            });
        }

        // Insert investor personas (only if table is empty)
        const { data: personaCount } = await supabase
            .from('investor_personas')
            .select('id', { count: 'exact' });

        if (!personaCount || personaCount.length === 0) {
            const { error: insertError } = await supabase
                .from('investor_personas')
                .insert([
                    {
                        name: 'Marc Chen',
                        role: 'The Titan',
                        region: 'USA',
                        language_code: 'en',
                        avatar_url: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg',
                        risk_appetite: 'High Risk, High Reward',
                        target_sector: 'B2B SaaS, AI Infrastructure, Fintech',
                        check_size: '$5M - $25M',
                        investment_thesis: 'You are Marc Chen, a ruthless Silicon Valley VC focused on exponential growth and market domination. Your primary obsession is finding companies with network effects and defensible moats. You immediately challenge founders on unit economics (CAC:LTV ratio) and demand proof of concept for scalability. You have zero tolerance for vague answers about market size or competition. Every response must push the founder to prove their business can achieve 10x growth. You are direct, analytical, and relentless in your questioning. You speak with authority and expect founders to bring their A-game.',
                        talking_style_json: {
                            bluntness: 9,
                            jargon_level: 'high',
                            favorite_word: 'moat',
                            humor: 2
                        }
                    },
                    {
                        name: 'Sarah Williams',
                        role: 'The Skeptic',
                        region: 'Europe',
                        language_code: 'en',
                        avatar_url: 'https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg',
                        risk_appetite: 'Moderate Risk, Data-Driven',
                        target_sector: 'Climate Tech, HealthTech, Enterprise SaaS',
                        check_size: '$2M - $10M',
                        investment_thesis: 'You are Sarah Williams, a meticulous European investor with a background in consulting and deep expertise in market analysis. You are naturally skeptical and love to poke holes in business models. You ask probing questions about customer acquisition, churn rates, and competitive advantages. You value data over hype and prefer founders who can back up their claims with concrete metrics. Your tone is professional but challenging, and you often ask "What could go wrong?" You speak with measured confidence and expect thorough answers.',
                        talking_style_json: {
                            bluntness: 6,
                            jargon_level: 'medium',
                            favorite_word: 'data',
                            humor: 3
                        }
                    },
                    {
                        name: 'Rajiv Patel',
                        role: 'The Strategist',
                        region: 'Asia',
                        language_code: 'en',
                        avatar_url: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
                        risk_appetite: 'Moderate Risk, High Volume',
                        target_sector: 'Consumer Tech, AgriTech, EdTech',
                        check_size: '$500K - $2M',
                        investment_thesis: 'You are Rajiv Patel, an experienced investor focused on emerging markets with deep understanding of localization challenges. You constantly challenge founders on pricing strategies for price-sensitive markets and distribution channels in densely populated areas. You value scrappiness, resourcefulness, and deep understanding of local market dynamics. Your questions focus on customer acquisition cost, retention, and path to profitability in resource-constrained environments. You speak with wisdom gained from seeing both successes and failures.',
                        talking_style_json: {
                            bluntness: 7,
                            jargon_level: 'medium',
                            favorite_word: 'execution',
                            humor: 5
                        }
                    },
                    {
                        name: 'Elena Volkov',
                        role: 'The Mentor',
                        region: 'USA',
                        language_code: 'en',
                        avatar_url: 'https://images.pexels.com/photos/3796217/pexels-photo-3796217.jpeg',
                        risk_appetite: 'Moderate Risk, Growth Stage',
                        target_sector: 'SaaS, Marketplace, Platform',
                        check_size: '$1M - $5M',
                        investment_thesis: 'You are Elena Volkov, a supportive investor who specializes in growth-stage companies. You have a reputation for being founder-friendly and providing operational guidance beyond capital. You ask thoughtful questions about team dynamics, company culture, and scaling challenges. You enjoy hearing about founder journeys and often share your own experiences. Your approach is nurturing but realistic, and you help founders think through complex decisions. You speak with warmth and genuine interest in their success.',
                        talking_style_json: {
                            bluntness: 4,
                            jargon_level: 'low',
                            favorite_word: 'journey',
                            humor: 7
                        }
                    },
                    {
                        name: 'David Kim',
                        role: 'The Analyst',
                        region: 'USA',
                        language_code: 'en',
                        avatar_url: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg',
                        risk_appetite: 'Conservative Risk, Data-First',
                        target_sector: 'FinTech, RegTech, B2B SaaS',
                        check_size: '$3M - $15M',
                        investment_thesis: 'You are David Kim, a former Goldman Sachs investment banker turned VC with deep expertise in financial services and regulatory environments. You are extremely analytical and love to dive deep into financial models, unit economics, and market sizing. You ask detailed questions about revenue streams, regulatory compliance, and risk management. Your background in finance means you expect founders to understand their numbers inside and out. You speak with precision and expect founders to be equally analytical.',
                        talking_style_json: {
                            bluntness: 8,
                            jargon_level: 'high',
                            favorite_word: 'metrics',
                            humor: 1
                        }
                    },
                    {
                        name: 'Priya Sharma',
                        role: 'The Visionary',
                        region: 'India',
                        language_code: 'en',
                        avatar_url: 'https://images.pexels.com/photos/3796218/pexels-photo-3796218.jpeg',
                        risk_appetite: 'Moderate Risk, Impact-Focused',
                        target_sector: 'HealthTech, CleanTech, Social Impact',
                        check_size: '$1M - $8M',
                        investment_thesis: 'You are Priya Sharma, an impact investor passionate about using technology to solve social and environmental challenges. You believe in the power of business to drive positive change while generating returns. You ask about social impact metrics, environmental sustainability, and long-term societal benefits. You are optimistic but realistic, and you help founders think about building businesses that create lasting value. Your questions often explore the "why now" and "why you" beyond just the business model.',
                        talking_style_json: {
                            bluntness: 5,
                            jargon_level: 'medium',
                            favorite_word: 'impact',
                            humor: 6
                        }
                    },
                    {
                        name: 'Marcus Johnson',
                        role: 'The Veteran',
                        region: 'USA',
                        language_code: 'en',
                        avatar_url: 'https://images.pexels.com/photos/2379007/pexels-photo-2379007.jpeg',
                        risk_appetite: 'Moderate Risk, Traditional',
                        target_sector: 'Manufacturing, Logistics, B2B Services',
                        check_size: '$5M - $20M',
                        investment_thesis: 'You are Marcus Johnson, a seasoned VC with 20+ years of experience who has seen multiple market cycles. You bring wisdom from both boom times and bust periods. You ask thoughtful questions about market timing, competitive positioning, and team experience. You prefer proven business models with clear paths to profitability and are cautious about hype-driven valuations. Your approach is measured and you often share historical context about market trends. You speak with the authority of experience.',
                        talking_style_json: {
                            bluntness: 7,
                            jargon_level: 'high',
                            favorite_word: 'discipline',
                            humor: 4
                        }
                    },
                    {
                        name: 'Anna Berg',
                        role: 'The Maverick',
                        region: 'Europe',
                        language_code: 'en',
                        avatar_url: 'https://images.pexels.com/photos/3796219/pexels-photo-3796219.jpeg',
                        risk_appetite: 'High Risk, Early Stage',
                        target_sector: 'DeepTech, AI/ML, Web3',
                        check_size: '$250K - $1.5M',
                        investment_thesis: 'You are Anna Berg, a bold early-stage investor who thrives on big bets and breakthrough technologies. You love working with technical founders and are not afraid of high-risk, high-reward opportunities. You ask about the technical innovation, IP protection, and long-term vision. You understand that early-stage investing requires patience and are willing to work closely with founders through challenges. Your questions often explore the future possibilities and how this technology could change industries. You speak with excitement about the potential.',
                        talking_style_json: {
                            bluntness: 5,
                            jargon_level: 'high',
                            favorite_word: 'innovation',
                            humor: 8
                        }
                    }
                ]);

            if (insertError) {
                results.push({
                    step: 'seed_data',
                    status: 'error',
                    error: insertError.message
                });
            } else {
                results.push({
                    step: 'seed_data',
                    status: 'success',
                    message: 'Investor personas seeded successfully'
                });
            }
        } else {
            results.push({
                step: 'seed_data',
                status: 'skipped',
                message: 'Investor personas already exist'
            });
        }

        // Final verification
        const { data: verifyPersonas, error: verifyError } = await supabase
            .from('investor_personas')
            .select('count', { count: 'exact' });

        if (verifyError) {
            results.push({
                step: 'verification',
                status: 'error',
                error: 'Verification failed: ' + verifyError.message
            });
        } else {
            results.push({
                step: 'verification',
                status: 'success',
                message: `Database setup completed successfully. Found ${verifyPersonas?.length || 0} investor personas.`
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Migration completed successfully',
            results: results
        });

    } catch (error) {
        console.error('Migration failed:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Migration failed',
                results: []
            },
            { status: 500 }
        );
    }
}