import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data, error } = await supabase
      .from('user_likes')
      .select('image_id')
      .eq('user_id', userId);

    if (error) throw error;

    const likedImageIds = data.map(like => like.image_id);
    return NextResponse.json({ likedImageIds });
  } catch (error) {
    console.error('Error fetching user likes:', error);
    return NextResponse.json({ error: 'Failed to fetch user likes' }, { status: 500 });
  }
}