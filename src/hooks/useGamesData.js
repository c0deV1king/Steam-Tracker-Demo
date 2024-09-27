import { useState, useEffect, useCallback } from 'react';
import { fetchAchievementsForGames } from '../utils/fetchAchievementsForGames';

export const useGamesData = (API_KEY) => {

    const [games, setGames] = useState([]);
    const [gamesToDisplay, setGamesToDisplay] = useState([]);
    const [allAchievements, setAllAchievements] = useState({});
    const [recentGames, setRecentGames] = useState([]);
    const [mostRecentGame, setMostRecentGame] = useState(null);
    const [playtime, setPlaytime] = useState({});
    const [gamesPlayed, setGamesPlayed] = useState({});
    const [gamePictures, setGamePictures] = useState({});
    const [overviewGames, setOverviewGames] = useState([]);
    const [overviewAchievements, setOverviewAchievements] = useState({});
    const [isSyncing, setIsSyncing] = useState(false);
    const [isFullySynced, setIsFullySynced] = useState(false);

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
                setOverviewGames(parsedOverviewGames.games);

                // Randomize screenshot for most recent game
                if (parsedOverviewGames.mostRecentGame && parsedOverviewGames.mostRecentGame.screenshots) {
                    const screenshots = parsedOverviewGames.mostRecentGame.screenshots;
                    const randomScreenshot = screenshots.length > 0
                        ? screenshots[Math.floor(Math.random() * screenshots.length)].path_full
                        : null;
                    setMostRecentGame({
                        ...parsedOverviewGames.mostRecentGame,
                        image: randomScreenshot || parsedOverviewGames.mostRecentGame.image
                    });
                } else {
                    setMostRecentGame(parsedOverviewGames.mostRecentGame);
                }

                console.log("Loaded recent games from cache");
                return;
            }

            console.log("No cached games found, fetching recent games");

            try {
                const res = await fetch(`http://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key=${API_KEY}&steamid=76561198119786249&format=json`);
                const data = await res.json();
                console.log("Recent games API response:", data);
                const recentGamesData = data.response.games || [];
                console.log("Recent games data:", recentGamesData);

                const gamesWithDetails = await Promise.all(recentGamesData.map(async (game) => {
                    const detailsRes = await fetch(`https://store.steampowered.com/api/appdetails?appids=${game.appid}`);
                    const detailsData = await detailsRes.json();
                    const gameDetails = detailsData[game.appid].data;
                    return {
                        ...game,
                        name: gameDetails.name,
                        image: gameDetails.header_image,
                        screenshots: gameDetails.screenshots || []
                    };
                }));

                console.log("Games with details:", gamesWithDetails);
                const gamesWithAchievements = await fetchAchievementsForGames(gamesWithDetails, 'cachedOverviewAchievements');
                console.log("Games with achievements:", gamesWithAchievements);

                let mostRecentGameData = null;

                if (gamesWithDetails.length > 0) {
                    mostRecentGameData = gamesWithDetails[0];
                    const randomScreenshot = mostRecentGameData.screenshots.length > 0
                        ? mostRecentGameData.screenshots[Math.floor(Math.random() * mostRecentGameData.screenshots.length)].path_full
                        : null;

                    mostRecentGameData = {
                        ...mostRecentGameData,
                        image: randomScreenshot || mostRecentGameData.image
                    };

                    setMostRecentGame(mostRecentGameData);
                }

                setOverviewGames(gamesWithAchievements);
                setOverviewAchievements(gamesWithAchievements.reduce((acc, game) => {
                    acc[game.appid] = game.achievements;
                    return acc;
                }, {}));

                console.log("Setting overview games to: ", gamesWithAchievements);

                // Cache the results
                localStorage.setItem('cachedOverviewGames', JSON.stringify({
                    games: gamesWithAchievements,
                    mostRecentGame: mostRecentGameData
                }));
                localStorage.setItem('cacheTimestampOverviewGames', new Date().getTime().toString());

                console.log("Recent games cached: ", localStorage.getItem('cachedOverviewGames'));

            } catch (error) {
                console.error('Error fetching overview games data:', error);
                setOverviewGames([]);
                setMostRecentGame(null);
            }
        };
        fetchOverviewGames();
    }, []);


    useEffect(() => {
        console.log("useEffect triggered for fetching games");
        const fetchGames = async () => {
            console.log("Fetching games");

            const cachedGames = localStorage.getItem('cachedGames');
            const cacheTimestamp = localStorage.getItem('cacheTimestampGames');
            const now = new Date().getTime();

            let allGamesList = [];

            if (cachedGames && cacheTimestamp && now - parseInt(cacheTimestamp) < 24 * 60 * 60 * 1000) {
                allGamesList = JSON.parse(cachedGames);
                setGames(allGamesList);
                console.log("Loaded games from cache");
            } else {
                // Fetch games from API
                const res = await fetch(`http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${API_KEY}&steamid=76561198119786249&format=json&include_played_free_games=1`);
                const data = await res.json();
                allGamesList = data.response.games || [];
                setGames(allGamesList);

                // Cache the results
                localStorage.setItem('cachedGames', JSON.stringify(allGamesList));
                localStorage.setItem('cacheTimestampGames', now.toString());
            }

            // Calculate total playtime and games played
            const totalPlaytime = Math.round(allGamesList.reduce((acc, game) => acc + game.playtime_forever, 0) / 60);
            setPlaytime(totalPlaytime);
            const totalGamesPlayed = allGamesList.filter(game => game.playtime_forever > 0).length;
            setGamesPlayed(totalGamesPlayed);

            const firstTwenty = allGamesList.slice(0, 20);
            const gamesWithDetails = await getGamesWithDetails(firstTwenty);

            setGamesToDisplay(gamesWithDetails);

            // Fetch or load cached achievements
            const cachedAchievements = localStorage.getItem('cachedGamesAchievements');
            const cacheTimestampAchievements = localStorage.getItem('cacheTimestampGamesAchievements');

            let achievementsObj = {};

            if (cachedAchievements && cacheTimestampAchievements && now - parseInt(cacheTimestampAchievements) < 24 * 60 * 60 * 1000) {
                achievementsObj = JSON.parse(cachedAchievements);
                console.log("Loaded achievements from cache");
            } else {
                const gamesWithAchievements = await fetchAchievementsForGames(gamesWithDetails, 'cachedGamesAchievements');
                achievementsObj = gamesWithAchievements.reduce((acc, game) => {
                    acc[game.appid] = game.achievements;
                    return acc;
                }, {});

                // Cache the achievements
                localStorage.setItem('cachedGamesAchievements', JSON.stringify(achievementsObj));
                localStorage.setItem('cacheTimestampGamesAchievements', now.toString());
            }

            setAllAchievements(achievementsObj);

            const gamesWithAchievements = gamesWithDetails.map(game => ({
                ...game,
                achievements: achievementsObj[game.appid] || []
            }));

            setGamesToDisplay(gamesWithAchievements);
        };

        fetchGames();
    }, []);

    async function getGamesWithDetails(gamesWithPlaytime) {
        const cachedGameDetails = localStorage.getItem('cachedGameDetails');
        const cacheTimestampGameDetails = localStorage.getItem('cacheTimestampGameDetails');
        const now = new Date().getTime();

        let cachedDetails = {};
        if (cachedGameDetails && cacheTimestampGameDetails && now - parseInt(cacheTimestampGameDetails) < 24 * 60 * 60 * 1000) {
            console.log("Loaded game details from cache");
            cachedDetails = JSON.parse(cachedGameDetails);
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

            if (cachedDetails[game.appid]) {
                console.log(`Using cached details for game ${game.appid}`);
                gamePicturesTemp[game.appid] = cachedDetails[game.appid].header_image;
                return {
                    ...game,
                    name: cachedDetails[game.appid].name,
                    header_image: cachedDetails[game.appid].header_image
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
                        cachedDetails[game.appid] = {
                            name: gameData.name,
                            header_image: gameData.header_image
                        };
                        return {
                            ...game,
                            name: gameData.name,
                            header_image: gameData.header_image
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

        const results = await Promise.all(promiseArray);

        localStorage.setItem('cachedGameDetails', JSON.stringify(cachedDetails));
        localStorage.setItem('cacheTimestampGameDetails', new Date().getTime().toString());

        console.log("gamePicturesTemp:", gamePicturesTemp);
        setGamePictures(gamePicturesTemp);
        return results;
    };



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

    useEffect(() => {
        const gamesWithoutAchievements = gamesToDisplay.filter(game => !allAchievements[game.appid]);
        if (gamesWithoutAchievements.length > 0) {
            fetchAchievementsForGames(gamesWithoutAchievements);
        }
    }, []);

    const handleLoadMore = async () => {
        console.log("Loading more games");

        const currentLength = gamesToDisplay.length;
        const newGames = games.slice(currentLength, currentLength + 20);

        console.log("New games to load:", newGames);

        const newGamesWithDetails = await getGamesWithDetails(newGames);

        console.log("New games with details:", newGamesWithDetails);

        // Fetch achievements for new games
        const newGamesWithAchievements = await fetchAchievementsForGames(newGamesWithDetails, 'cachedGamesAchievements');

        console.log("New games with achievements:", newGamesWithAchievements);

        // Update allAchievements state
        setAllAchievements(prevAchievements => {
            const updatedAchievements = { ...prevAchievements };
            newGamesWithAchievements.forEach(game => {
                updatedAchievements[game.appid] = game.achievements || [];
            });
            return updatedAchievements;
        });

        setGamesToDisplay(prevGames => {
            const updatedGames = [...prevGames, ...newGamesWithAchievements];
            console.log("Updated gamesToDisplay:", updatedGames);
            return updatedGames;
        });

        // Update the games array with the new detailed data
        setGames(prevGames => {
            const updatedGames = [...prevGames];
            newGamesWithAchievements.forEach(game => {
                const index = updatedGames.findIndex(g => g.appid === game.appid);
                if (index !== -1) {
                    updatedGames[index] = game;
                }
            });
            return updatedGames;
        });

        // Update cache
        const now = new Date().getTime();
        localStorage.setItem('cachedGames', JSON.stringify(games));
        localStorage.setItem('cacheTimestampGames', now.toString());

        const cachedAchievements = JSON.parse(localStorage.getItem('cachedGamesAchievements') || '{}');
        newGamesWithAchievements.forEach(game => {
            cachedAchievements[game.appid] = game.achievements || [];
        });
        localStorage.setItem('cachedGamesAchievements', JSON.stringify(cachedAchievements));
        localStorage.setItem('cacheTimestampGamesAchievements', now.toString());
    };

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

    return {
        games,
        gamesToDisplay,
        allAchievements,  // Add this line
        playtime,
        gamesPlayed,
        gamePictures,
        overviewGames,
        recentGames,
        handleLoadMore,
        mostRecentGame,
        isSyncing,
        isFullySynced
    };
};