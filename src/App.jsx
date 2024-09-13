import './styles.css'
import { useState } from 'react';
import { useSteamData } from './useSteamData';
import TimeClock from './img/clock-history.svg?react';
import ControllerSVG from './img/controller.svg?react';
import GithubSVG from './img/github.svg?react';
import SyncSVG from './img/arrow-repeat.svg?react';

export default function App() {
  const {
    profileData,
    gamesToDisplay,
    allAchievements,
    playtime,
    gamesPlayed,
    gamePictures,
    overviewGames,
    recentGames,
    handleLoadMore,
    mostRecentGame
  } = useSteamData();

  console.log("App received gamesToDisplay:", gamesToDisplay);
  console.log("App received allAchievements:", allAchievements);

  const [activeTab, setActiveTab] = useState('Overview');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // need to link up my loading spinner to when the user is loading api data
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
              <img className="m-2" src={profileData.avatarfull} width="256" height="256" alt='profile image' />
              <h2 className='text-4xl'>{profileData.personaname}</h2>
              <div className='flex flex-row justify-center items-center'>
                <a href={profileData.profileurl} target="_blank" rel="noopener noreferrer"><button className="btn btn-accent h-5 min-h-0 m-2 mb-3">Steam</button></a>
                <a href="#"><button className="btn btn-accent h-5 min-h-0 m-2 mb-3"><SyncSVG className='w-4 h-4 fill-black' />Sync all data</button></a>
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
                        <th> </th>
                        <th>Achievement</th>
                        <th>Date Earned</th>
                      </tr>
                    </thead>
                    <tbody className="bg-primary bg-opacity-5">
                      <tr key="#">
                        <td className="w-1/3">
                          <div className="w-full h-20 overflow-hidden">
                            <img src="#" className="w-full h-full object-cover" />
                            <div className="bg-gray-300 h-full w-full flex items-center justify-center">No Image</div>
                          </div>
                        </td>
                        <td className='w-1/3'> ###</td>
                        <td className='w-1/3'> ###</td>
                      </tr>
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
                      <th> </th>
                      <th>Game Name</th>
                      <th>Achievements Earned</th>
                    </tr>
                  </thead>
                  <tbody className="bg-primary bg-opacity-5">
                    {console.log("gamesToDisplay in render:", gamesToDisplay)}
                    {gamesToDisplay
                      .filter(game => game.playtime_forever > 0)
                      .map(game => {
                        console.log("Processing game:", game);
                        const achievements = game.achievements || [];
                        console.log("Game achievements:", achievements);
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
                  <button className="btn btn-info min-h-0 h-8 m-5" onClick={handleLoadMore}>More games</button>
                </div>
              </div>
            )}

            {activeTab === 'Achievements' && (
              <div className="container mx-auto">
                {/* Achievements content */}
              </div>
            )}

            {activeTab === 'Stats' && (
              <div className="container mx-auto">
                {/* Stats content */}
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
