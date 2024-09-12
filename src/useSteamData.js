import { useState, useEffect } from 'react';

// Plans to add to the app:
// A game page for each individual game that shows additional details for that game, including the achievements, achievement images ect. (allow user to click on the game from any tab, games or overview)
// Trophy Case
// Get recent achievements for the overview tab (requires full sync)

// Grabbing my stored api key from .env NOTE: vite requires "VITE_" in front of variables stored in .env
const API_KEY = import.meta.env.VITE_STEAM_API_KEY;

// highest impact first when deciding what to build/fix next
// create a bio in app (who i am and the project)
// video explaining the app.

export const useSteamData = () => {
  // use states to store and update data
  const [games, setGames] = useState([]);
  const [allAchievements, setAllAchievements] = useState({});
  const [gamesToDisplay, setGamesToDisplay] = useState([]);
  const [profileData, setProfileData] = useState({});
  const [playtime, setPlaytime] = useState({});
  const [gamesPlayed, setGamesPlayed] = useState({});
  const [gamePictures, setGamePictures] = useState({});
  //const [perfectGames, setPerfectGames] = useState({});
  const [recentGames, setRecentGames] = useState([]);
  const [overviewGames, setOverviewGames] = useState([]);
  const [allGames, setAllGames] = useState([]);
  const [mostRecentGame, setMostRecentGame] = useState(null);


  // Fix bugs, set up the overview tab to display only what is needed on refresh. Update the state when the user switches tabs to the games tab
  // add a loading state to any calls. (bonus for adding a little minigame while the user waits)


  // Fetch recent games
  useEffect(() => {
    const fetchOverviewGames = async () => {
      console.log("Fetching overview games");

      const cachedOverviewGames = localStorage.getItem('cachedOverviewGames');
      const cacheTimestampOverviewGames = localStorage.getItem('cacheTimestampOverviewGames');
      const now = new Date().getTime();
      console.log("Recent games cache checked")

      if (cachedOverviewGames && cacheTimestampOverviewGames && now - parseInt(cacheTimestampOverviewGames) < 24 * 60 * 60 * 1000) {
        console.log("Loading recent games from cache");
        const parsedOverviewGames = JSON.parse(cachedOverviewGames);
        setOverviewGames(parsedOverviewGames);
        console.log("Loaded recent games from cache");
        return;
      }

      console.log("No cached games found, fetching recent games");

      try {
        const res = await fetch(`http://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key=${API_KEY}&steamid=76561198119786249&format=json`);
        const data = await res.json();
        console.log("Recent games API response:", data); // Debug log
        const recentGamesData = data.response.games || [];
        console.log("Recent games data:", recentGamesData); // Debug log
        const gamesWithDetails = await getOverviewGamesWithDetails(recentGamesData);
        console.log("Games with details:", gamesWithDetails); // Debug log
        const gamesWithAchievements = await fetchAchievementsForGames(gamesWithDetails);
        console.log("Games with achievements:", gamesWithAchievements); // Debug log

        if (recentGamesData.length > 0) {
          console.log("Recent games data length is greater than 0, fetching details");
          const mostRecent = recentGamesData[0];

          const detailsRes = await fetch(`https://store.steampowered.com/api/appdetails?appids=${mostRecent.appid}`);
          const detailsData = await detailsRes.json();
          const gameDetails = detailsData[mostRecent.appid].data;

          const screenshots = gameDetails.screenshots || [];
          const randomScreenshot = screenshots.length > 0
            ? screenshots[Math.floor(Math.random() * screenshots.length)].path_full
            : null;


          setMostRecentGame({
            ...mostRecent,
            name: mostRecent.name,
            image: randomScreenshot || `https://cdn.cloudflare.steamstatic.com/steam/apps/${mostRecent.appid}/header.jpg`
          });
        }
        setOverviewGames(gamesWithAchievements);

        console.log("Setting overview games to: ", gamesWithAchievements);

        // Cache the results
        localStorage.setItem('cachedOverviewGames', JSON.stringify(gamesWithAchievements));
        localStorage.setItem('cacheTimestampOverviewGames', new Date().getTime().toString());

        console.log("Recent games cached: ", localStorage.getItem('cachedOverviewGames'));

        console.log("gamesWithAchievements before setting state: ", gamesWithAchievements);


      } catch (error) {
        console.error('Error fetching overview games data:', error);
        setOverviewGames([]);
        setMostRecentGame(null);
      }
    };
    fetchOverviewGames();
  }, []);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const res = await fetch(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${API_KEY}&steamids=76561198119786249`);
        const data = await res.json();
        setProfileData(data.response.players[0]);
        console.log("Profile data:", data.response.players[0]);
        console.log("profile display name:", data.response.players[0].personaname);
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };
    fetchProfileData();
  }, []);

  const fetchAchievementsForGames = async (games) => {
    console.log("Fetching achievements for games:", games);

    const cachedAchievements = localStorage.getItem('cachedAchievements');
    const cacheTimestampAchievements = localStorage.getItem('cacheTimestampAchievements');
    const now = new Date().getTime();

    if (cachedAchievements && cacheTimestampAchievements && now - parseInt(cacheTimestampAchievements) < 24 * 60 * 60 * 1000) {
      const parsedAchievements = JSON.parse(cachedAchievements);
      setAllAchievements(parsedAchievements);

      console.log("Loaded achievements from cache");
      console.log("Cached Achievements structure:",
        Array.isArray(parsedAchievements)
          ? `Array of ${parsedAchievements.length} items`
          : typeof parsedAchievements
      );
      console.log("First item in cache (if array):",
        Array.isArray(parsedAchievements) && parsedAchievements.length > 0
          ? parsedAchievements[0]
          : "N/A"
      );
      return games.map(game => ({
        ...game,
        achievements: parsedAchievements[game.appid] || []
      }));
    }



    const newAchievementsObj = { ...allAchievements };
    const gamesWithAchievements = await Promise.all(games.map(async (game) => {
      try {
        if (!newAchievementsObj[game.appid]) {
          const achievementsRes = await fetch(`http://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid=${game.appid}&key=${API_KEY}&steamid=76561198119786249`);
          const achievementsData = await achievementsRes.json();
          if (achievementsData.playerstats && achievementsData.playerstats.achievements) {
            newAchievementsObj[game.appid] = achievementsData.playerstats.achievements;
          } else {
            console.log(`No achievements found for game ${game.appid}`);
            newAchievementsObj[game.appid] = [];
          }
        }
        return {
          ...game,
          achievements: newAchievementsObj[game.appid]
        };

      } catch (error) {
        console.error(`Error fetching achievements for game ${game.appid}:`, error);
        newAchievementsObj[game.appid] = [];
        return {
          ...game,
          achievements: []
        };
      }

    }));

    console.log("gamesWithAchievements after processing: ", gamesWithAchievements);
    // Cache the results
    localStorage.setItem('cachedAchievements', JSON.stringify(newAchievementsObj));
    localStorage.setItem('cacheTimestampAchievements', new Date().getTime().toString());

    console.log("Cached Achievements: ", localStorage.getItem('cachedAchievements'));

    console.log("Achievements fetched:", newAchievementsObj);
    setAllAchievements(prevAchievements => ({ ...prevAchievements, ...newAchievementsObj }));

    return gamesWithAchievements;
  };



  async function getGamesWithDetails(gamesWithPlaytime) {
    if (!Array.isArray(gamesWithPlaytime)) {
      console.error('Expected gamesWithPlaytime to be an array, but got:', typeof gamesWithPlaytime, gamesWithPlaytime);
      return [];
    }

    const processedAppIds = new Set();
    const gamePicturesTemp = { ...gamePictures };

    const promiseArray = gamesWithPlaytime.map(async (game) => {
      if (processedAppIds.has(game.appid)) {
        console.log(`Already processed game with appid: ${game.appid}`);
        return {
          ...game,
          name: `Game ID: ${game.appid}`
        };
      }

      processedAppIds.add(game.appid);

      if (gamePicturesTemp[game.appid]) {
        return {
          ...game,
          name: game.name || `Game ID: ${game.appid}`
        };
      }

      try {
        const detailsRes = await fetch(`http://store.steampowered.com/api/appdetails?appids=${game.appid}`);
        const detailsText = await detailsRes.text();
        const detailsData = JSON.parse(detailsText);
        console.log("detailsData:", detailsData);

        if (detailsData && detailsData[game.appid] && detailsData[game.appid].success) {
          const gameData = detailsData[game.appid].data;
          if (gameData) {
            gamePicturesTemp[game.appid] = gameData.header_image;
            return {
              ...game,
              name: gameData.name
            };
          }
        }

        console.warn(`Unable to fetch details for game ${game.appid}:`, detailsText);
        return {
          ...game,
          name: game.name || `Game ID: ${game.appid}`
        };
      } catch (e) {
        console.error(`Error fetching or parsing details for game ${game.appid}:`, e);
        return {
          ...game,
          name: game.name || `Game ID: ${game.appid}`
        };
      }
    });

    console.log("gamePicturesTemp:", gamePicturesTemp);
    setGamePictures(gamePicturesTemp);
    return Promise.all(promiseArray);
  }

  const getOverviewGamesWithDetails = async (games) => {
    return Promise.all(games.map(async (game) => {
      try {
        const detailsRes = await fetch(`https://store.steampowered.com/api/appdetails?appids=${game.appid}`);
        const detailsData = await detailsRes.json();
        const gameDetails = detailsData[game.appid].data;
        return {
          ...game,
          name: gameDetails.name,
          image: gameDetails.header_image
        };
      } catch (error) {
        console.error(`Error fetching details for game ${game.appid}:`, error);
        return game;
      }
    }));
  };

  // API call to fetch the games in my steam account
  // ** Learn more about the politics of useEffect, async, await. **
  useEffect(() => {
    console.log("useEffect trigged on line 99");
    const fetchGames = async () => {
      console.log("fetchGames function called")

      const cachedGames = localStorage.getItem('cachedGames');
      const cacheTimestamp = localStorage.getItem('cacheTimestampGames');
      const now = new Date().getTime();

      // NOTE: this if statement is what is causing the high api call count. If removed the app goes back to normal.
      if (cachedGames && cacheTimestamp && now - parseInt(cacheTimestamp) < 24 * 60 * 60 * 1000) {
        const parsedGames = JSON.parse(cachedGames);
        setGames(parsedGames);


        // Set other states based on cached data
        const totalPlaytime = Math.round(parsedGames.reduce((acc, game) => acc + game.playtime_forever, 0) / 60);
        setPlaytime(totalPlaytime);

        const totalGamesPlayed = parsedGames.filter(game => game.playtime_forever > 0).length;
        setGamesPlayed(totalGamesPlayed);

        const firstTwenty = parsedGames.slice(0, 20);
        const gamesWithDetails = await getGamesWithDetails(firstTwenty);
        setGamesToDisplay(gamesWithDetails);

        console.log("Loaded games from cache");
        return;
      }


      // If no valid cache, fetch from API
      const res = await fetch(`http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${API_KEY}&steamid=76561198119786249&format=json&include_played_free_games=1`);
      const data = await res.json();
      const gamesWithPlaytime = data.response.games || [];

      // Calculate total playtime
      const totalPlaytime = Math.round(gamesWithPlaytime.reduce((acc, game) => acc + game.playtime_forever, 0) / 60);
      setPlaytime(totalPlaytime);
      console.log("Total playtime:", totalPlaytime);

      // Calculate total games played
      const totalGamesPlayed = gamesWithPlaytime.filter(game => game.playtime_forever > 0).length;
      console.log("Total games played:", totalGamesPlayed);
      setGamesPlayed(totalGamesPlayed);

      const allGamesList = data.response.games || [];
      setGames(allGamesList); // Set all games

      const firstTwenty = allGamesList.slice(0, 20);
      console.log("calling getGamesWithDetails with firstTwenty");

      const gamesWithDetails = await getGamesWithDetails(firstTwenty);
      console.log("recieved gamesWithDetails: ", gamesWithDetails);

      const gamesWithAchievements = await fetchAchievementsForGames(gamesWithDetails);
      console.log("recieved gamesWithAchievements: ", gamesWithAchievements);

      setGamesToDisplay(gamesWithAchievements);
      console.log("setGamesToDisplay set with: ", gamesWithAchievements);


      // Cache the results
      localStorage.setItem('cachedGames', JSON.stringify(allGamesList));
      localStorage.setItem('cacheTimestampGames', new Date().getTime().toString());

      console.log("Cached Games: ", localStorage.getItem('cachedGames'));

      await fetchAchievementsForGames(gamesWithDetails);
    };
    fetchGames();
  }, []);


  // Update achievements for recent games
  useEffect(() => {
    const updateRecentGamesAchievements = async () => {
      if (recentGames.length > 0) {
        const recentGamesWithDetails = await getGamesWithDetails(recentGames);
        await fetchAchievementsForGames(recentGamesWithDetails);
        setRecentGames([...recentGamesWithDetails]);
      }
    };
    updateRecentGamesAchievements();
  }, []);

  useEffect(() => {
    const gamesWithoutAchievements = gamesToDisplay.filter(game => !allAchievements[game.appid]);
    if (gamesWithoutAchievements.length > 0) {
      fetchAchievementsForGames(gamesWithoutAchievements);
    }
  }, []);

  const handleLoadMore = async () => {
    console.log("Total games:", games.length);
    console.log("Load more games button clicked");

    const currentLength = gamesToDisplay.length;
    const newGames = games.slice(currentLength, currentLength + 20);

    // Fetch details for the new games
    const newGamesWithDetails = await getGamesWithDetails(newGames);
    console.log("New games with details:", JSON.stringify(newGamesWithDetails));

    const newGamesWithAchievements = await fetchAchievementsForGames(newGamesWithDetails);
    console.log("New games with achievements:", JSON.stringify(newGamesWithAchievements));

    setGamesToDisplay(prevGames => [...prevGames, ...newGamesWithAchievements]);
    console.log("Games to display updated:", JSON.stringify(gamesToDisplay));

    // Update allAchievements state with new achievements
    setAllAchievements(prevAchievements => {
      const updatedAchievements = { ...prevAchievements };
      newGamesWithAchievements.forEach(game => {
        if (game.achievements) {
          updatedAchievements[game.appid] = game.achievements;
        }
      });
      return updatedAchievements;
    });

    // Update localStorage cache
    const updatedCache = JSON.parse(localStorage.getItem('cachedAchievements') || '{}');
    newGamesWithAchievements.forEach(game => {
      if (game.achievements) {
        updatedCache[game.appid] = game.achievements;
      }
    });
    localStorage.setItem('cachedAchievements', JSON.stringify(updatedCache));
    localStorage.setItem('cacheTimestampAchievements', new Date().getTime().toString());
  

  // Filter out games that already have achievements cached
  const gamesWithoutAchievements = newGamesWithDetails.filter(game => !allAchievements[game.appid]);

  if (gamesWithoutAchievements.length > 0) {
    await fetchAchievementsForGames(gamesWithoutAchievements);
  }
};

