import './styles.css'
import React, { useState, useEffect, useMemo } from 'react';
import { useSteamData } from './hooks/useSteamData';
import { achievementPages } from './utils/achievementPages';
import TimeClock from './img/clock-history.svg?react';
import ControllerSVG from './img/controller.svg?react';
import GithubSVG from './img/github.svg?react';
import SyncSVG from './img/arrow-repeat.svg?react';
import InfoSVG from './img/info-square.svg?react';
import { useCharts } from './hooks/useCharts.jsx';
import { AuthPage } from './components/AuthPage.jsx';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // importing use states and functions to be used in the app
  const {
    profileData,
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
    syncAllData,
    isSyncing,
    isFullySynced,
    testSchema,
    recentAchievements,
    mostPlayedGame
  } = useSteamData();

  const {
    currentPage,
    setCurrentPage,
    achievementsPerPage,
    getCurrentPageAchievements,
    nextPage,
    prevPage,
    goToPage,
    getTotalPages
  } = achievementPages(allAchievements);

  const { chartData, renderGenreChart, renderPlaytimeChart } = useCharts();

  const handleAuth = () => {
    setIsAuthenticated(true);
  };

  // Check for stored credentials on component mount
  useEffect(() => {
    const storedSteamId = localStorage.getItem('steamId');
    const storedApiKey = localStorage.getItem('apiKey');
    if (storedSteamId && storedApiKey) {
      setIsAuthenticated(true);
    }
  }, []);

  //  console.log("App: allAchievements:", allAchievements);
  // console.log("App: gamesToDisplay:", gamesToDisplay);

  // testing api endpoints, to be called manually with testSchema() in console
  useEffect(() => {
    window.testSchema = testSchema;
  }, [testSchema]);

  // console.log("syncAllData in App:", syncAllData);

  // console.log("App received gamesToDisplay:", gamesToDisplay);

  // state for the active tab
  const [activeTab, setActiveTab] = useState('Overview');

  // function for changing the active tab
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // sorting the achievements by date achieved
  const sortedAchievements = useMemo(() => {
    // console.log("Calculating sortedAchievements");
    // console.log("allAchievements:", allAchievements);

    const allAchievementsList = [];
    Object.entries(allAchievements).forEach(([appId, achievements]) => {
      //  console.log(`Processing appId: ${appId}, achievements:`, achievements);
      if (Array.isArray(achievements)) {
        achievements.forEach(achievement => {
          if (achievement.achieved) {
            allAchievementsList.push({
              ...achievement,
              appId,
              gameName: gamesToDisplay.find(game => game.appid.toString() === appId)?.name || 'Unknown Game'
            });
          }
        });
      } else {
        console.warn(`Achievements for appId ${appId} is not an array:`, achievements);
      }
    });
    // console.log("Final allAchievementsList:", allAchievementsList);
    return allAchievementsList.sort((a, b) => b.unlockTime - a.unlockTime);
  }, [allAchievements, gamesToDisplay]);

  // logging all sorted achievements, important to make sure achievements are being passed to the dom
  // console.log("sortedAchievements:", sortedAchievements);

  useEffect(() => {
    //   console.log("allAchievements updated:", allAchievements);
  }, [allAchievements]);

  useEffect(() => {
    //  console.log("allAchievements updated in App:", allAchievements);
  }, [allAchievements]);

  // state for the search term
  const [searchTerm, setSearchTerm] = useState('');

  // filtering the achievements based on the search term
  const filteredAchievements = useMemo(() => {
    const filtered = sortedAchievements.filter(achievement => {
      const searchString = `${achievement.displayName || achievement.name || ''} ${achievement.description || ''} ${new Date(achievement.unlockTime * 1000).toLocaleString()}`.toLowerCase();
      return searchString.includes(searchTerm.toLowerCase());
    });

    // Calculate total pages
    const totalPages = Math.ceil(filtered.length / achievementsPerPage);

    // Get current page achievements
    const indexOfLastAchievement = currentPage * achievementsPerPage;
    const indexOfFirstAchievement = indexOfLastAchievement - achievementsPerPage;
    const currentAchievements = filtered.slice(indexOfFirstAchievement, indexOfLastAchievement);

    return { filtered, currentAchievements, totalPages };
  }, [sortedAchievements, searchTerm, currentPage, achievementsPerPage]);

  // resetting the current page to 1 when the search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, setCurrentPage]);

  useEffect(() => {
    console.log("Most played game:", mostPlayedGame);
  }, [mostPlayedGame]);

  if (!isAuthenticated) {
    return <AuthPage onLogin={handleAuth} />;
  }


  return (
    <>
      <div className=''>
        <div className='container mx-auto bg-transparent h-15 w-[50%] flex justify-center items-center'>
          <h1 className="container mx-auto text-center text-4xl"><b>STEAM</b>TRACKER</h1>
          {playtime && gamesPlayed && (
            <div className='flex flex-col container mx-auto justify-center items-center m-5'>
              <div className="stats stats-vertical lg:stats-horizontal bg-transparent">
                <div className="stat flex justify-center items-center">
                  <div className="stat-title text-center">
                    <ControllerSVG className='w-6 h-6 fill-accent' />
                  </div>
                  <div className="stat-value text-center text-info">{typeof gamesPlayed === 'number' ? gamesPlayed : 'N/A'}</div>
                </div>

                <div className="stat flex justify-center items-center">
                  <div className="stat-title text-center">
                    <TimeClock className='w-6 h-6 fill-accent' />
                  </div>
                  <div className="stat-value text-center text-info">{typeof playtime === 'number' ? playtime : 'N/A'}</div>
                </div>
              </div>
            </div>
          )}
          <button className="btn btn-accent h-8 min-h-0 m-2 mb-3" onClick={() => document.getElementById('my_modal_5').showModal()}>
            <InfoSVG className='w-4 h-4 fill-black' />
            About Me
          </button>

          <dialog id="my_modal_5" className="modal modal-bottom sm:modal-middle">
            <div className="modal-box">
              <h3 className="font-bold text-lg">Hello!</h3>
              <p className="py-4">
                Welcome to SteamTracker! My name is Austin, or c0dev1king, I am a aspiring software developer and this is one of my projects.
                SteamTracker will track your games, achievements, recent games, recent achievements and a bunch of cool statistics based on
                the data. After all that is implemented, there will be more features being developed such as an achievement suggestions, trophy case,
                and a leaderboard based on a points system developed for the app itself. <br />
                This app is made with React.js + JavaScript and TailwindCSS currently. <br />
                Thanks for checking out my project!
              </p>
              <div className="modal-action">
                <form method="dialog">
                  {/* if there is a button in form, it will close the modal */}
                  <button className="btn">Close</button>
                </form>
              </div>
            </div>
          </dialog>

        </div>
        <div className='header'>
          {mostRecentGame && mostRecentGame.image && (
            <div className='container mx-auto bg-black lg:w-[50%] sm:w-[90%] h-[300px] relative'>
              {/* banner */}
              <img src={mostRecentGame.image} alt={mostRecentGame.name} className='object-cover w-full h-full' />
              <p className='text-accent absolute bottom-0 left-0 p-2 w-full
            [text-shadow:_-1px_-1px_0_#000,_1px_-1px_0_#000,_-1px_1px_0_#000,_1px_1px_0_#000]'>{mostRecentGame.name}</p>
            </div>
          )}
        </div>

        <div className='contaier mx-auto bg-base-200 sm:w-[75%] lg:w-[50%] border-2 border-base-100'>
          {profileData && (
            <div className='flex flex-col container mx-auto justify-center items-center'>
              <img className="rounded-xl m-2" src={profileData.avatarfull} width="256" height="256" alt='profile image' />
              <h2 className='text-4xl'>{profileData.personaname}</h2>
              <div className='flex flex-row justify-center items-center'>
                <a href={profileData.profileurl} target="_blank" rel="noopener noreferrer">
                  <button className="btn btn-accent h-5 min-h-0 m-2 mb-3">Steam</button>
                </a>
                <button
                  className="btn btn-accent h-5 min-h-0 m-2 mb-3"
                  onClick={() => {
                    //  console.log("Sync button clicked");
                    if (syncAllData) {
                      syncAllData();
                    } else {
                      console.error("syncAllData is undefined");
                    }
                  }}
                  disabled={isSyncing || isFullySynced}
                >
                  <SyncSVG className='w-4 h-4 fill-black' />
                  {isSyncing ? 'Syncing...' : isFullySynced ? 'Fully Synced' : 'Sync all data'}
                </button>
              </div>
            </div>
          )}



          <div role="tablist" className="tabs tabs-lifted">
            <a role="tab" className={`tab ${activeTab === 'Overview' ? 'tab-active' : ''}`} onClick={() => handleTabChange('Overview')}>Overview</a>
            <a role="tab" className={`tab ${activeTab === 'Games' ? 'tab-active' : ''}`} onClick={() => handleTabChange('Games')}>Games</a>
            <a role="tab" className={`tab ${activeTab === 'Achievements' ? 'tab-active' : ''}`} onClick={() => handleTabChange('Achievements')}>Achievements</a>
            <a role="tab" className={`tab ${activeTab === 'Stats' ? 'tab-active' : ''}`} onClick={() => handleTabChange('Stats')}>Stats</a>
          </div>

          <div className="overflow-x-auto flex flex-row justify-center items-center">

            {activeTab === 'Overview' && (
              <div>

                <div className='flex flex-row justify-evenly items-center mt-5'>
                  <p>Recent Games</p>
                  <p>Recent Achievements</p>
                </div>

                <div className="container mx-auto w-full flex flex-row justify-between items-start gap-4 p-4">
                  <table className="table table-sm w-[48%]">
                    <thead>
                      <tr>
                        <th className="w-1/3"> </th>
                        <th className="w-1/2">Game Name</th>
                        <th className="w-1/6">Achievements</th>
                      </tr>
                    </thead>
                    <tbody className="bg-primary bg-opacity-5">
                      {Array.isArray(overviewGames) && overviewGames.length > 0 ? overviewGames.slice(0, 5).map((game) => (
                        <tr key={game.appid}>
                          <td className="w-1/3">
                            <div className="aspect-[460/215] w-full overflow-hidden">
                              {game.image ? (
                                <img src={game.image} alt={`${game.name || 'Game'} image`} className="w-full h-full object-cover" />
                              ) : (
                                <div className="bg-gray-300 h-full w-full flex items-center justify-center">No Image</div>
                              )}
                            </div>
                          </td>
                          <td className="w-1/2">{game.name || `Game ID: ${game.appid}`}</td>
                          <td className="w-1/6 text-center">
                            {game.achievements && game.achievements.length > 0
                              ? `${game.achievements.filter(a => a.achieved).length} / ${game.achievements.length}`
                              : 'N/A'}
                          </td>
                        </tr>
                      )) : <tr><td colSpan="3" className="text-center">No games to display</td></tr>}
                    </tbody>
                  </table>

                  <table className="table table-sm w-[48%]">
                    <thead>
                      <tr>
                        <th> </th>
                        <th>Achievement</th>
                        <th>Date Earned</th>
                      </tr>
                    </thead>
                    <tbody className="bg-primary bg-opacity-5">
                      {recentAchievements.map((achievement) => (
                        <tr key={`${achievement.appId}-${achievement.apiname}`}>
                          <td className="w-1/6">
                            <div className="w-12 h-12 overflow-hidden">
                              {achievement.icon ? (
                                <img src={achievement.icon} alt={achievement.displayName || achievement.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="bg-gray-300 h-full w-full flex items-center justify-center">No Icon</div>
                              )}
                            </div>
                          </td>
                          <td className='w-1/3'>{achievement.displayName || achievement.name}</td>
                          <td className='w-1/4'>{new Date(achievement.unlockTime * 1000).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'Games' && (
              <div>
                <table className="table table-sm w-[95%]">
                  <thead>
                    <tr>
                      <th> </th>
                      <th>Game Name</th>
                      <th>Achievements Earned</th>
                    </tr>
                  </thead>
                  <tbody className="bg-primary bg-opacity-5">
                    {gamesToDisplay
                      .filter(game => game.playtime_forever > 0)
                      .map(game => {
                        const achievements = allAchievements[game.appid] || [];
                        const earnedAchievements = achievements.filter(achievement => achievement.achieved).length;
                        const totalAchievements = achievements.length;
                        return {
                          ...game,
                          earnedAchievements,
                          totalAchievements
                        };
                      })
                      .sort((a, b) => b.earnedAchievements - a.earnedAchievements)
                      .map((game, index) => (
                        <tr key={game.appid} >
                          <td className="avatar">
                            <div className="mask rounded-md h-[107.5px] w-[230px]">
                              <img
                                src={gamePictures[game.appid]}
                                alt="Game image" />
                            </div>
                          </td>
                          <td>{game.name}</td>
                          <td>
                            {game.totalAchievements > 0 ? (
                              `${game.earnedAchievements} / ${game.totalAchievements}`
                            ) : (
                              'No achievements'
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                <div className="flex justify-center items-center">
                  <button
                    className="btn btn-info min-h-0 h-8 m-5"
                    onClick={handleLoadMore}
                    disabled={isSyncing}
                  >
                    {isFullySynced ? 'Load More' : 'Load More'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'Achievements' && (
              <div className='flex flex-col justify-center items-center m-5'>
                <label className="input input-bordered flex items-center gap-2 w-[50%]">
                  <input
                    type="text"
                    className="grow"
                    placeholder="Search Achievements"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="h-4 w-4 opacity-70">
                    <path
                      fillRule="evenodd"
                      d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                      clipRule="evenodd" />
                  </svg>
                </label>
                <table className="table table-lg w-[95%]">
                  <thead>
                    <tr>
                      <th> </th>
                      <th>Achievement</th>
                      <th>Description</th>
                      <th>Unlocked</th>
                    </tr>
                  </thead>
                  <tbody className="bg-primary bg-opacity-5">
                    {filteredAchievements.currentAchievements.length > 0 ? (
                      filteredAchievements.currentAchievements.map((achievement, index) => (
                        <tr key={`${achievement.appId}-${achievement.apiname}`}>
                          <td className="avatar">
                            <div className="rounded-xl h-[64px] w-[64px]">
                              {achievement.icon ? (
                                <img
                                  src={achievement.icon}
                                  alt={achievement.displayName || achievement.name || 'Achievement icon'}
                                />
                              ) : (
                                <div className="bg-gray-300 h-full w-full flex items-center justify-center">No Icon</div>
                              )}
                            </div>
                          </td>
                          <td>{achievement.displayName || achievement.name || 'Unknown Achievement'}</td>
                          <td>{achievement.description || 'No description available'}</td>
                          <td>{achievement.unlockTime ? new Date(achievement.unlockTime * 1000).toLocaleString() : 'Unknown'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center">No achievements match your search</td>
                      </tr>
                    )}
                  </tbody>
                </table>
                <div className="join mt-4">
                  <button
                    className="join-item btn"
                    onClick={prevPage}
                    disabled={currentPage === 1}
                  >
                    «
                  </button>
                  <button className="join-item btn">
                    Page {currentPage} of {filteredAchievements.totalPages}
                  </button>
                  <button
                    className="join-item btn"
                    onClick={nextPage}
                    disabled={currentPage === filteredAchievements.totalPages}
                  >
                    »
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'Stats' && (
              <div className="container mx-auto">
                <div className="stats-page">
                  <h1 className="text-2xl text-center pt-2 pb-2 bg-base-100 mr-5 ml-5 rounded-xl mt-5 mb-[10%]">Game Statistics</h1>

                  <div className="chart-container h-[250px] w-[100%]">
                    {chartData.genreChart.length > 0 ? renderGenreChart() : <p>Loading genre data...</p>}
                  </div>

                  <div className="chart-container h-[800px] w-[100%]">
                    {chartData.playtimeChart.hourData.length > 0 && chartData.playtimeChart.dayData.length > 0 ?
                      renderPlaytimeChart() :
                      <p>Loading playtime data...</p>
                    }
                  </div>

                  {mostPlayedGame ? (
                    <div className='flex flex-row justify-center items-center mt-5 w-[100%]'>
                      <div className="container flex flex-col justify-center items-center mr-0 w-[50%]">
                        <p className='text-2xl'>{mostPlayedGame.name || 'Name not available'}</p>
                        <p>Playtime: <span className='text-success font-bold'>{Math.round((mostPlayedGame.playtime_forever || 0) / 60)} hours</span></p>
                      </div>

                      <div className="container flex flex-row justify-center items-start mb-5 w-[50%]">
                        {mostPlayedGame.image ? (
                          <img src={mostPlayedGame.image} alt={mostPlayedGame.name || 'Most played game'} className="object-cover" />
                        ) : (
                          <p>Image not available</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p>Loading most played game data...</p>
                  )}
                  <h2 className="text-xl text-center pt-2 pb-2 bg-base-100 mr-5 ml-5 rounded-xl mb-[10%]">Most Played Game</h2>
                  {/* Add more chart containers here */}
                </div>
              </div>
            )}

          </div>


        </div>
      </div >

      <footer className="footer footer-center bg-primary text-primary-content p-10">
        <aside>
          <a href="https://github.com/c0dev1king" target="_blank" rel="noopener noreferrer"><GithubSVG className='github-logo w-[64px] h-[64px] fill-black' /></a>
          <p className="font-bold">
            Created with love by c0dev1king
            <br />

          </p>
          <p>SteamTracker is not an official Steam product. The Steam name, logo, and related trademarks are trademarks of Valve Corporation. Valve Corporation is not affiliated with SteamTracker.</p>
        </aside>
      </footer>
    </>
  )
};
