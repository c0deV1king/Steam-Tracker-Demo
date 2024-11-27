import fetch from 'node-fetch';

export async function handler(event, context) {
    // Function logic here
    const appId = event.queryStringParameters.appId;
  
    try {
      const response = await fetch(`http://api.steampowered.com/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v0002/?gameid=${appId}&format=json`);
      const data = await response.json();
  
      return {
        statusCode: 200,
        body: JSON.stringify(data)
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: `Failed to fetch achievement percentages for appid: ${appId}` })
      };
    }
  };