// API call to grab all my achievements for all games
useEffect(() => {
  const fetchAchievementsForAllGames = async () => {

    // Check if cached data exists and is less than 24 hours old
    // and sets the data to setGames
    const cachedAchievements = localStorage.getItem('cachedAllAchievements');
    const cacheTimestampAchievements = localStorage.getItem('cacheTimestampAllAchievements');

    if (cachedAchievements && cacheTimestampAchievements) {
      const now = new Date().getTime();
      if (now - parseInt(cacheTimestampAchievements) < 24 * 60 * 60 * 1000) {
        setAllAchievements(JSON.parse(cachedAchievements));
        return;
      }
    }
    const achievements = await fetchAchievementsForGames(games);
    setAllAchievements(achievements);

    // Cache the results
    localStorage.setItem('cachedAllAchievements', JSON.stringify(achievements));
    localStorage.setItem('cacheTimestampAllAchievements', new Date().getTime().toString());
  };


  if (games.length > 0) {
    fetchAchievementsForAllGames();
  }

}, []);

return {
  games,
  gamesToDisplay,
  allAchievements,
  profileData,
  playtime,
  gamesPlayed,
  gamePictures,
  overviewGames,
  recentGames,
  handleLoadMore,
  mostRecentGame
}; // returning the arrays and functions to be used on import to another component
};
