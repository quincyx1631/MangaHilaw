// File: app/api/manga/[...path]/route.ts
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  context: { params: Promise<{ path: string[] }> } 
) {
  const { path } = await context.params;
  const MANGA_API_URL = process.env.MANGA_API_URL;

  const fullPath = Array.isArray(path) ? path.join('/') : path;
  const { searchParams } = new URL(request.url);
  const url = new URL(`${MANGA_API_URL}/${fullPath}`);
  searchParams.forEach((value, key) => url.searchParams.append(key, value));

  try {
    const response = await fetch(url.toString());

    if (!response.ok) {
      return NextResponse.json(
        { error: `Error from manga API: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching from manga API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from manga API' },
      { status: 500 }
    );
  }
}
