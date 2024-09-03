import './styles.css'
import { useState } from 'react';
import { useSteamData } from './useSteamData';

export default function App() {
  const { profileData, gamesToDisplay, allAchievements, playtime, gamesPlayed, gamePictures, overviewGames, recentGames, handleLoadMore } = useSteamData();
  const [activeTab, setActiveTab] = useState('Overview');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // need to link up my loading spinner to when the user is loading api data
  return (
    <>
      <div className=''>
        <div className='container mx-auto bg-transparent h-15 flex justify-center items-center'>
          <h1 className="container mx-auto text-center text-4xl"><b>STEAM</b>TRACKER</h1>
        </div>

        <div className='container mx-auto bg-black lg:w-[50%] sm:w-[90%] h-[300px]'>
          {/* banner */}
        </div>
        {playtime && gamesPlayed && (
          <div className='flex flex-col container mx-auto justify-center items-center m-5'>
            <div className="stats stats-vertical lg:stats-horizontal bg-transparent">
              <div className="stat">
                <div className="stat-title text-center">Games played:</div>
                <div className="stat-value text-center text-info">{typeof gamesPlayed === 'number' ? gamesPlayed : 'N/A'}</div>
              </div>

              <div className="stat">
                <div className="stat-title text-center">Hours played:</div>
                <div className="stat-value text-center text-info">{typeof playtime === 'number' ? playtime : 'N/A'}</div>
              </div>

              <div className="stat">
                <div className="stat-title text-center">Perfects:</div>
                <div className="stat-value text-center text-info">N/A</div>
              </div>

              <div className="stat">
                <div className="stat-title text-center">Achievements earned:</div>
                <div className="stat-value text-center text-info">N/A</div>
              </div>
            </div>
          </div>
        )}
        <div className='contaier mx-auto bg-base-200 sm:w-[75%] lg:w-[50%] border-2 border-base-100'>
          {profileData && (
            <div className='flex flex-col container mx-auto justify-center items-center'>
              <img className="m-2" src={profileData.avatarfull} width="256" height="256" alt='profile image' />
              <h2 className='text-4xl'>{profileData.personaname}</h2>
              <a href={profileData.profileurl} target="_blank" rel="noopener noreferrer"><button className="btn btn-accent h-5 min-h-0 m-2 mb-3">Steam</button></a>
            </div>
          )}



          <div role="tablist" className="tabs tabs-lifted">
            <a role="tab" className={`tab ${activeTab === 'Overview' ? 'tab-active' : ''}`} onClick={() => handleTabChange('Overview')}>Overview</a>
            <a role="tab" className={`tab ${activeTab === 'Games' ? 'tab-active' : ''}`} onClick={() => handleTabChange('Games')}>Games</a>
            <a role="tab" className={`tab ${activeTab === 'Achievements' ? 'tab-active' : ''}`} onClick={() => handleTabChange('Achievements')}>Achievements</a>
            <a role="tab" className={`tab ${activeTab === 'Stats' ? 'tab-active' : ''}`} onClick={() => handleTabChange('Stats')}>Stats</a>
          </div>

          <div className="overflow-x-auto flex justify-center items-center">

            {activeTab === 'Overview' && (
              <div className="container mx-auto w-[50%]">
                <table className="table table-sm w-[95%]">
                  <thead>
                    <tr>
                      <th>.</th>
                      <th>Game Name</th>
                      <th>Achievements Earned</th>
                    </tr>
                  </thead>
                  <tbody className="bg-primary bg-opacity-5">
                    {Array.isArray(overviewGames) && overviewGames.length > 0 ? overviewGames.map((game) => (
                      <tr key={game.appid}>
                        <td className="avatar">
                          <div className="mask rounded-md h-[107.5px] w-[230px]">
                            {game.image ? (
                              <img src={game.image} alt={`${game.name || 'Game'} image`} />
                            ) : (
                              <div className="bg-gray-300 h-full w-full flex items-center justify-center">No Image</div>
                            )}
                          </div>
                        </td>
                        <td>{game.name || `Game ID: ${game.appid}`}</td>
                        <td>
                          {game.achievements && game.achievements.length > 0
                            ? `${game.achievements.filter(a => a.achieved).length} / ${game.achievements.length}`
                            : 'No achievements'}
                        </td>
                      </tr>
                    )) : <tr><td colSpan="3" className="text-center">No games to display</td></tr>}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'Games' && (
              <div>
                <table className="table table-sm w-[95%]">
                  <thead>
                    <tr>
                      <th>.</th>
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
                            {allAchievements[game.appid] && allAchievements[game.appid].length > 0 ? (
                              `${allAchievements[game.appid].filter(a => a.achieved).length} / ${allAchievements[game.appid].length}`
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
    </>
  )
};
