import React from "react";
import { useParams, Link } from "react-router-dom";

const GamePage = ({ allAchievements, gamesToDisplay }) => {
  const { gameId } = useParams();

  const game = gamesToDisplay.find((game) => game.appid.toString() === gameId);

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
    <div className="container mx-auto p-4">
      <Link to="/" className="btn btn-accent mb-4">
        ← Back to Home
      </Link>
      <div className="">
        <div className="bg-base-200 rounded-xl p-6 shadow-xl flex">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <img
              src={game.headerImage}
              alt={game.name || game.gameName}
              className="w-[200px]"
            />

            <div className="w-full md:w-2/3 flex flex-col justify-start">
              <h1 className="text-xl font-bold">
                {game.name || game.gameName}
              </h1>

              <div className="bg-transparent flex justify-between mt-4 w-1/5 gap-2">
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
            <div>
              <div className="flex items-center justify-center">
                <p className="text-black bg-white rounded-xl text-xs p-0.5">
                  Adventure
                </p>
              </div>
              <div className="bg-white rounded-xl flex items-center justify-center">
                <p className="text-black text-xs p-0.5 whitespace-nowrap">
                  Longer genre name test
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="divider"></div>

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
