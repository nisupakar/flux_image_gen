import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { imageId } = await request.json();

    // Check if the user has already liked the image
    const { data: existingLike, error: likeError } = await supabase
      .from('user_likes')
      .select()
      .eq('user_id', userId)
      .eq('image_id', imageId)
      .single();

    if (likeError && likeError.code !== 'PGRST116') {
      throw likeError;
    }

    let action: 'liked' | 'unliked';

    if (existingLike) {
      // Unlike the image
      await supabase
        .from('user_likes')
        .delete()
        .eq('user_id', userId)
        .eq('image_id', imageId);
      action = 'unliked';
    } else {
      // Like the image
      await supabase
        .from('user_likes')
        .insert({ user_id: userId, image_id: imageId });
      action = 'liked';
    }

    // Update the likes count in the images table
    const { data: updatedImage, error: updateError } = await supabase.rpc('update_likes_count', { 
      p_image_id: imageId, 
      p_increment: action === 'liked' ? 1 : -1 
    });

    if (updateError) throw updateError;

    const updatedLikesCount = updatedImage[0].updated_likes_count;

    return NextResponse.json({ success: true, likes: updatedLikesCount, action });
  } catch (error) {
    console.error('Error in like-image API:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}