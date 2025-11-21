import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Try to select from investor_personas
        const { data, error } = await supabase
            .from('investor_personas')
            .select('*')
            .limit(1);

        if (error) {
            return NextResponse.json({ error: error.message, code: error.code }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (err) {
        return NextResponse.json({ error: 'Server error', details: err }, { status: 500 });
    }
}