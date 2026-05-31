// AstroEvolute Service Worker — Anthropic API Proxy
// Place this file in the same folder as index.html on GitHub

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';

self.addEventListener('fetch', function(event) {
  if (!event.request.url.includes('/api/natalia')) return;

  event.respondWith(handleAI(event.request));
});

async function handleAI(request) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  try {
    const body = await request.json();
    const apiKey = body.key;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: { message: 'No key' } }), { headers });
    }

    const resp = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model:      body.model      || 'claude-haiku-4-5-20251001',
        max_tokens: body.max_tokens || 350,
        system:     body.system     || '',
        messages:   body.messages   || []
      })
    });

    const data = await resp.json();
    return new Response(JSON.stringify(data), { status: resp.status, headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: { message: e.message } }), { status: 500, headers });
  }
}
