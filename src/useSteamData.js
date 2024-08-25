import { useState, useEffect } from 'react';

// Grabbing my stored api key from .env NOTE: vite requires "VITE_" in front of variables stored in .env
const API_KEY = import.meta.env.VITE_STEAM_API_KEY;


export const useSteamData = () => {
  // use states to store and update data
  const [games, setGames] = useState([]);
  const [allAchievements, setAllAchievements] = useState({});
  const [gamesToDisplay, setGamesToDisplay] = useState([]);

  const fetchAchievementsForGames = async (gamesToFetch) => { // new function to fetch achievements for games
    const newAchievements = { ...allAchievements }; // copy the existing array and putting it in a new one

    for (const game of gamesToFetch) { // loop through the games in gamesToFetch
      if (!newAchievements[game.appid]) { // if the game is not in the array
        try { // try fetching achievements for the game with game.appid
          const res = await fetch(`http://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid=${game.appid}&key=${API_KEY}&steamid=76561198119786249`);
          const data = await res.json();
          newAchievements[game.appid] = data.playerstats.achievements || []; // adds the achievement data from the api call to the newAchievements array
        } catch (error) { // error calling
          console.error(`Error fetching achievements for game ${game.appid}:`, error);
          newAchievements[game.appid] = [];
        }
      }
    }

    setAllAchievements(newAchievements); // update the achievements array to the new results

    // Update localStorage
    localStorage.setItem('cachedAchievements', JSON.stringify(newAchievements));
    localStorage.setItem('cacheTimestampAchievements', new Date().getTime().toString());
  };



  // API call to fetch the games in my steam account
  // ** Learn more about the politics of useEffect, async, await. **
  useEffect(() => {
    const fetchGames = async () => {
      // Check if cached data exists and is less than 24 hours old
      // and sets the data to setGames
      const cachedGames = localStorage.getItem('cachedGames');
      const cacheTimestampGames = localStorage.getItem('cacheTimestampGames');

      if (cachedGames && cacheTimestampGames) {
        const now = new Date().getTime();
        if (now - parseInt(cacheTimestampGames) < 24 * 60 * 60 * 1000) {
          const parsedGames = JSON.parse(cachedGames);
          setGames(parsedGames);
          setGamesToDisplay(parsedGames.slice(0, 20));
          return;
        }
      }

      // If no valid cache, fetch from API
      const res = await fetch(`http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${API_KEY}&steamid=76561198119786249&format=json&include_played_free_games=1`);
      const data = await res.json();
      const gamesWithPlaytime = data.response.games || [];

      // Promise.all is a method that takes an array of promises and waits for all of them to resolve and
      // returns a single promise
      // Map is used to iterate over all games in the array
      // Transforms it into a new array of promises, each promise represents an asyncronous operation 
      // to fetch additional details for the game


      // await waits for the fetch request to complete and for the response to be available
      const gamesWithDetails = await Promise.all(gamesWithPlaytime.map(async (game) => { // map over the gamesWithPlaytime array
        try {
          const detailsRes = await fetch(`http://store.steampowered.com/api/appdetails?appids=${game.appid}`);
          const detailsText = await detailsRes.text(); // get the text from the response
          const detailsData = JSON.parse(detailsText); // convert the text to JSON
          console.log(detailsText);
          if (detailsData && detailsData[game.appid] && detailsData[game.appid].success) { // if the data exists and is successful
            return { // return the game with the name from the data
              ...game,
              name: detailsData[game.appid].data.name // set the name of the game to the name from the data
            };
          } else {
            console.warn(`Unable to fetch details for game ${game.appid}:`, detailsText);
            return {
              ...game,
              name: `Game ID: ${game.appid}` // if the data is not successful, set the name to the gameid instead
            };
          }
        } catch (e) {
          console.error(`Error fetching or parsing details for game ${game.appid}:`, e);
          return {
            ...game,
            name: `Game ID: ${game.appid}`
          };
        }
      }));
      setGames(gamesWithDetails);
      setGamesToDisplay(gamesWithDetails.slice(0, 20));
      // Cache the results
      localStorage.setItem('cachedGames', JSON.stringify(gamesWithDetails));
      localStorage.setItem('cacheTimestampGames', new Date().getTime().toString());


      await fetchAchievementsForGames(gamesWithDetails.slice(0, 20)); // fetching achievements for each game displayed and waiting for it to complete
    };
    fetchGames();
  }, []);

  useEffect(() => {
    const gamesWithoutAchievements = gamesToDisplay.filter(game => !allAchievements[game.appid]);
    if (gamesWithoutAchievements.length > 0) {
      fetchAchievementsForGames(gamesWithoutAchievements);
    }
  }, []);

  const handleLoadMore = async () => { // function to handle the load more button
    console.log("Load more games button clicked");
    const currentLength = gamesToDisplay.length; // get the current length of the gamesToDisplay array
    const newGames = games.slice(currentLength, currentLength + 20); // get the next 20 games from the games array and putting it in a new array
    setGamesToDisplay(prevGames => [...prevGames, ...newGames]); // add the new games to the gamesToDisplay array | prevGames is the previous state of the gamesToDisplay array
    // spreading the previous games and adding the new games to the end of the array

    // Filter out games that already have achievements cached
    const gamesWithoutAchievements = newGames.filter(game => !allAchievements[game.appid]);

    if (gamesWithoutAchievements.length > 0) {
      const newAchievements = await fetchAchievementsForGames(gamesWithoutAchievements);

      // Update the achievements state and cache
      setAllAchievements(prevAchievements => {
        const updatedAchievements = { ...prevAchievements, ...newAchievements };
        localStorage.setItem('cachedAchievements', JSON.stringify(updatedAchievements));
        return updatedAchievements;
      });
    }
  };

  // API call to grab all my achievements for all games
  useEffect(() => {
    const fetchAchievementsForAllGames = async () => {

      // Check if cached data exists and is less than 24 hours old
      // and sets the data to setGames
      const cachedAchievements = localStorage.getItem('cachedAchievements');
      const cacheTimestampAchievements = localStorage.getItem('cacheTimestampAchievements');

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
      localStorage.setItem('cachedAchievements', JSON.stringify(achievements));
      localStorage.setItem('cacheTimestampAchievements', new Date().getTime().toString());
    };


    if (games.length > 0) {
      fetchAchievementsForAllGames();
    }


  }, []);
  return { gamesToDisplay, allAchievements, handleLoadMore }; // returning the arrays and functions to be used on import to another component
};
