import { useGamesData } from "./useGamesData";
import { useProfileData } from "./useProfileData";
import { fetchAchievementsForGames } from "../utils/fetchAchievementsForGames";
import { useEffect, useState } from "react";

export const useSteamData = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [steamId, setSteamId] = useState(null);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    const storedSteamId = localStorage.getItem("steamId");
    const storedIsDemo = localStorage.getItem("isDemo") === "true";

    if (storedSteamId) {
      setSteamId(storedSteamId);
      setIsAuthenticated(true);
    } else if (storedIsDemo) {
      setIsDemo(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const setIsAuthenticatedAndSave = (value) => {
    setIsAuthenticated(value);
    if (!value) {
      localStorage.removeItem("steamId");
    }
  };

  const setIsDemoAndSave = (value) => {
    setIsDemo(value);
    localStorage.setItem("isDemo", value);
    if (value) {
      localStorage.removeItem("steamId");
      setIsAuthenticated(false);
    } else {
      localStorage.removeItem("isDemo");
    }
  };

  // transferring code to be used in App.jsx
  const { profileData } = useProfileData(steamId, isAuthenticated, isDemo);

  const { gamesWithAchievements } = fetchAchievementsForGames(
    steamId,
    isAuthenticated
  );

  const {
    games,
    gamesToDisplay,
    allAchievements,
    setAllAchievements,
    playtime,
    gamesPlayed,
    gamePictures,
    overviewGames,
    fetchOverviewGames,
    recentGames,
    mostRecentGame,
    testSchema,
    isSyncing,
    isFullySynced,
    isAchievementsSynced,
    syncAllData,
    syncAllAchievements,
    recentAchievements = [],
    mostPlayedGame,
    allGamesList,
    isLoading,
    setIsLoading,
    syncIndividualGameAchievements,
    handleImageError,
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
    fetchOverviewGames,
    recentGames,
    mostRecentGame,
    testSchema,
    profileData,
    isSyncing,
    isFullySynced,
    isAchievementsSynced,
    syncAllData,
    syncAllAchievements,
    recentAchievements,
    mostPlayedGame,
    isAuthenticated,
    steamId,
    gamesWithAchievements,
    allGamesList,
    isDemo,
    setIsDemo: setIsDemoAndSave,
    setIsAuthenticated: setIsAuthenticatedAndSave,
    isLoading,
    setIsLoading,
    syncIndividualGameAchievements,
    handleImageError,
  }; // returning the arrays and functions to be used in App.jsx
};
