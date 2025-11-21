import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

        console.log('Supabase URL:', supabaseUrl);
        console.log('Service key length:', supabaseServiceKey?.length);

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Check if we can connect to the database
        const { data: testData, error: testError } = await supabase
            .from('investor_personas')
            .select('count')
            .limit(1);

        if (testError) {
            console.error('Database connection test failed:', testError);
            return NextResponse.json(
                {
                    success: false,
                    error: 'Database connection failed: ' + testError.message,
                    details: testError
                },
                { status: 500 }
            );
        }

        // Check if data already exists
        const { count: existingCount } = await supabase
            .from('investor_personas')
            .select('*', { count: 'exact', head: true });

        console.log('Existing investor count:', existingCount);

        if (existingCount && existingCount > 0) {
            return NextResponse.json({
                success: true,
                message: `Database already contains ${existingCount} investor personas. No seeding needed.`
            });
        }

        // Insert seed data
        const investorData = [
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
            }
        ];

        console.log('Attempting to insert investor data...');

        const { data, error } = await supabase
            .from('investor_personas')
            .insert(investorData)
            .select();

        if (error) {
            console.error('Insert failed:', error);
            return NextResponse.json(
                {
                    success: false,
                    error: 'Failed to insert investor data: ' + error.message,
                    details: error
                },
                { status: 500 }
            );
        }

        console.log('Insert successful:', data?.length, 'records inserted');

        // Verify the insertion
        const { count: finalCount } = await supabase
            .from('investor_personas')
            .select('*', { count: 'exact', head: true });

        return NextResponse.json({
            success: true,
            message: `Successfully seeded ${data?.length || 0} investor personas`,
            totalCount: finalCount,
            insertedData: data
        });

    } catch (error) {
        console.error('Seed process failed:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
                details: error
            },
            { status: 500 }
        );
    }
}