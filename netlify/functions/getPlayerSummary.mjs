const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    // Function logic here
    const steamApiKey = process.env.STEAM_API_KEY;
    const steamId = event.queryStringParameters.steamId;
  
    try {
      const response = await fetch(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${steamApiKey}&steamids=${steamId}`);
      const data = await response.json();
  
      return {
        statusCode: 200,
        body: JSON.stringify(data)
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: `Failed to fetch data for steamid: ${steamId}` })
      };
    }
  };