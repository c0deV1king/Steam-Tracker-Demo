const [allAchievements, setAllAchievements] = useState({});


  // API call to grab all my achievements for all games
  useEffect(() => {
    const fetchAchievementsForAllGames = async () => {
      console.log("fetchAchievementsForAllGames called")
      // Check if cached data exists and is less than 24 hours old
      // and sets the data to setGames
      const cachedAchievements = localStorage.getItem('cachedAllAchievements');
      const cacheTimestampAchievements = localStorage.getItem('cacheTimestampAllAchievements');

      if (cachedAchievements && cacheTimestampAchievements) {
        console.log("cachedAchievements and cacheTimestampAchievements found")
        const now = new Date().getTime();
        if (now - parseInt(cacheTimestampAchievements) < 24 * 60 * 60 * 1000) {
          setAllAchievements(JSON.parse(cachedAchievements));
          console.log("allAchievements set to cachedAchievements")
          return;
        }
      }
      const achievements = await fetchAchievementsForGames(games);
      setAllAchievements(achievements);
      console.log("allAchievements set to fetched achievements")
      // Cache the results
      localStorage.setItem('cachedAllAchievements', JSON.stringify(achievements));
      localStorage.setItem('cacheTimestampAllAchievements', new Date().getTime().toString());
    };


    if (games.length > 0) {
      fetchAchievementsForAllGames();
    }

  }, []);
