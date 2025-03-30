const fetch = require('node-fetch');

export async function handler(event, context) {
  const params = new URLSearchParams(event.queryStringParameters);

  // Validate the Steam response
  const validationResponse = await fetch('https://steamcommunity.com/openid/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      ...Object.fromEntries(params),
      'openid.mode': 'check_authentication'
    })
  });

  const validationText = await validationResponse.text();

  if (validationText.includes('is_valid:true')) {
    const steamId = params.get('openid.claimed_id').split('/').pop();
    const isLocalDev = event.headers.host.includes('localhost') || event.headers.host.includes('127.0.0.1');
    const baseUrl = isLocalDev ? `http://${event.headers.host}` : 'https://steam-tracker.netlify.app';
    
    return {
      statusCode: 302,
      headers: {
        'Location': `${baseUrl}/?steamId=${steamId}`,
        'Set-Cookie': `steamId=${steamId}; HttpOnly; Secure; SameSite=Strict; Path=/`
      },
    };
  } else {
    return {
      statusCode: 302,
      headers: {
        'Location': '/?error=auth_failed'
      },
    };
  }
};
