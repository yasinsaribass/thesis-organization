import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from('thesis_documents').select('*').limit(1);
  return NextResponse.json(data);
}
