export async function handler(event, context) {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 100));
  
    // Mock data
    const data = {
      244210: {
        success: true,
        data: {
            type: "game",
            name: "Half-Life 3",
            steam_appid: 244210,
            is_free: false,
            header_image: "https://via.placeholder.com/150",
            capsule_image: "https://via.placeholder.com/150",
            genres: [
                {
                    id: "1",
                    description: "Action"
                }
            ],
            achievements: {
                total: 10,
                highlighted: [
                    {
                        name: "Achievement 1",
                        icon: "https://via.placeholder.com/150",
                        description: "Description of Achievement 1"
                    },
                    {
                        name: "Achievement 2",
                        icon: "https://via.placeholder.com/150",
                        description: "Description of Achievement 2"
                    }
                ]
            }
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