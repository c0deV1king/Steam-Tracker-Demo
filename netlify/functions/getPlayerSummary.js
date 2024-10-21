import fetch from 'node-fetch';

export async function handler(event, context) {
  // Function logic here
  const steamApiKey = process.env.STEAM_API_KEY;
  const steamid = event.queryStringParameters.steamid;

  try {
    const response = await fetch(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${steamApiKey}&steamids=${steamid}`);
    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Failed to fetch achievements for appid: ${appid}` })
    };
  }
};