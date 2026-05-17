import { NextRequest, NextResponse, after } from 'next/server';
import prisma from '@/lib/prisma';
import { cache } from '@/lib/redis';
import { UAParser } from 'ua-parser-js';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ shortCode: string }> }
) {
  const { shortCode } = await params;

  try {
    // 1. Check Database
    const link = await prisma.shortLink.findUnique({
      where: { shortCode },
      select: { id: true, originalUrl: true },
    });

    if (!link) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    // 2. Defer Analytics and Cache update
    after(async () => {
      try {
        const userAgent = req.headers.get('user-agent') || '';
        const parser = new UAParser(userAgent);
        const parsedUA = parser.getResult();

        await prisma.$transaction([
          prisma.shortLink.update({
            where: { id: link.id },
            data: { clicks: { increment: 1 } },
          }),
          prisma.clickAnalytics.create({
            data: {
              shortLinkId: link.id,
              ip: req.headers.get('x-forwarded-for') || 'unknown',
              userAgent: userAgent,
              device: parsedUA.device.type || 'desktop',
              browser: parsedUA.browser.name,
              os: parsedUA.os.name,
              country: req.headers.get('x-vercel-ip-country'),
              region: req.headers.get('x-vercel-ip-country-region'),
              city: req.headers.get('x-vercel-ip-city'),
              referer: req.headers.get('referer'),
            },
          }),
        ]);

        await cache.setRedirect(shortCode, link.originalUrl);
      } catch (e) {
        console.error('Analytics background task error:', e);
      }
    });

    // 3. Redirect instantly
    return NextResponse.redirect(new URL(link.originalUrl));

  } catch (error) {
    console.error('Resolution Error:', error);
    return NextResponse.redirect(new URL('/', req.url));
  }
}
