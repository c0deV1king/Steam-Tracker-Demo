import { delayedFetch } from './rateLimitingAPI';

const API_KEY = import.meta.env.VITE_STEAM_API_KEY;
export const fetchAchievementsForGames = async (games, cacheKey = 'cachedGamesAchievements') => {
    console.log(`Fetching achievements for games (${cacheKey}):`, games);

    const cachedAchievements = localStorage.getItem(cacheKey);
    const cacheTimestampAchievements = localStorage.getItem(`${cacheKey}Timestamp`);
    const now = new Date().getTime();

    let achievementsObj = {};

    if (cachedAchievements && cacheTimestampAchievements && now - parseInt(cacheTimestampAchievements) < 24 * 60 * 60 * 1000) {
      achievementsObj = JSON.parse(cachedAchievements);
      console.log(`Loaded achievements from cache (${cacheKey}):`, achievementsObj);
    }

    const gamesWithAchievements = await Promise.all(games.map(async (game) => {
      if (achievementsObj[game.appid]) {
        console.log(`Using cached achievements for game ${game.appid}`);
        return { ...game, achievements: achievementsObj[game.appid] };
      }

      try {
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

          achievementsObj[game.appid] = combinedAchievements;
          console.log(`Fetched achievements for game ${game.appid}:`, combinedAchievements);
          return { ...game, achievements: combinedAchievements };
        } else {
          console.log(`No achievements data available for game ${game.appid}`);
          return { ...game, achievements: [] };
        }
      } catch (error) {
        console.error(`Error fetching achievements for game ${game.appid}:`, error);
        return { ...game, achievements: [] };
      }
    }));

    // Update the cache with fetched achievements
    localStorage.setItem(cacheKey, JSON.stringify(achievementsObj));
    localStorage.setItem(`${cacheKey}Timestamp`, now.toString());

    console.log(`Updated cached achievements (${cacheKey}):`, achievementsObj);
    return gamesWithAchievements;
  };