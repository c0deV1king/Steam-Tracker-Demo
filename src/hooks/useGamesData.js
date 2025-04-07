import { useState, useEffect, useCallback } from "react";
import { fetchAchievementsForGames } from "../utils/fetchAchievementsForGames";
import { delayedFetch } from "../utils/rateLimitingAPI";
import { storeData, getAllData } from "../utils/indexedDB";

export function useGamesData(steamId, isAuthenticated) {
  const [games, setGames] = useState([]);
  const [gamesToDisplay, setGamesToDisplay] = useState([]);
  const [allAchievements, setAllAchievements] = useState({});
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
  const [recentAchievements, setRecentAchievements] = useState([]);
  const [allGamesList, setAllGamesList] = useState([]);
  const [mostPlayedGame, setMostPlayedGame] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Update localStorage when isFullySynced changes
  useEffect(() => {
    localStorage.setItem("isFullySynced", isFullySynced.toString());
  }, [isFullySynced]);

  // Fetch recent games data from backend.
  // Originally, this also grabbed screenshots and achievements for the dashboard.
  // Now, it is grabbing the recentgames data for display.
  // Later, i'll have screenshots to grab for the banner.
  useEffect(() => {
    const fetchOverviewGames = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/recentgames/${steamId}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched recent games data:", data);
        setOverviewGames(data);
      } catch (error) {
        console.error("Error fetching recent games:", error);
      }
    };

    if (isAuthenticated && steamId) {
      fetchOverviewGames();
    }
  }, [isAuthenticated, steamId]);

  // check to see the updated recent games state
  useEffect(() => {
    if (overviewGames.length > 0) {
      console.log("Recent games state updated:", overviewGames);
    }
  }, [overviewGames]);

  // fetches all the owned games from the steam user as well as some additional data (playtime, ect)
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/games/${steamId}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched recent games data:", data);
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

        const firstTwenty = data.slice(0, 20);
        setGamesToDisplay(firstTwenty);
      } catch (error) {
        console.error("Error fetching recent games:", error);
      }
    };
    if (isAuthenticated && steamId) {
      fetchGames();
    }
  }, [isAuthenticated, steamId]);

  useEffect(() => {
    if (allGamesList.length > 0) {
      console.log("Recent games state updated:", allGamesList);
    }
  }, [allGamesList]);

  const getGamesWithDetails = async (games) => {
    const cachedDetails = JSON.parse(
      localStorage.getItem("cachedGameDetails") || "{}"
    );
    const now = new Date().getTime();

    const gamesNeedingDetails = games.filter(
      (game) =>
        !cachedDetails[game.appid] ||
        now - cachedDetails[game.appid].timestamp >= 12 * 60 * 60 * 1000
    );

    if (gamesNeedingDetails.length === 0) {
      return games.map((game) => ({
        ...game,
        ...(cachedDetails[game.appid] ? cachedDetails[game.appid].data : {}),
      }));
    }

    const newDetails = [];

    if (isAuthenticated && steamId) {
      for (const game of gamesNeedingDetails) {
        try {
          const detailsRes = await delayedFetch(
            `/.netlify/functions/getAppDetails/?appid=${game.appid}`
          );
          const detailsData = await detailsRes.json();

          if (detailsData[game.appid].success) {
            const gameDetails = detailsData[game.appid].data;
            newDetails.push({
              appid: game.appid,
              data: {
                name: gameDetails.name,
                image: gameDetails.header_image,
                genres: gameDetails.genres,
                developers: gameDetails.developers,
                metacritic: gameDetails.metacritic,
                type: gameDetails.type,
              },
              timestamp: now,
            });
          }
        } catch (error) {
          console.error(
            `Error fetching details for game ${game.appid}:`,
            error
          );
        }
      }
    }

    // Update cache and return updated games
    const updatedCache = { ...cachedDetails };
    newDetails.forEach((detail) => {
      if (detail) {
        updatedCache[detail.appid] = {
          data: detail.data,
          timestamp: detail.timestamp,
        };
      }
    });
    localStorage.setItem("cachedGameDetails", JSON.stringify(updatedCache));

    return games.map((game) => ({
      ...game,
      ...(updatedCache[game.appid] ? updatedCache[game.appid].data : {}),
    }));
  };

  useEffect(() => {
    if (isAuthenticated && steamId) {
      const updateMostPlayedGame = async () => {
        if (games.length > 0) {
          const highestPlayedGame = games.reduce(
            (max, game) =>
              game.playtime_forever > max.playtime_forever ? game : max,
            games[0]
          );

          // Fetch details for the most played game if not already available
          if (!highestPlayedGame.name || !highestPlayedGame.image) {
            const gamesWithDetails = await getGamesWithDetails([
              highestPlayedGame,
            ]);
            if (gamesWithDetails.length > 0) {
              setMostPlayedGame(gamesWithDetails[0]);
            }
          } else {
            setMostPlayedGame(highestPlayedGame);
          }
        }
      };

      updateMostPlayedGame();
    }
  }, [isAuthenticated, steamId, games]);

  const handleLoadMore = useCallback(async () => {
    if (isAuthenticated && steamId) {
      setIsLoading(true);
      try {
        const currentLength = gamesToDisplay.length;
        const newGames = games.slice(currentLength, currentLength + 20);

        const gamesWithDetails = await getGamesWithDetails(newGames);

        // Check if we have cached achievements
        const cachedGamesAchievements = localStorage.getItem(
          "cachedGamesAchievements"
        );
        let cachedAchievementsObj = {};
        if (cachedGamesAchievements) {
          cachedAchievementsObj = JSON.parse(cachedGamesAchievements);
        }

        const gamesWithAchievements = gamesWithDetails.map((game) => {
          if (cachedAchievementsObj[game.appid]) {
            return {
              ...game,
              achievements: cachedAchievementsObj[game.appid],
            };
          }
          return game;
        });

        // Only fetch achievements for games that don't have cached achievements
        const gamesNeedingAchievements = gamesWithAchievements.filter(
          (game) => !game.achievements
        );
        if (gamesNeedingAchievements.length > 0) {
          const newAchievements = await fetchAchievementsForGames(
            gamesNeedingAchievements,
            "cachedGamesAchievements",
            steamId,
            isAuthenticated
          );
          newAchievements.forEach((game) => {
            const index = gamesWithAchievements.findIndex(
              (g) => g.appid === game.appid
            );
            if (index !== -1) {
              gamesWithAchievements[index] = game;
            }
          });
        }

        setGamesToDisplay((prevGames) => [
          ...prevGames,
          ...gamesWithAchievements,
        ]);

        // Update allAchievements state
        setAllAchievements((prevAchievements) => {
          const updatedAchievements = { ...prevAchievements };
          gamesWithAchievements.forEach((game) => {
            if (game.achievements) {
              updatedAchievements[game.appid] = game.achievements;
            }
          });
          return updatedAchievements;
        });

        // Update gamePictures state
        setGamePictures((prevPictures) => {
          const updatedPictures = { ...prevPictures };
          gamesWithAchievements.forEach((game) => {
            if (game.image) {
              updatedPictures[game.appid] = game.image;
            }
          });
          return updatedPictures;
        });
      } catch (error) {
        console.error("Error loading more games:", error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [isAuthenticated, steamId, games, gamesToDisplay, getGamesWithDetails]);

  // Update achievements for recent games
  useEffect(() => {
    if (isAuthenticated && steamId) {
      const updateRecentGamesAchievements = async () => {
        if (recentGames.length > 0) {
          const recentGamesWithDetails = await getGamesWithDetails(recentGames);
          await fetchAchievementsForGames(
            recentGamesWithDetails,
            "cachedGamesAchievements",
            steamId,
            isAuthenticated
          );
          setRecentGames([...recentGamesWithDetails]);
        }
      };
      updateRecentGamesAchievements();
    }
  }, [
    isAuthenticated,
    steamId,
    recentGames,
    getGamesWithDetails,
    fetchAchievementsForGames,
  ]);

  const syncAllData = useCallback(async () => {
    if (isAuthenticated && steamId) {
      setIsSyncing(true);
      setIsFullySynced(false);
      setIsLoading(true);

      try {
        const res = await delayedFetch(
          `/.netlify/functions/getOwnedGames/?steamid=${steamId}`
        );
        const data = await res.json();
        const allGames = data.response.games || [];

        const gamesWithDetails = await getGamesWithDetails(allGames);
        const gamesWithAchievements = await fetchAchievementsForGames(
          gamesWithDetails,
          "cachedGamesAchievements",
          steamId,
          isAuthenticated
        );

        setGames(gamesWithAchievements);
        setGamesToDisplay(gamesWithAchievements.slice(0, 20));

        const newGamePictures = gamesWithAchievements.reduce((acc, game) => {
          if (game.image) {
            acc[game.appid] = game.image;
          }
          return acc;
        }, {});
        setGamePictures(newGamePictures);

        await Promise.all(
          gamesWithAchievements.map((game) => storeData("games", game))
        );

        const allAchievementsData = await getAllData("achievements");
        const updatedAchievements = allAchievementsData.reduce((acc, item) => {
          acc[item.appid] = item.achievements;
          return acc;
        }, {});

        setAllAchievements(updatedAchievements);

        const updatedGamesToDisplay = gamesToDisplay.map((game) => ({
          ...game,
          achievements: updatedAchievements[game.appid] || [],
        }));
        setGamesToDisplay(updatedGamesToDisplay);

        setIsSyncing(false);
        setIsLoading(false);

        await new Promise((resolve) => setTimeout(resolve, 100));
        window.location.reload();

        setIsFullySynced(true);
        localStorage.setItem("isFullySynced", "true");
        // After setting fully synced, load all games
        if (games.length > 0) {
          const allGamesWithDetails = await getGamesWithDetails(games);
          setGamesToDisplay(allGamesWithDetails);
        }
      } catch (error) {
        console.error("Failed to sync all data:", error);
        setIsSyncing(false);
        setIsLoading(false);
      }
    }
  }, [isAuthenticated, steamId, getGamesWithDetails, gamesToDisplay]);

  const getRecentAchievements = useCallback(() => {
    if (isAuthenticated && steamId) {
      const allAchievementsList = [];
      Object.entries(allAchievements).forEach(([appId, achievements]) => {
        if (Array.isArray(achievements)) {
          achievements.forEach((achievement) => {
            if (achievement.achieved) {
              allAchievementsList.push({
                ...achievement,
                appId,
                gameName:
                  games.find((game) => game.appid.toString() === appId)?.name ||
                  "Unknown Game",
              });
            }
          });
        }
      });
      const sortedAchievements = allAchievementsList.sort(
        (a, b) => b.unlockTime - a.unlockTime
      );
      return sortedAchievements.slice(0, 10);
    }
  }, [isAuthenticated, steamId, allAchievements, games]);

  // recentAchievements when allAchievements changes
  useEffect(() => {
    const achievements = getRecentAchievements();
    if (achievements) {
      setRecentAchievements(achievements);
    }
  }, [allAchievements, getRecentAchievements]);

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
    recentGames,
    handleLoadMore,
    mostRecentGame,
    isSyncing,
    isFullySynced,
    syncAllData,
    recentAchievements,
    mostPlayedGame,
    isAuthenticated,
    steamId,
    isLoading,
    setIsLoading,
  };
}
