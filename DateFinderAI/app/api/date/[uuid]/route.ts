import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { uuid: string } }
) {
  try {
    const { uuid } = params;

    // Forward the request to Railway backend
    const railwayResponse = await fetch(
      `https://datetime-production.up.railway.app/api/date/${uuid}`,
      {
        method: 'GET',
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