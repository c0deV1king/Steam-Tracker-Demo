import fetch from 'node-fetch';

export async function handler(event, context) {
  const { key, steamids } = event.queryStringParameters;

  if (!key || !steamids) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing required parameters' }),
    };
  }

  const url = `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${key}&steamids=${steamids}`;

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Steam API responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Steam API response:', JSON.stringify(data, null, 2));

    if (!data.response || !data.response.players) {
      throw new Error('Unexpected response structure from Steam API');
    }

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Function failed', details: error.message }),
    };
  }
}
