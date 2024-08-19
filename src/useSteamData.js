import { useState, useEffect } from 'react';

// Grabbing my stored api key from .env NOTE: vite requires "VITE_" in front of variables stored in .env
const API_KEY = import.meta.env.VITE_STEAM_API_KEY;


export const useSteamData = () => {
  // use states to store and update data
  const [games, setGames] = useState([]);
  const [allAchievements, setAllAchievements] = useState({});




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
          setGames(JSON.parse(cachedGames));
          return;
        }
      }

      // If no valid cache, fetch from API
      const res = await fetch(`http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${API_KEY}&steamid=76561198119786249&format=json&include_played_free_games=1`);
      const data = await res.json();
      const gamesWithPlaytime = data.response.games || [];
      const cutGames = gamesWithPlaytime.slice(0, 20);
      // Promise.all is a method that takes an array of promises and waits for all of them to resolve and
      // returns a single promise
      // Map is used to iterate over all games in the array
      // Transforms it into a new array of promises, each promise represents an asyncronous operation 
      // to fetch additional details for the game

      // await waits for the fetch request to complete and for the response to be available
      const gamesWithDetails = await Promise.all(cutGames.map(async (game) => {
        try {
          const detailsRes = await fetch(`http://store.steampowered.com/api/appdetails?appids=${game.appid}`);
          const detailsText = await detailsRes.text();
          const detailsData = JSON.parse(detailsText);

          if (detailsData && detailsData[game.appid] && detailsData[game.appid].success) {
            return {
              ...game,
              name: detailsData[game.appid].data.name
            };
          } else {
            console.warn(`Unable to fetch details for game ${game.appid}:`, detailsText);
            return {
              ...game,
              name: `Game ID: ${game.appid}`
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

      // Cache the results
      localStorage.setItem('cachedGames', JSON.stringify(gamesWithDetails));
      localStorage.setItem('cacheTimestampGames', new Date().getTime().toString());

      setGames(cutGames);
    };

    fetchGames();
  }, []);
  // API call to grab all my achievements for all games
  useEffect(() => {
    const fetchAchievementsForAllGames = async () => {
      const achievements = {};

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

      const cutGames = games.slice(0, 20);

      // for of loop, this is going over the array of objects to check each games appid and calls another fetch request for each appid
      // it then returns the separate achievement api call
      for (const game of cutGames) {
        const res = await fetch(`http://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid=${game.appid}&key=${API_KEY}&steamid=76561198119786249`);
        const data = await res.json();
        achievements[game.appid] = data.playerstats.achievements || [];
      }

      // Cache the results
      localStorage.setItem('cachedAchievements', JSON.stringify(achievements));
      localStorage.setItem('cacheTimestampAchievements', new Date().getTime().toString());

      setAllAchievements(achievements);
    };

    if (games.length > 0) {
      fetchAchievementsForAllGames();
    }


  }, [games]);

  return { games, allAchievements };
};
