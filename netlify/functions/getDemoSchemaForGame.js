export async function handler(event, context) {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 100));
  
    // Mock data
    const game = {
      gameName: "Half-Life 3",
      availableGameStats: {
        achievements: {
            0: {
                name: "achievement_1",
                displayName: "Achievement 1",
                description: "Description of Achievement 1",
                icon: "https://via.placeholder.com/150"
            },
            1: {
                name: "achievement_2",
                displayName: "Achievement 2",
                description: "Description of Achievement 2",
                icon: "https://via.placeholder.com/150"
            }
        }

      },
      success: true,
    };
  
    // Construct API-like response
    const response = {
      status: "success",
      data: game,
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