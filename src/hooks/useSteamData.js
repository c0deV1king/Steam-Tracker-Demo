import { useGamesData } from './useGamesData'
import { useProfileData } from './useProfileData'
import { fetchAchievementsForGames } from '../utils/fetchAchievementsForGames'
import { useEffect, useState } from 'react';



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
