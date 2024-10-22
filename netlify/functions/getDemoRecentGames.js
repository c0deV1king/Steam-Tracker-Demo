export async function handler(event, context) {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 100));
  
    // Mock data that mimics the real Steam API response
    const data = {
      response: {
        total_count: 2,
        games: [
          {
            appid: 570,
            name: "Dota 2",
            playtime_2weeks: 600,
            playtime_forever: 25000,
            img_icon_url: "0bbb630d63262dd66d2fdd0f7d37e8661a410075",
            img_logo_url: "d4f836839254be08d8e9dd333ecc9a01782c26d2"
          },
          {
            appid: 730,
            name: "Counter-Strike: Global Offensive",
            playtime_2weeks: 180,
            playtime_forever: 15000,
            img_icon_url: "69f7ebe2735c366c65c0b33dae00e12dc40edbe4",
            img_logo_url: "d0595ff02f5c79fd19b06f4d6165c3fda2372820"
          }
        ]
      }
    };
  
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    };
  };
