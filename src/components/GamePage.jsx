import React, { useMemo, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useSteamData } from "../hooks/useSteamData";

const GamePage = ({ allAchievements }) => {
  const { gameId } = useParams();
  const {
    syncIndividualGameAchievements,
    syncIndividualGameData,
    gamesToDisplay,
  } = useSteamData();

  const game = useMemo(() => {
    return gamesToDisplay.find((game) => game.appid.toString() === gameId);
  }, [gamesToDisplay, gameId]);

  const handleSyncGameData = async () => {
    console.log("Syncing game data for:", game.appid);
    await syncIndividualGameData(game.appid);
    console.log("Sync completed");
  };

  const gameAchievements = allAchievements.filter(
    (achievement) =>
      achievement.appId === gameId ||
      achievement.appId === parseInt(gameId) ||
      achievement.appid?.toString() === gameId
  );

  if (!game) {
    return (
      <div className="container mx-auto p-4">
        <Link to="/" className="btn btn-accent mb-4">
          ← Back to Home
        </Link>
        <div className="text-center">Game not found</div>
      </div>
    );
  }

  return (
    // TOP HEADER
    <div className="container mx-auto p-2 mt-4 mb-4">
      <div className="text-center mb-4 flex flex-col md:flex-row gap-4 items-center">
        <Link to="/" className="btn btn-xs btn-accent">
          ← Dashboard
        </Link>
        <h1 className="text-4xl">
          <b>STEAM</b>TRACKER
        </h1>
        <div className="flex flex-col lg:flex-row gap-2">
          <button
            className="btn bg-accent btn-xs text-black"
            onClick={() => syncIndividualGameAchievements(game.appid)}
          >
            Sync Achievements
          </button>
          <button
            className="btn bg-accent btn-xs text-black"
            onClick={handleSyncGameData}
          >
            Sync Game Data
          </button>
        </div>
      </div>
      {/* GAME INFO */}
      <div className="">
        <div className="bg-base-200 rounded-xl p-2 xl:p-6 shadow-xl flex flex-col">
          <div className="flex flex-col lg:flex-col xl:flex-row items-center gap-4 w-full">
            <img
              src={game.headerImage}
              alt={game.name || game.gameName}
              className="w-[200px]"
            />

            <div className="w-full md:w-2/3 flex flex-col xl:justify-start items-center xl:items-start">
              <h1 className="text-xl font-bold">
                {game.name || game.gameName}
              </h1>

              <div className="bg-transparent flex justify-between xl:mt-4 xl:w-1/5 gap-2">
                <div className="text-sm flex flex-col p-0">
                  <div className="">Playtime</div>
                  <div className="text-accent font-bold text-lg">
                    {Math.round(game.playtime_forever / 60)} hrs
                  </div>
                </div>

                <div className="text-sm flex flex-col p-0">
                  <div className="">Achievements</div>
                  <div className="text-success font-bold text-lg">
                    {gameAchievements.filter((a) => a.achieved).length}/
                    {gameAchievements.length}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center xl:ml-20 gap-0 whitespace-nowrap">
              <h6 className="bg-base-100 p-1 border border-base-300 text-sm font-semibold">
                Developers
              </h6>
              <p className="text-xs mb-2">
                {game.developers || "No developer info"}
              </p>
              <h6 className="bg-base-100 p-1 border border-base-300 text-sm font-semibold">
                Publishers
              </h6>
              <p className="text-xs">
                {game.publishers || "No publisher info"}
              </p>
            </div>
          </div>
          <div className="flex flex-row mt-3 xl:mt-1 items-center justify-center xl:justify-start gap-1">
            {game.genres && game.genres.length > 0 ? (
              game.genres.map((genre, index) => (
                <div key={index} className="flex items-center justify-center">
                  <p className="text-black bg-white rounded-xl text-xs p-0.5">
                    {genre.description}
                  </p>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center">
                <p className="text-black bg-gray-300 rounded-xl text-xs p-0.5">
                  N/A
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="divider"></div>

        {/* ACHIEVEMENTS SECTION */}

        <h2 className="text-2xl font-bold mb-4">Achievements</h2>
        <div className="grid grid-cols-1 gap-4">
          {gameAchievements.map((achievement) => (
            <div
              key={achievement.apiname || achievement.name}
              className={`bg-base-100 rounded-xl p-4 shadow-xl ${
                achievement.achieved
                  ? "border-l-4 border-success"
                  : "border-l-4 border-gray-500 opacity-70"
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className="avatar">
                  <div className="rounded-xl h-[64px] w-[64px]">
                    {achievement.achieved ? (
                      <img
                        src={achievement.icon}
                        alt={achievement.displayName || achievement.name}
                      />
                    ) : (
                      <img
                        src={achievement.icongray}
                        alt={achievement.displayName || achievement.name}
                      />
                    )}
                  </div>
                </div>
                <div className="flex-grow">
                  <div className="font-bold">
                    {achievement.displayName ||
                      achievement.name ||
                      "Unknown Achievement"}
                  </div>
                  <div className="text-sm opacity-70">
                    {achievement.description || "No description available"}
                  </div>
                  <div className="text-sm mt-1 flex gap-2">
                    {achievement.achieved ? (
                      <span className="text-success">
                        Unlocked on{" "}
                        {new Date(
                          achievement.unlocktime * 1000
                        ).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-gray-500">Locked</span>
                    )}
                    <span>
                      -{"  "}
                      <span className="text-accent">
                        {achievement.percent
                          ? parseFloat(achievement.percent).toFixed(1)
                          : "0.0"}
                        %
                      </span>{" "}
                      earned by players
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GamePage;
