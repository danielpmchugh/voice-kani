import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const hasApiKey = !!process.env.WANIKANI_API_KEY;
    const hasApiUrl = !!process.env.NEXT_PUBLIC_API_URL;
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      apiConfigured: hasApiKey && hasApiUrl
    });
  } catch (error) {
    return NextResponse.json({ status: 'error', error: String(error) }, { status: 500 });
  }
}
