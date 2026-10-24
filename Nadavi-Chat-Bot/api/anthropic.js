export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const headerKey = req.headers.get('x-api-key');
  const apiKey = process.env.ANTHROPIC_API_KEY || ((headerKey && headerKey !== 'YOUR_ANTHROPIC_API_KEY_HERE' && headerKey !== 'null') ? headerKey : null);
  if (!apiKey) {
    return new Response(JSON.stringify({ error: { message: "Missing API Key" } }), { 
      status: 401, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }

  const body = await req.text();

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: body
    });

    return new Response(response.body, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'text/event-stream'
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: { message: err.message } }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
}
