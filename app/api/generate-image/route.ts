import { NextResponse } from 'next/server';
import Replicate from 'replicate';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});


export async function POST(request: Request) {
  const { userId, getToken } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabaseAccessToken = await getToken({ template: 'supabase' });
    const supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${supabaseAccessToken}`,
          },
        },
      }
    );

    const { prompt } = await request.json();

    try {
      const output = await replicate.run(
        "lucataco/flux-dev-lora:613a21a57e8545532d2f4016a7c3cfa3c7c63fded03001c2e69183d557a929db",
        {
          input: {
            prompt: prompt,
            hf_lora: "nsuakar/flux_nishant_lora",
            lora_scale: 0.92,
          }
        }
      );

      if (Array.isArray(output) && output.length > 0) {
        const imageUrl = output[0];
        
        // Download the image
        const imageResponse = await fetch(imageUrl);
        const imageBuffer = await imageResponse.arrayBuffer();

        // Upload to Supabase
        const fileName = `${userId}_${Date.now()}.png`;
        const { error } = await supabaseClient.storage
          .from('Images')
          .upload(fileName, imageBuffer, {
            contentType: 'image/png'
          });

        if (error) {
          throw error;
        }

        // Get public URL
        const { data: { publicUrl } } = supabaseClient.storage
          .from('Images')
          .getPublicUrl(fileName);

        console.log('Generated image public URL:', publicUrl);

        // Insert into images table
        const { data: imageData, error: insertError } = await supabaseClient
          .from('images')
          .insert({
            image_url: publicUrl, // Use the publicUrl directly
            prompt: prompt,
            creator_user_id: userId
          })
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }

        return NextResponse.json({ 
          message: 'Image generated and saved successfully',
          image: imageData
        });
      } else {
        throw new Error('No image generated');
      }
    } catch (error) {
      console.error('Error:', error);
      return NextResponse.json({ error: 'Failed to generate or save image' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to generate or save image' }, { status: 500 });
  }
}
export const runtime = 'edge';
export const maxDuration = 300
;
