const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    // Function logic here
    const steamApiKey = process.env.STEAM_API_KEY;
    const appid = event.queryStringParameters.appid;
  
    try {
      const response = await fetch(`https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v0002/?appid=${appid}&key=${steamApiKey}`);
      const data = await response.json();
  
      return {
        statusCode: 200,
        body: JSON.stringify(data)
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: `Failed to fetch schema for game: ${game.appid}` })
      };
    }
  };