import { useGamesData } from './useGamesData'
import { useProfileData } from './useProfileData'
import { fetchAchievementsForGames } from '../utils/fetchAchievementsForGames'
import { useEffect, useState } from 'react';
// Grabbing my stored api key from .env NOTE: vite requires "VITE_" in front of variables stored in .env

// NOTES FOR MYSELF

// After doing the auth, I realise that I need to have a specific hook for all api calls to easily manage the keys and steam ids.

// bio/app showcase: have a popup when the user first opens the app and authenticates and has a showcase video of the app, along with a bio about me.

// focus architecture, undetrstanding that is the most important in problem solving and can work through it better.
// learning to help users/community is the best way to learn. learning to learn < learning to create things for others and the benifit of the project.
// it will get frustrating, but push through it becuse it'll get better.
// learn to embrace ai and that its here to stay. work with it, not against it. (Unless your an artist)

// Plans to add to the app:
// A game page for each individual game that shows additional details for that game, including the achievements, achievement images ect. (allow user to click on the game from any tab, games or overview)
// Trophy Case
// Get recent achievements for the overview tab (requires full sync)

// highest impact first when deciding what to build/fix next
// create a bio in app (who i am and the project)
// video explaining the app.

  // add a loading state to any calls. (bonus for adding a little minigame while the user waits)


export const useSteamData = () => {

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [steamId, setSteamId] = useState(null);

  useEffect(() => {
    const storedSteamId = localStorage.getItem('steamId');
    
    if (storedSteamId) {
      setSteamId(storedSteamId);
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);
  // transferring code to be used in App.jsx
  const {
    profileData
  } = useProfileData(steamId, isAuthenticated)

  const {
    gamesWithAchievements
  } = fetchAchievementsForGames(steamId, isAuthenticated)

  const { 
    games,
    gamesToDisplay,
    allAchievements,
    setAllAchievements,
    playtime,
    gamesPlayed,
    gamePictures,
    overviewGames,
    recentGames,
    handleLoadMore,
    mostRecentGame,
    testSchema,
    isSyncing,
    isFullySynced,
    syncAllData,
    recentAchievements = [],
    mostPlayedGame,
    allGamesList

  } = useGamesData(steamId, isAuthenticated) || {};

  return {
    games,
    gamesToDisplay,
    allAchievements,
    setAllAchievements,
    playtime,
    gamesPlayed,
    gamePictures,
    overviewGames,
    recentGames,
    handleLoadMore,
    mostRecentGame,
    testSchema,
    profileData,
    isSyncing,
    isFullySynced,
    syncAllData,
    recentAchievements,
    mostPlayedGame,
    isAuthenticated,
    steamId,
    gamesWithAchievements,
    allGamesList
  }; // returning the arrays and functions to be used in App.jsx
};
