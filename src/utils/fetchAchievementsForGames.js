import { delayedFetch } from './rateLimitingAPI';
import { storeData, getData } from './indexedDB';

const API_KEY = import.meta.env.VITE_STEAM_API_KEY;

export const fetchAchievementsForGames = async (games, cacheKey = 'cachedGamesAchievements') => {
    console.log(`Fetching achievements for games (${cacheKey}):`, games);

    const gamesWithAchievements = await Promise.all(games.map(async (game) => {
        try {
            // Check if we have cached achievements for this game
            const cachedAchievements = await getData('achievements', game.appid);
            if (cachedAchievements) {
                console.log(`Using cached achievements for game ${game.appid}`);
                return { ...game, achievements: cachedAchievements.achievements };
            }

            const [earnedRes, infoRes] = await Promise.all([
                delayedFetch(`http://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid=${game.appid}&key=${API_KEY}&steamid=76561198119786249`),
                delayedFetch(`http://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v0002/?appid=${game.appid}&key=${API_KEY}`)
            ]);

            const earnedData = await earnedRes.json();
            const infoData = await infoRes.json();

            if (earnedData.playerstats && earnedData.playerstats.achievements && infoData.game && infoData.game.availableGameStats && infoData.game.availableGameStats.achievements) {
                const combinedAchievements = earnedData.playerstats.achievements.map(achievement => {
                    const achievementInfo = infoData.game.availableGameStats.achievements.find(
                        a => achievement.apiname === a.name
                    );

                    return {
                        apiname: achievement.apiname,
                        name: achievementInfo ? achievementInfo.name : achievement.apiname,
                        displayName: achievementInfo ? achievementInfo.displayName : '',
                        description: achievementInfo ? achievementInfo.description : '',
                        icon: achievementInfo ? achievementInfo.icon : '',
                        achieved: achievement.achieved,
                        unlockTime: achievement.unlocktime
                    };
                });

                // Store achievements in IndexedDB
                await storeData('achievements', { appid: game.appid, achievements: combinedAchievements });

                console.log(`Fetched achievements for game ${game.appid}:`, combinedAchievements);
                return { ...game, achievements: combinedAchievements };
            } else {
                console.log(`No achievements data available for game ${game.appid}`);
                await storeData('achievements', { appid: game.appid, achievements: [] });
                return { ...game, achievements: [] };
            }
        } catch (error) {
            console.error(`Error fetching achievements for game ${game.appid}:`, error);
            await storeData('achievements', { appid: game.appid, achievements: [] });
            return { ...game, achievements: [] };
        }
    }));

    console.log(`Fetched achievements for all games`);
    return gamesWithAchievements;
};