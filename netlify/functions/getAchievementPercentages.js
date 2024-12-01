import fetch from 'node-fetch';

export async function handler(event, context) {
    const appid = event.queryStringParameters.appid;
    const apiKey = process.env.STEAM_API_KEY;
    
    if (!appid) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Missing required parameter: appid' })
        };
    }

    if (!apiKey) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Steam API key not configured' })
        };
    }
  
    try {
        const response = await fetch(`http://api.steampowered.com/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v0002/?gameid=${appid}&format=json&key=${apiKey}`);
        
        if (!response.ok) {
            throw new Error(`Steam API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
  
        return {
            statusCode: 200,
            body: JSON.stringify(data)
        };
    } catch (error) {
        console.error('Error fetching achievement percentages:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: `Failed to fetch achievement percentages for appid: ${appid}`,
                details: error.message
            })
        };
    }
}