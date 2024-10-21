exports.handler = async function(event, context) {
    // Simulate a delay to mimic a real API call
    await new Promise(resolve => setTimeout(resolve, 1000));
  
    // Mock Steam user data
    const mockUser = {
      steamid: "76561198000000000",
      personaname: "MockSteamUser",
      profileurl: "https://steamcommunity.com/id/mockuser/",
      avatar: "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/fe/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb.jpg",
      timecreated: 1234567890,
      loccountrycode: "US",
      gamecount: 250,
      level: 50
    };
  
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(mockUser)
    };
  };