export async function handler(event, context) {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 100));
  
    // Mock data
    const data = {
      response: {
        players: [
          {
            steamid: "55555555555",
            personaname: "Demo Account",
            profileurl: "#",
            avatarfull: "https://www.teknouser.com/wp-content/uploads/2020/04/steam-profil-resmi-5.jpg",
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
