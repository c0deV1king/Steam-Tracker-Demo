import { useState, useEffect } from 'react';
import { useGamesData } from './useGamesData'
import { fetchAchievementsForGames } from '../utils/fetchAchievementsForGames';

// focus architecture, undetrstanding that is the most important in problem solving and can work through it better.
// learning to help users/community is the best way to learn. learning to learn < learning to create things for others and the benifit of the project.
// it will get frustrating, but push through it becuse it'll get better.
// learn to embrace ai and that its here to stay. work with it, not against it. (Unless your an artist)

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
  const { 
    games,
    gamesToDisplay,
    playtime,
    gamesPlayed,
    gamePictures,
    overviewGames,
    recentGames,
    handleLoadMore,
    mostRecentGame
  } = useGamesData(API_KEY);

  // use states to store and update data

  const [profileData, setProfileData] = useState({});


  // Fix bugs, set up the overview tab to display only what is needed on refresh. Update the state when the user switches tabs to the games tab
  // add a loading state to any calls. (bonus for adding a little minigame while the user waits)


 

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

 



  

  // API call to fetch the games in my steam account
  // ** Learn more about the politics of useEffect, async, await. **








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
    mostRecentGame,
  }; // returning the arrays and functions to be used on import to another component
};