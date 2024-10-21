const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    // Function logic here
    const appid = event.queryStringParameters.appid;
  
    try {
      const response = await fetch(`https://store.steampowered.com/api/appdetails?appids=${appid}`);
      const data = await response.json();
  
      return {
        statusCode: 200,
        body: JSON.stringify(data)
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: `Failed to fetch data for appid: ${appid}` })
      };
    }
  };