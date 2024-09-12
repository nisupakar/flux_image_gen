import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { imageId } = await request.json();

    // TODO: Implement database update logic here
    // For now, we'll just return a mock response
    console.log(`Liked image with ID: ${imageId}`);

    return NextResponse.json({ success: true, likes: 1 });
  } catch (error) {
    console.error('Error in like-image API:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}