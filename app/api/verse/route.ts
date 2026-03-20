import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ref = searchParams.get('ref');
  const version = searchParams.get('version') || 'NGU-DE';

  if (!ref) {
    return Response.json({ error: 'Missing ref parameter' }, { status: 400 });
  }

  try {
    const url = `https://www.biblegateway.com/passage/?search=${encodeURIComponent(ref)}&version=${encodeURIComponent(version)}&interface=print`;

    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
      },
    });

    if (!res.ok) {
      return Response.json({ error: 'Fetch failed', status: res.status }, { status: 502 });
    }

    const html = await res.text();

    // Extract verse text from the passage-text div
    const passageStart = html.indexOf('passage-text');
    if (passageStart === -1) {
      return Response.json({ error: 'No passage found' }, { status: 404 });
    }

    const snippet = html.slice(passageStart, passageStart + 5000);

    // Extract all text spans with class "text ..."
    const textMatches: string[] = [];
    const spanRegex = /<span[^>]+class="text[^"]*"[^>]*>([\s\S]*?)<\/span>/g;
    let m: RegExpExecArray | null;
    while ((m = spanRegex.exec(snippet)) !== null) {
      // Strip inner HTML tags (sup, footnote links, etc.)
      const clean = m[1]
        .replace(/<sup[^>]*>[\s\S]*?<\/sup>/g, '')
        .replace(/<[^>]+>/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      if (clean) textMatches.push(clean);
    }

    if (textMatches.length === 0) {
      return Response.json({ error: 'Could not extract verse text' }, { status: 404 });
    }

    const text = textMatches.join(' ');
    return Response.json({ text });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
