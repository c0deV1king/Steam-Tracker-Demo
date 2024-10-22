export async function handler(event, context) {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 100));
  
    // Mock data
    const data = {
      game_count: 10,
      games: {
        0: {
            appid: 244210,
            playtime_2weeks: 10,
            playtime_forever: 100,
        },
        1: {
            appid: 244210,
            playtime_2weeks: 10,
            playtime_forever: 100,
        },
        2: {
            appid: 244210,
            playtime_2weeks: 10,
            playtime_forever: 100,
        },
        3: {
            appid: 244210,
            playtime_2weeks: 10,
            playtime_forever: 100,
        },
        4: {
            appid: 244210,
            playtime_2weeks: 10,
            playtime_forever: 100,
        },
        5: {
            appid: 244210,
            playtime_2weeks: 10,
            playtime_forever: 100,
        },
        6: {
            appid: 244210,
            playtime_2weeks: 10,
            playtime_forever: 100,
        },
        7: {
            appid: 244210,
            playtime_2weeks: 10,
            playtime_forever: 100,
        },
        8: {
            appid: 244210,
            playtime_2weeks: 10,
            playtime_forever: 100,
        },
        9: {
            appid: 244210,
            playtime_2weeks: 10,
            playtime_forever: 100,
        }
      }
    };
  
    // Construct API-like response
    const response = {
      status: "success",
      data: data,
      metadata: {
        timestamp: new Date().toISOString(),
        version: "1.0"
      }
    };
  
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(response)
    };
  };