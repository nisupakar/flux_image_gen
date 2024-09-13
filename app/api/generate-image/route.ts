import { NextResponse } from 'next/server';
import Replicate from "replicate";

export async function POST(request: Request) {
  const { prompt } = await request.json();
  try {
    const replicate = new Replicate();
    const input = {
      prompt: prompt,
      hf_lora: "nsuakar/flux_nishant_lora",
      lora_scale: 0.92
    };

    const output = await replicate.run(
      "lucataco/flux-dev-lora:613a21a57e8545532d2f4016a7c3cfa3c7c63fded03001c2e69183d557a929db",
      { input }
    );

    console.log('Replicate API response:', output);
    return NextResponse.json({
      status: 'succeeded',
      id: Date.now().toString(), // Generate a unique ID
      output: output
    });
  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 });
  }
}