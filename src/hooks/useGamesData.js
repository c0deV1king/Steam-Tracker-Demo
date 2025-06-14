import { useState, useEffect, useCallback } from "react";
import { fetchAchievementsForGames } from "../utils/fetchAchievementsForGames";
import { delayedFetch } from "../utils/rateLimitingAPI";
import { storeData, getAllData } from "../utils/indexedDB";
import fallbackImage from "../img/capsule404.png";

export function useGamesData(steamId, isAuthenticated) {
  const [games, setGames] = useState([]);
  const [gamesToDisplay, setGamesToDisplay] = useState([]);
  const [allAchievements, setAllAchievements] = useState([]);
  const [recentGames, setRecentGames] = useState([]);
  const [mostRecentGame, setMostRecentGame] = useState(null);
  const [playtime, setPlaytime] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [gamePictures, setGamePictures] = useState({});
  const [overviewGames, setOverviewGames] = useState([]);
  const [overviewAchievements, setOverviewAchievements] = useState({});
  const [isSyncing, setIsSyncing] = useState(false);
  const [isFullySynced, setIsFullySynced] = useState(() => {
    const stored = localStorage.getItem("isFullySynced");
    return stored === "true";
  });
  const [isAchievementsSynced, setIsAchievementsSynced] = useState(() => {
    const stored = localStorage.getItem("isAchievementsSynced");
    return stored === "true";
  });
  const [recentAchievements, setRecentAchievements] = useState([]);
  const [allGamesList, setAllGamesList] = useState([]);
  const [mostPlayedGame, setMostPlayedGame] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Update localStorage when isFullySynced changes
  useEffect(() => {
    localStorage.setItem("isFullySynced", isFullySynced.toString());
  }, [isFullySynced]);

  // Update localStorage when isAchievementsSynced changes
  useEffect(() => {
    localStorage.setItem(
      "isAchievementsSynced",
      isAchievementsSynced.toString()
    );
  }, [isAchievementsSynced]);

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchStoredRecentGames = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No auth token found");
        }
        const response = await fetch(`${apiUrl}/api/recentgames/${steamId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched recent games data:", data);
        if (data) {
          setOverviewGames(data);
        } else {
          console.error("No recentGames found in response:", data);
        }
      } catch (error) {
        console.error("Error fetching recent games:", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (isAuthenticated && steamId) {
      fetchStoredRecentGames();
    }
  }, [steamId, apiUrl, isAuthenticated]);

  // Fetch recent games data from backend.
  // Originally, this also grabbed screenshots and achievements for the dashboard.
  // Now, it is grabbing the recentgames data for display.
  // Later, i'll have screenshots to grab for the banner.
  const fetchOverviewGames = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No auth token found");
      }
      const response = await fetch(
        `${apiUrl}/api/recentgames/update/${steamId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Fetched recent games data:", data);
      if (data.recentGames) {
        setOverviewGames(data.recentGames);
      } else {
        console.error("No recentGames found in response:", data);
      }
    } catch (error) {
      console.error("Error fetching recent games:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // fetches all the owned games from the steam user as well as some additional data (playtime, ect)
  useEffect(() => {
    const fetchGames = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No auth token found");
        }
        const response = await fetch(`${apiUrl}/api/games/${steamId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched all owned games data:", data);
        if (!data || !Array.isArray(data)) {
          console.error("Unexpected response format:", data);
          throw new Error("Invalid response format: games array not found");
        }
        setAllGamesList(data);

        // Calculate total playtime and games played
        const totalPlaytime = Math.round(
          data.reduce((acc, game) => acc + game.playtime_forever, 0) / 60
        );
        setPlaytime(totalPlaytime);
        const totalGamesPlayed = data.filter(
          (game) => game.playtime_forever > 0
        ).length;
        setGamesPlayed(totalGamesPlayed);

        setGamesToDisplay(data);
      } catch (error) {
        console.error("Error fetching owned games:", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (isAuthenticated && steamId) {
      fetchGames();
    }
  }, [isAuthenticated, steamId]);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No auth token found");
        }
        console.log(
          `Fetching achievements from: ${apiUrl}/api/achievements/${steamId}`
        );

        const response = await fetch(`${apiUrl}/api/achievements/${steamId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`API returned status ${response.status}: ${errorText}`);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Achievements API response:", data);

        if (data && Array.isArray(data) && data.length > 0) {
          console.log("Fetched all achievement data:", data);
          setAllAchievements(data);
          const achievedList = data.filter(
            (achievement) =>
              achievement &&
              achievement.achieved === 1 &&
              achievement.unlocktime
          );
          const sortedAchievements = achievedList.sort(
            (a, b) => b.unlocktime - a.unlocktime
          );
          const recent = sortedAchievements.slice(0, 10);
          setRecentAchievements(recent);
        } else {
          console.log("No achievements found in the database.");
          setAllAchievements([]);
          setRecentAchievements([]);
        }
      } catch (error) {
        console.error("Error fetching achievements:", error);
        setAllAchievements([]);
        setRecentAchievements([]);
      } finally {
        setIsLoading(false);
      }
    };
    if (isAuthenticated && steamId) {
      fetchAchievements();
    }
  }, [isAuthenticated, steamId, apiUrl]);

  const syncAllData = useCallback(async () => {
    if (isAuthenticated && steamId) {
      setIsSyncing(true);
      setIsFullySynced(false);
      setIsLoading(true);

      console.time("Syncing all data");
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No auth token found");
        }
        console.log("Syncing all data for Steam ID:", steamId);
        console.log("fetching games data...");
        console.time("Fetching games data");
        const gamesResponse = await fetch(
          `${apiUrl}/api/games/update/${steamId}`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!gamesResponse.ok) {
          throw new Error(`HTTP error! status: ${gamesResponse.status}`);
        }
        const gamesData = await gamesResponse.json();
        console.log("Fetched all owned games data:", gamesData);

        if (!gamesData.games || !Array.isArray(gamesData.games)) {
          throw new Error(
            "Unexpected response format: gamesData.games is not an array"
          );
        }

        const gamesArray = gamesData.games;

        setAllGamesList(gamesData.games);

        // Calculate total playtime and games played
        console.log("Calculating total playtime and games played...");
        const totalPlaytime = Math.round(
          gamesArray.reduce((acc, game) => acc + game.playtime_forever, 0) / 60
        );
        setPlaytime(totalPlaytime);
        const totalGamesPlayed = gamesArray.filter(
          (game) => game.playtime_forever > 0
        ).length;
        setGamesPlayed(totalGamesPlayed);
        console.log("Gathered playtime and games played data.");

        setGamesToDisplay(gamesArray);
        console.log("Displayed games updated.");
        console.timeEnd("Fetching games data");

        setIsFullySynced(true);
        localStorage.setItem("isFullySynced", "true");
      } catch (error) {
        console.error("Failed to sync all data:", error);
      } finally {
        console.timeEnd("Syncing all data");
        setIsSyncing(false);
        setIsLoading(false);
      }
    }
  }, [isAuthenticated, steamId, gamesToDisplay]);

  const syncAllAchievements = useCallback(async () => {
    if (isAuthenticated && steamId) {
      setIsSyncing(true);
      setIsAchievementsSynced(false);
      setIsLoading(true);
      // Fetch achievements for all games
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No auth token found");
        }
        console.log(
          "Fetching achievements for all games... this will take a while."
        );
        console.time("Fetching achievements data");
        const achievementsResponse = await fetch(
          `${apiUrl}/api/achievements/update/${steamId}`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!achievementsResponse.ok) {
          throw new Error(`HTTP error! status: ${achievementsResponse.status}`);
        }
        const achievementData = await achievementsResponse.json();

        if (achievementData && achievementData.length > 0) {
          console.log("Fetched all achievement data:", achievementData);
          setAllAchievements(achievementData);
          console.timeEnd("Fetching achievements data");
        } else {
          console.log("No achievements found");
        }
        setIsFullySynced(true);
        localStorage.setItem("isFullySynced", "true");
      } catch (error) {
        console.error("Failed to sync all achievement data:", error);
      } finally {
        setIsSyncing(false);
        setIsLoading(false);
      }
    }
  }, [isAuthenticated, steamId]);

  // sync individual game data achievements
  const syncIndividualGameAchievements = useCallback(
    async (appid) => {
      if (isAuthenticated && steamId) {
        setIsSyncing(true);
        setIsLoading(true);
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            throw new Error("No auth token found");
          }

          // Make sure appid is a string or number, not an object
          const gameId = typeof appid === "object" ? appid.appid : appid;

          console.log(`Syncing achievements for game ${gameId}...`);
          const response = await fetch(
            `${apiUrl}/api/achievements/update/${steamId}/appid/${gameId}`,
            {
              method: "PATCH",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          console.log("Fetched game achievement data:", data);

          // Update the allAchievements state with the new data
          setAllAchievements((prevAchievements) => {
            // Check if prevAchievements is an array
            // Ensure prevAchievements is an array
            const achievementsArray = Array.isArray(prevAchievements)
              ? prevAchievements
              : [];

            // Remove any existing achievements for this game by appid property
            const filteredAchievements = prevAchievements.filter(
              (achievement) => achievement.appid !== Number(gameId)
            );

            // Process the new achievements data
            let gameAchievements = [];
            if (data.achievements && Array.isArray(data.achievements)) {
              gameAchievements = data.achievements;
            } else if (Array.isArray(data)) {
              gameAchievements = data;
            } else if (typeof data === "object" && data !== null) {
              gameAchievements = [data];
            }

            const newAchievements = [
              ...filteredAchievements,
              ...gameAchievements,
            ];

            // Process recent achievements directly here
            const achievedList = newAchievements.filter(
              (achievement) =>
                achievement &&
                achievement.achieved === 1 &&
                achievement.unlocktime
            );
            const sortedAchievements = achievedList.sort(
              (a, b) => b.unlocktime - a.unlocktime
            );
            const recent = sortedAchievements.slice(0, 10);
            setRecentAchievements(recent);

            return newAchievements;
          });
        } catch (error) {
          console.error("Failed to sync game achievements:", error);
        } finally {
          setIsSyncing(false);
          setIsLoading(false);
        }
      }
    },
    [isAuthenticated, steamId, apiUrl, setAllAchievements]
  );
  const handleImageError = (e, appId) => {
    // Set a default/fallback image
    e.target.src = fallbackImage;
    console.log(`Failed to load image for app ${appId}`);
  };

  const syncIndividualGameData = useCallback(
    async (appid) => {
      if (isAuthenticated && steamId) {
        setIsSyncing(true);
        setIsLoading(true);
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            throw new Error("No auth token found");
          }

          const gameId = typeof appid === "object" ? appid.appid : appid;

          console.log(`Syncing extra data for game ${gameId}...`);
          const response = await fetch(
            `${apiUrl}/api/games/update/${gameId}/${steamId}`,
            {
              method: "PATCH",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          console.log("Fetched extra game data:", data);
          const gameResponse = await fetch(`${apiUrl}/api/games/${steamId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (gameResponse.ok) {
            const gamesData = await gameResponse.json();
            const updatedGame = gamesData.find(
              (game) => game.appid === Number(gameId)
            );

            if (updatedGame) {
              setAllGamesList((prevGames) => {
                return prevGames.map((game) => {
                  if (game.appid === Number(gameId)) {
                    return updatedGame;
                  }
                  return game;
                });
              });

              setGamesToDisplay((prevGames) => {
                return prevGames.map((game) => {
                  if (game.appid === Number(gameId)) {
                    return updatedGame;
                  }
                  return game;
                });
              });
            }
          }

          console.log(`Extra data synced successfully for game ${gameId}`);
        } catch (error) {
          console.error("Failed to sync extra game data:", error);
        } finally {
          setIsSyncing(false);
          setIsLoading(false);
        }
      }
    },
    [isAuthenticated, steamId, apiUrl]
  );

  // return functions and states to useSteamData
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
    isSyncing,
    isFullySynced,
    isAchievementsSynced,
    syncAllData,
    syncAllAchievements,
    recentAchievements,
    mostPlayedGame,
    isAuthenticated,
    steamId,
    isLoading,
    setIsLoading,
    syncIndividualGameAchievements,
    syncIndividualGameData,
    handleImageError,
  };
}
