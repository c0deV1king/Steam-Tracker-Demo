import fetch from 'node-fetch';

export async function handler(event, context) {
    // Function logic here
    const appId = event.queryStringParameters.appId;
  
    try {
      const response = await fetch(`http://api.steampowered.com/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v0002/?gameid=1915380&format=json`);
      const data = await response.json();
  
      return {
        statusCode: 200,
        body: JSON.stringify(data)
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: `Failed to fetch recent games for steamid: ${steamId}` })
      };
    }
  };