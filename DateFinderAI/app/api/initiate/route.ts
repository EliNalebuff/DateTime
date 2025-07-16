import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Get the current request URL to determine the frontend base URL
    const requestUrl = new URL(request.url);
    const frontendOrigin = `${requestUrl.protocol}//${requestUrl.host}`;

    // Forward the request to Railway backend
    const railwayResponse = await fetch(
      'https://datetime-production.up.railway.app/api/initiate',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': frontendOrigin, // Pass the frontend origin so backend generates correct URLs
        },
        body: JSON.stringify(body),
      }
    );

    const data = await railwayResponse.json();

    // Return the response from Railway with the same status code
    return NextResponse.json(data, { status: railwayResponse.status });
  } catch (error) {
    console.error('API proxy error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 