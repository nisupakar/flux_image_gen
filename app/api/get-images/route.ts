import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function GET() {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data: images, error } = await supabase
      .from('images')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(6);

    if (error) throw error;

    console.log('Fetched images:', images);
    console.log('Number of images fetched:', images.length);
    images.forEach((image, index) => {
      console.log(`Image ${index}:`, image);
      console.log('Image URL:', image.image_url);
    });

    return NextResponse.json({ images });
  } catch (error) {
    console.error('Error fetching images:', error);
    return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 });
  }
}