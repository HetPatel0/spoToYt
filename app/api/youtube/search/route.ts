// app/api/youtube/search/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { q } = await request.json();
    
    console.log('Searching YouTube for:', q);
    
    const apiKey = process.env.YOUTUBE_API_KEY;
    
    if (!apiKey) {
      console.error('❌ YOUTUBE_API_KEY not found in environment variables');
      return NextResponse.json({ 
        videoId: null, 
        error: 'YouTube API key not configured' 
      });
    }

    // YouTube Data API v3 search endpoint
    const url = `https://www.googleapis.com/youtube/v3/search?` +
      `part=snippet&q=${encodeURIComponent(q)}&type=video&maxResults=1&key=${apiKey}`;
    
    console.log('Calling YouTube API...');
    
    const response = await fetch(url);
    
    console.log('YouTube API status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('YouTube API error:', errorText);
      return NextResponse.json({ 
        videoId: null, 
        error: errorText 
      });
    }
    
    const data = await response.json();
    
    console.log('YouTube API response:', JSON.stringify(data, null, 2));
    
    if (data.items && data.items.length > 0) {
      const videoId = data.items[0].id.videoId;
      console.log('✅ Found video:', videoId);
      return NextResponse.json({ videoId });
    }
    
    console.log(' No videos found in response');
    return NextResponse.json({ videoId: null });
    
  } catch (error) {
    console.error('YouTube search error:', error);
    return NextResponse.json({ 
      videoId: null, 
      error: String(error) 
    });
  }
}