const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    // Function logic here
    const steamApiKey = process.env.STEAM_API_KEY;
    const steamId = event.queryStringParameters.steamId;
  
    try {
      const response = await fetch(`https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${steamApiKey}&steamid=${steamId}&format=json&include_played_free_games=1`);
      const data = await response.json();
  
      return {
        statusCode: 200,
        body: JSON.stringify(data)
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: `Failed to fetch owned games for steamid: ${steamId}` })
      };
    }
  };