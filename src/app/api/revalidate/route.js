import { createHmac, timingSafeEqual } from 'node:crypto';
import { revalidateTag } from 'next/cache';
import { SHOPIFY_CACHE_TAG } from '@/lib/shopify';

// Shopify webhook target (metaobjects/create|update|delete). Shopify signs the
// raw request body with the webhook secret (HMAC-SHA256, base64) and sends it
// in X-Shopify-Hmac-Sha256. A valid call clears every cached Shopify response,
// so the next page request fetches fresh content.
export async function POST(request) {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  if (!secret) {
    return Response.json(
      { error: 'SHOPIFY_WEBHOOK_SECRET is not set' },
      { status: 500 }
    );
  }

  const body = await request.text();
  const received = Buffer.from(
    request.headers.get('x-shopify-hmac-sha256') ?? '',
    'utf8'
  );
  const expected = Buffer.from(
    createHmac('sha256', secret).update(body, 'utf8').digest('base64'),
    'utf8'
  );

  if (
    received.length !== expected.length ||
    !timingSafeEqual(received, expected)
  ) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 });
  }

  revalidateTag(SHOPIFY_CACHE_TAG);
  return Response.json({ revalidated: true, at: new Date().toISOString() });
}
