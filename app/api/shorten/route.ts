import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import snowflake from '@/lib/snowflake';
import { encode } from '@/utils/base62';
import { cache } from '@/lib/redis';

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 10 requests per minute per IP
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'anonymous';
    const allowed = await cache.rateLimit(ip, 10, 60);
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 });
    }

    const { url, customCode } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    let shortCode: string;

    if (customCode) {
      // Check if custom code exists
      const existing = await prisma.shortLink.findUnique({
        where: { shortCode: customCode },
      });
      if (existing) {
        return NextResponse.json({ error: 'Custom code already in use' }, { status: 400 });
      }
      shortCode = customCode;
    } else {
      // Generate using Snowflake + Base62
      const id = snowflake.nextId();
      shortCode = encode(id);
    }

    const shortLink = await prisma.shortLink.create({
      data: {
        shortCode,
        originalUrl: url,
      },
    });

    return NextResponse.json(shortLink);
    
  } catch (error) {
    console.error('Shorten Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
