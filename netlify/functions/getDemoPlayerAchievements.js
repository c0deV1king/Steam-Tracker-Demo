export async function handler(event, context) {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 100));
  
    // Mock data
    const playerstats = {
      steamid: "55555555555",
      gameName: "Half-Life 3",
      achievements: {
        0: {
            apiname: "achievement_1",
            achieved: 1,
            unlocktime: 1718928000,
        },
        1: {
            apiname: "achievement_2",
            achieved: 0,
            unlocktime: 0,
        }
      },
      success: true,
    };
  
    // Construct API-like response
    const response = {
      status: "success",
      data: playerstats,
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