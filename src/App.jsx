import "./styles.css";
import React, { useState, useEffect, useMemo } from "react";
import { useSteamData } from "./hooks/useSteamData";
import { achievementPages } from "./utils/achievementPages";
import { gamePages } from "./utils/gamePages";
import TimeClockSVG from "./img/clock-history.svg?url";
import JoystickSVG from "./img/joystick.svg?url";
import GithubSVG from "./img/github.svg?url";
import SyncSVG from "./img/arrow-repeat.svg?url";
import InfoSVG from "./img/info-square.svg?url";
import SteamSVG from "./img/steam.svg?url";
import LogoutSVG from "./img/box-arrow-left.svg?url";
import AwardSVG from "./img/award.svg?url";
import { AuthPage } from "./components/AuthPage";
import { clearAllStorage } from "./utils/clearStorage";
import { getAllData } from "./utils/indexedDB";
import ConnectionTest from "./components/ConnectionTest";
import { Routes, Route, Link } from "react-router-dom";
import GamePage from "./components/GamePage";

const LoadingScreen = () => {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const messages = [
    "fetching your games...",
    "fetching your achievements...",
    "getting inital games...",
    "grabbing your data...",
    "taking a peak at your profile...",
    "deciding what screenshot you might like best...",
    "shouting at dragons...",
    "taking an arrow to the knee...",
    "downloading more ram...",
    "loading battlestations...",
    "system processing please wait...",
    "creating codex...",
    "assembling access points...",
    "playing minesweeper...",
    "booting up battleships...",
    "visualizing vectors...",
  ];

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentMessage((current) => {
        const nextIndex = Math.floor(Math.random() * messages.length);
        return nextIndex;
      });
      setDisplayedText(""); // Reset displayed text when message changes
    }, 4000);

    return () => clearInterval(messageInterval);
  }, []);

  // Effect for typing animation
  useEffect(() => {
    const currentFullMessage = messages[currentMessage];
    if (displayedText.length < currentFullMessage.length) {
      const typingInterval = setInterval(() => {
        setDisplayedText((current) => {
          if (current.length < currentFullMessage.length) {
            return currentFullMessage.slice(0, current.length + 1);
          }
          return current;
        });
      }, 50); // Adjust typing speed here (lower = faster)

      return () => clearInterval(typingInterval);
    }
  }, [currentMessage, displayedText, messages]);

  // Effect for cursor blinking
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((current) => !current);
    }, 530); // Adjust blink speed here

    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <div className="fixed inset-0 bg-primary bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-primary p-8 rounded-lg shadow-lg text-center">
        <span className="loading loading-spinner loading-lg text-accent"></span>
        <div className="flex flex-row items-center justify-center bg-base-100 rounded-lg p-1 mt-2">
          <p className="text-white pr-1"> &gt; </p>
          <p className="text-white">
            {displayedText}
            <span className={`${showCursor ? "opacity-100" : "opacity-0"}`}>
              |
            </span>
          </p>
        </div>
        <p className="mt-4 text-white text-sm italic">
          {" "}
          Loading times depends on how big your steam library is{" "}
        </p>
      </div>
    </div>
  );
};

export default function App() {
  const {
    isAuthenticated,
    isDemo,
    setIsAuthenticated,
    setIsDemo,
    profileData,
    gamesToDisplay,
    allAchievements,
    setAllAchievements,
    playtime,
    gamesPlayed,
    gamePictures,
    overviewGames,
    fetchOverviewGames,
    recentGames,
    mostRecentGame,
    syncAllData,
    syncAllAchievements,
    isSyncing,
    isFullySynced,
    isAchievementsSynced,
    testSchema,
    recentAchievements,
    mostPlayedGame,
    isLoading,
    setIsLoading,
    syncIndividualGameAchievements,
    handleImageError,
  } = useSteamData();

  const {
    currentPage,
    setCurrentPage,
    achievementsPerPage,
    getCurrentPageAchievements,
    nextPage,
    prevPage,
    goToPage,
    getTotalPages,
  } = achievementPages(allAchievements);

  const {
    currentGamePage,
    setCurrentGamePage,
    gamesPerPage,
    getCurrentPageGames,
    nextGamePage,
    prevGamePage,
    goToGamePage,
    getTotalGamePages,
  } = gamePages(gamesToDisplay);

  const handleSyncAllData = async () => {
    await syncAllData();
  };

  const handleSyncAllAchievements = async () => {
    await syncAllAchievements();
  };

  const handleAuth = () => {
    setIsAuthenticated(true);
    window.location.reload();
  };

  const handleDemoLogin = () => {
    setIsDemo(true);
  };

  const handleLogout = async () => {
    console.log("Logout button clicked");
    await clearAllStorage();
    setIsAuthenticated(false);
    setIsDemo(false);
    window.location.reload();
  };

  // Check for stored credentials on component mount
  useEffect(() => {
    const storedSteamId = localStorage.getItem("steamId");
    if (storedSteamId) {
      setIsAuthenticated(true);
    }
  }, []);

  const [activeTab, setActiveTab] = useState("Overview");

  // function for changing the active tab
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // state for the search term
  const [searchTerm, setSearchTerm] = useState("");

  // filtering the achievements based on the search term
  const filteredAchievements = useMemo(() => {
    if (!Array.isArray(allAchievements)) {
      console.error("allAchievements is not an array", allAchievements);
      return { filtered: [], currentAchievements: [], totalPages: 0 };
    }

    const filtered = allAchievements.filter((achievement) => {
      const searchString = `${
        achievement.displayName || achievement.name || ""
      } ${achievement.description || ""} ${new Date(
        achievement.unlockTime * 1000
      ).toLocaleString()}`.toLowerCase();
      return searchString.includes(searchTerm.toLowerCase());
    });

    // Calculate total pages
    const totalPages = Math.ceil(filtered.length / achievementsPerPage);

    // Get current page achievements
    const indexOfLastAchievement = currentPage * achievementsPerPage;
    const indexOfFirstAchievement =
      indexOfLastAchievement - achievementsPerPage;
    const currentAchievements = filtered.slice(
      indexOfFirstAchievement,
      indexOfLastAchievement
    );

    return { filtered, currentAchievements, totalPages };
  }, [allAchievements, searchTerm, currentPage, achievementsPerPage]);

  // resetting the current page to 1 when the search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, setCurrentPage]);

  const [advisorPage, setAdvisorPage] = useState(1);

  const [gamesData, setGamesData] = useState({});
  useEffect(() => {
    const loadGamesData = async () => {
      if (isFullySynced) {
        const games = await getAllData("games");
        const gamesMap = games.reduce((acc, game) => {
          acc[game.appid] = game;
          return acc;
        }, {});
        setGamesData(gamesMap);
      }
    };
    loadGamesData();
  }, [isFullySynced]);

  const getGameName = (appId) => {
    if (!isFullySynced || !gamesData[appId]) {
      return "Unknown Game";
    }
    return gamesData[appId].name || "Unknown Game";
  };

  if (!isAuthenticated && !isDemo) {
    return <AuthPage onLogin={handleAuth} onDemoLogin={handleDemoLogin} />;
  }

  // DEMO LOGIC
  const renderDemoOverview = () => {
    return (
      <div>
        <div className="flex flex-row justify-evenly items-center mt-5">
          <p>Recent Games</p>
          <p>Recent Achievements</p>
        </div>

        <div className="container mx-auto w-full flex flex-row justify-between items-start gap-4 p-4">
          <table className="table table-sm w-[48%]">
            <thead>
              <tr>
                <th className="w-1/3"> </th>
                <th>Game Name</th>
                <th>Achievements</th>
              </tr>
            </thead>
            <tbody className="bg-primary bg-opacity-5">
              <tr>
                <td className="w-1/3">
                  <div className="aspect-[460/215] w-full overflow-hidden">
                    <img
                      src={
                        "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/230410/header.jpg?t=1729784957"
                      }
                      alt={`Warframe header image`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </td>
                <td className="w-1/2">Warframe</td>
                <td className="w-1/6 text-center">3 / 10</td>
              </tr>
              <tr>
                <td className="w-1/3">
                  <div className="aspect-[460/215] w-full overflow-hidden">
                    <img
                      src={
                        "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1544020/header.jpg?t=1726806420"
                      }
                      alt={`The Callisto Protocol header image`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </td>
                <td className="w-1/2">The Callisto Protocol</td>
                <td className="w-1/6 text-center">1 / 63</td>
              </tr>
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
              <tr>
                <td className="w-1/6">
                  <div className="w-12 h-12 overflow-hidden">
                    <img
                      src={
                        "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/apps/230410/696dc084e8cc668428ea5a9a022f5c41127eed7c.jpg"
                      }
                      alt={"Achievement image"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </td>
                <td>Our Tools Shape Us</td>
                <td>10/18/2024</td>
              </tr>
              <tr>
                <td className="w-1/6">
                  <div className="w-12 h-12 overflow-hidden">
                    <img
                      src={
                        "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/apps/230410/58342bec33e2a10a20e675368282ed244aae0d68.jpg"
                      }
                      alt={"Achievement image"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </td>
                <td>Battle Mastery II</td>
                <td>10/16/2024</td>
              </tr>
              <tr>
                <td className="w-1/6">
                  <div className="w-12 h-12 overflow-hidden">
                    <img
                      src={
                        "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/apps/230410/696dc084e8cc668428ea5a9a022f5c41127eed7c.jpg"
                      }
                      alt={"Achievement image"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </td>
                <td>You're Not Alone</td>
                <td>10/07/2024</td>
              </tr>
              <tr>
                <td className="w-1/6">
                  <div className="w-12 h-12 overflow-hidden">
                    <img
                      src={
                        "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/apps/1544020/92a325b79becc219cfea5f22f1cac01747d9fb59.jpg"
                      }
                      alt={"Achievement image"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </td>
                <td>The Commonality</td>
                <td>09/26/2024</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderDemoGames = () => {
    return (
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
            <tr>
              <td className="avatar">
                <div className="mask rounded-md h-[107.5px] w-[230px]">
                  <img
                    src={
                      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/230410/header.jpg?t=1729784957"
                    }
                    alt="Game image"
                  />
                </div>
              </td>
              <td>Warframe</td>
              <td>3 / 10</td>
            </tr>
          </tbody>
          <tbody className="bg-primary bg-opacity-5">
            <tr>
              <td className="avatar">
                <div className="mask rounded-md h-[107.5px] w-[230px]">
                  <img
                    src={
                      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1544020/header.jpg?t=1726806420"
                    }
                    alt="Game image"
                  />
                </div>
              </td>
              <td>The Callisto Protocol</td>
              <td>1 / 63</td>
            </tr>
          </tbody>
        </table>
        <div className="flex justify-center items-center">
          <button className="btn btn-info min-h-0 h-8 m-5 opacity-50 cursor-not-allowed">
            {" "}
            Load More
          </button>
          <p className="text-sm text-gray-500">Disabled in demo mode</p>
        </div>
      </div>
    );
  };

  const renderDemoAchievements = () => {
    return (
      <div className="flex flex-col justify-center items-center m-5">
        <label className="input input-bordered flex items-center gap-2 w-[50%] opacity-50 cursor-not-allowed">
          <input
            type="text"
            className="grow"
            placeholder="Search disabled in demo"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg
            xmlns="https://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="h-4 w-4 opacity-70"
          >
            <path
              fillRule="evenodd"
              d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
              clipRule="evenodd"
            />
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
            <tr>
              <td className="avatar">
                <div className="rounded-xl h-[64px] w-[64px]">
                  <img
                    src={
                      "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/apps/230410/696dc084e8cc668428ea5a9a022f5c41127eed7c.jpg"
                    }
                    alt={"achievement icon"}
                  />
                </div>
              </td>
              <td>Our Tools Shape Us</td>
              <td>Finish the first act</td>
              <td>10/18/2024</td>
            </tr>
          </tbody>
          <tbody className="bg-primary bg-opacity-5">
            <tr>
              <td className="avatar">
                <div className="rounded-xl h-[64px] w-[64px]">
                  <img
                    src={
                      "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/apps/230410/58342bec33e2a10a20e675368282ed244aae0d68.jpg"
                    }
                    alt={"achievement icon"}
                  />
                </div>
              </td>
              <td>Battle Mastery II</td>
              <td>Earn level 20 with any weapon</td>
              <td>10/16/2024</td>
            </tr>
          </tbody>
          <tbody className="bg-primary bg-opacity-5">
            <tr>
              <td className="avatar">
                <div className="rounded-xl h-[64px] w-[64px]">
                  <img
                    src={
                      "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/apps/230410/696dc084e8cc668428ea5a9a022f5c41127eed7c.jpg"
                    }
                    alt={"achievement icon"}
                  />
                </div>
              </td>
              <td>You're Not Alone</td>
              <td>Complete all main story missions</td>
              <td>10/07/2024</td>
            </tr>
          </tbody>
          <tbody className="bg-primary bg-opacity-5">
            <tr>
              <td className="avatar">
                <div className="rounded-xl h-[64px] w-[64px]">
                  <img
                    src={
                      "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/apps/1544020/92a325b79becc219cfea5f22f1cac01747d9fb59.jpg"
                    }
                    alt={"achievement icon"}
                  />
                </div>
              </td>
              <td>The Commonality</td>
              <td>Perfect dodge a grunt</td>
              <td>09/26/2024</td>
            </tr>
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
    );
  };

  const renderTopBannerDemo = () => {
    return (
      <div className="flex flex-col md:flex-row container mx-auto justify-center items-center m-5">
        <div className="stats stats-horizontal bg-transparent">
          <div className="stat flex justify-center items-center">
            <div className="stat-title text-center"></div>
            <img
              src={JoystickSVG}
              alt="joystick"
              className="w-8 h-8 svg-accent"
            />
            <div className="stat-value text-center text-info text-white">
              27
            </div>
          </div>

          <div className="stat flex justify-center items-center">
            <img
              src={TimeClockSVG}
              alt="timeclock"
              className="w-8 h-8 svg-accent"
            />
            <div className="stat-value text-center text-info text-white">
              2683
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDemoScreenshot = () => {
    return (
      <div className="mx-auto bg-black p-0 m-0 h-[400px] w-full relative mb-10">
        {/* banner */}
        <img
          src={
            "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/230410/ss_29355e0546599c72002b34b42fe952329df61c2e.jpg"
          }
          alt={"screenshot"}
          className="object-cover w-full h-full"
        />
        <p
          className="text-accent absolute bottom-0 left-0 p-2 w-full
            [text-shadow:_-1px_-1px_0_#000,_1px_-1px_0_#000,_-1px_1px_0_#000,_1px_1px_0_#000]"
        >
          Warframe
        </p>
      </div>
    );
  };

  const renderDemoWarningBanner = () => {
    return (
      <div className="container mx-auto bg-secondary lg:w-[90%] sm:w-[90%] md:w-[90%]  h-[85px] md:h-[40px] relative rounded-3xl mt-2 mb-5">
        <p className="text-black font-bold text-lg text-center absolute bottom-0 left-0 p-2 w-full lg:whitespace-nowrap xs:whitespace-normal">
          - Demo mode is currently enabled, please login to Steam for full
          functionality -
        </p>
      </div>
    );
  };

  const renderDemoProfile = () => {
    return (
      <div className="flex flex-col container mx-auto justify-center items-center">
        <img
          className="rounded-xl m-2"
          src={
            "https://www.teknouser.com/wp-content/uploads/2020/04/steam-profil-resmi-5.jpg"
          }
          width="256"
          height="256"
          alt="profile image"
        />
        <h2 className="text-4xl">Demo User</h2>
        <div className="flex flex-row justify-center items-center">
          <button
            className="btn btn-accent h-5 min-h-0 m-2 mb-3 disabled:opacity-50 cursor-not-allowed disabled:cursor-not-allowed"
            disabled
          >
            Steam
          </button>
          <button
            className="btn btn-accent h-5 min-h-0 m-2 mb-3 disabled:opacity-50 cursor-not-allowed disabled:cursor-not-allowed"
            disabled
          >
            Sync all data
          </button>
          <button
            className="btn btn-warning h-5 min-h-0 m-2 mb-3"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    );
  };

  const renderDemoAdvisor = () => {
    return (
      <div>
        <p>Advisor not currently available in demo mode</p>
      </div>
    );
  };

  return (
    <>
      {isLoading && <LoadingScreen />}
      <Routes>
        <Route
          path="/game/:gameId"
          element={
            <GamePage
              allAchievements={allAchievements}
              gamesToDisplay={gamesToDisplay}
              handleImageError={handleImageError}
              profileData={profileData}
              handleLogout={handleLogout}
            />
          }
        />
        <Route
          path="/"
          element={
            <div className="">
              <div className="container mx-auto flex flex-col sm:flex-row pb-5 pt-5 bg-base-100 h-12 w-[100%] flex items-center mb-[180px] sm:mb-0">
                <h1 className="container mx-auto text-center text-4xl">
                  <b>STEAM</b>TRACKER
                </h1>
                {isDemo
                  ? renderTopBannerDemo()
                  : playtime &&
                    gamesPlayed && (
                      <div className="flex flex-col container mx-auto justify-center items-center m-5">
                        <div className="stats stats-horizontal bg-transparent">
                          <div className="stat flex justify-center items-center">
                            <div className="stat-title text-center"></div>
                            <img
                              src={JoystickSVG}
                              alt="joystick"
                              className="w-8 h-8 svg-accent"
                            />
                            <div className="stat-value text-center text-white">
                              {typeof gamesPlayed === "number"
                                ? gamesPlayed
                                : "N/A"}
                            </div>
                          </div>

                          <div className="stat flex justify-center items-center">
                            <img
                              src={TimeClockSVG}
                              alt="timeclock"
                              className="w-8 h-8 svg-accent"
                            />
                            <div className="stat-value text-center text-white">
                              {typeof playtime === "number" ? playtime : "N/A"}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                <button
                  className="btn btn-transparent bg-transparent btn-sm border-0"
                  onClick={() =>
                    document.getElementById("my_modal_2").showModal()
                  }
                >
                  <img
                    src={InfoSVG}
                    alt="info"
                    className="w-8 h-8 svg-accent"
                  />
                </button>
                <dialog id="my_modal_2" className="modal">
                  <div className="modal-box w-12/12 max-w-5xl flex flex-col justify-start items-center mt-0 max-h-[90vh] overflow-y-auto">
                    <p className="font-bold text-lg mb-4">
                      Welcome to my app, SteamTracker! I am a software
                      developer, currently a student at GetBuilding on the east
                      coast of Canada. The purpose of this project originally
                      was to learn React and APIs, it then transformed into
                      learning a full backend.I made this an app for achievement
                      hunters because I am an achievement hunter myself and I
                      feel I could also benefit from a tool like this. Visit the{" "}
                      <a
                        className="text-accent"
                        href="https://github.com/c0deV1king/Steam-Tracker-Demo"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        repo
                      </a>{" "}
                      on GitHub. Thanks for checking out my project!
                    </p>

                    <div className="flex flex-row justify-center items-center gap-4 pt-5">
                      <p className="font-bold text-lg">Tech Stack:</p>
                      <img
                        src="https://camo.githubusercontent.com/e88633b8cf461e3ec31845227bea9dcdc2105c978f85c33d1a25ab891b3ca290/68747470733a2f2f75706c6f61642e77696b696d656469612e6f72672f77696b6970656469612f636f6d6d6f6e732f7468756d622f332f33302f52656163745f4c6f676f5f5356472e7376672f3139323070782d52656163745f4c6f676f5f5356472e7376672e706e67"
                        alt="React Logo"
                        className="w-8 h-8"
                      />
                      <img
                        src="https://camo.githubusercontent.com/1253027a98fef1178fd945c4fe07490a4ef5820810ae26c184a7222602b8bb01/68747470733a2f2f75706c6f61642e77696b696d656469612e6f72672f77696b6970656469612f636f6d6d6f6e732f7468756d622f392f39392f556e6f6666696369616c5f4a6176615363726970745f6c6f676f5f322e7376672f3132383070782d556e6f6666696369616c5f4a6176615363726970745f6c6f676f5f322e7376672e706e67"
                        alt="JS logo"
                        className="w-8 h-8"
                      />
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/4/4c/Typescript_logo_2020.svg"
                        alt="TS logo"
                        className="w-8 h-8"
                      />
                      <img
                        src="https://camo.githubusercontent.com/866d3535e0157c035205e7a6a4b93cdf35ff21279ad5ad3ad0f9bfb956dcc7f9/68747470733a2f2f75706c6f61642e77696b696d656469612e6f72672f77696b6970656469612f636f6d6d6f6e732f7468756d622f392f39352f5461696c77696e645f4353535f6c6f676f2e7376672f3235363070782d5461696c77696e645f4353535f6c6f676f2e7376672e706e67"
                        alt="Tailwind logo"
                        className="w-15 h-5"
                      />
                      <img
                        src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Frailway.app%2Fbrand%2Flogo-light.png&f=1&nofb=1&ipt=626c3cdd78c0cf2a07cf1b2759921e84bc241b1285a438c034eaa2018777fe4a"
                        alt="railway logo"
                        className="w-15 h-8 bg-white rounded-xl"
                      />
                      <p>Express</p>
                    </div>

                    <div className="divider"></div>

                    <video
                      style={{
                        borderRadius: "10px",
                        border: "2px solid #fde047",
                      }}
                      width="100%"
                      height="auto"
                      controls
                    >
                      <source
                        src="/Steam-Tracker-Tour-Compressed.mp4"
                        type="video/mp4"
                      />
                    </video>
                  </div>
                  <div className="flex flex-row justify-center items-center">
                    <div className="modal-action">
                      <form method="dialog">
                        <button className="btn btn-accent">Close</button>
                      </form>
                    </div>
                  </div>

                  <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                  </form>
                </dialog>
              </div>
              {isDemo ? renderDemoWarningBanner() : <div></div>}
              <div className="header">
                {isDemo
                  ? renderDemoScreenshot()
                  : overviewGames &&
                    overviewGames.length > 0 && (
                      <div className="mx-auto bg-black p-0 m-0 h-[400px] w-full relative">
                        {/* banner with screenshot from recent games */}
                        <img
                          src={
                            overviewGames[0].screenshots &&
                            overviewGames[0].screenshots.length > 0
                              ? overviewGames[0].screenshots[0].path_full
                              : overviewGames[0].headerImage
                          }
                          alt={overviewGames[0].name}
                          className="object-cover w-full h-full"
                          id="main-header-image"
                        />
                        <div className="absolute bottom-0 left-0 flex flex-row overflow-x-auto p-1 gap-2 w-full bg-black bg-opacity-30">
                          {/* Show thumbnails from all recent games that have screenshots */}
                          {overviewGames
                            .filter(
                              (game) =>
                                game.screenshots && game.screenshots.length > 0
                            )
                            .slice(0, 3)
                            .map((game) =>
                              game.screenshots
                                .slice(0, 3)
                                .map((screenshot, index) => (
                                  <img
                                    key={`${game.appid}-${screenshot.id}`}
                                    src={screenshot.path_thumbnail}
                                    alt={`${game.name} screenshot ${index + 1}`}
                                    className="h-16 rounded cursor-pointer hover:border-2 hover:border-accent"
                                    onClick={() => {
                                      const mainImg =
                                        document.getElementById(
                                          "main-header-image"
                                        );
                                      if (mainImg) {
                                        mainImg.src = screenshot.path_full;
                                        mainImg.alt = game.name;
                                        // Update the game name text
                                        const nameText =
                                          document.getElementById(
                                            "header-game-name"
                                          );
                                        if (nameText)
                                          nameText.textContent = game.name;
                                      }
                                    }}
                                  />
                                ))
                            )}
                        </div>
                        <p
                          id="header-game-name"
                          className="text-accent absolute bottom-20 left-0 p-2 w-full 
                    [text-shadow:_-1px_-1px_0_#000,_1px_-1px_0_#000,_-1px_1px_0_#000,_1px_1px_0_#000]"
                        >
                          {overviewGames[0].name}
                        </p>
                      </div>
                    )}
              </div>{" "}
              <div className="contaier mx-auto bg-base-100 w-full">
                {isDemo
                  ? renderDemoProfile()
                  : profileData && (
                      <div className="flex flex-col container mx-auto w-full justify-center items-center">
                        <img
                          className="rounded-xl m-2 mt-20"
                          src={profileData[0].avatarFull}
                          width="256"
                          height="256"
                          alt="profile image"
                        />
                        <h2 className="text-4xl mb-5">
                          {profileData[0].personaName}{" "}
                        </h2>
                        <div className="flex flex-col md:flex-row justify-center items-center">
                          <a
                            href={profileData[0].profileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <button className="btn btn-accent h-5 min-h-0 m-2 mb-3">
                              Steam
                              <img
                                src={SteamSVG}
                                alt="steam"
                                className="w-4 h-4"
                              />
                            </button>
                          </a>
                          <button
                            className="btn btn-accent h-5 min-h-0 m-2 mb-3"
                            onClick={() => {
                              console.log("Sync button clicked");
                              if (syncAllData) {
                                handleSyncAllData();
                              } else {
                                console.error("syncAllData is undefined");
                              }
                            }}
                            disabled={isSyncing || isFullySynced}
                          >
                            {isSyncing
                              ? "Syncing..."
                              : isFullySynced
                              ? "All Games Synced"
                              : "Sync all games"}
                            <img src={SyncSVG} alt="sync" className="w-4 h-4" />
                          </button>

                          <button
                            className="btn btn-accent h-5 min-h-0 m-2 mb-3"
                            onClick={() =>
                              document.getElementById("my_modal_3").showModal()
                            }
                            disabled={isSyncing || isAchievementsSynced}
                          >
                            {isSyncing
                              ? "Syncing..."
                              : isAchievementsSynced
                              ? "Achievements Synced"
                              : "Sync all achievements"}
                            <img src={SyncSVG} alt="sync" className="w-4 h-4" />
                          </button>
                          <dialog id="my_modal_3" className="modal">
                            <div className="modal-box">
                              <p className="mb-4">
                                <span className="text-secondary bg-black bold mr-1">
                                  Warning!
                                </span>
                                Syncing all achievements will take a while. Each
                                game will take 5-10 seconds each to sync. Do you
                                want to continue?
                              </p>
                              <div className="flex flex-row justify-around items-center">
                                <button
                                  className="btn mt-5 bg-accent text-black"
                                  onClick={() => {
                                    console.log(
                                      "Sync achievements button clicked"
                                    );
                                    if (syncAllAchievements) {
                                      handleSyncAllAchievements();
                                    } else {
                                      console.error(
                                        "syncAllAchievements is undefined"
                                      );
                                    }
                                  }}
                                >
                                  {" "}
                                  Yes, sync achievements
                                </button>
                                <div className="modal-action">
                                  <form method="dialog">
                                    <button className="btn btn-secondary text-white">
                                      Close window
                                    </button>
                                  </form>
                                </div>
                              </div>
                            </div>
                            <form method="dialog" className="modal-backdrop">
                              <button>close</button>
                            </form>
                          </dialog>
                          <button
                            className="btn btn-secondary h-5 min-h-0 m-2 mb-3"
                            onClick={handleLogout}
                          >
                            Logout
                            <img
                              src={LogoutSVG}
                              alt="logout"
                              className="w-4 h-4 svg-white"
                            />
                          </button>
                        </div>
                      </div>
                    )}
                <div role="tablist" className="tabs tabs-boxed">
                  <a
                    role="tab"
                    className={`tab ${
                      activeTab === "Overview"
                        ? "tab-active"
                        : "opacity-80 bg-primary bg-opacity-20 hover:bg-opacity-100"
                    }`}
                    onClick={() => handleTabChange("Overview")}
                  >
                    Overview
                  </a>
                  <a
                    role="tab"
                    className={`tab ${
                      activeTab === "Games"
                        ? "tab-active"
                        : "opacity-80 bg-primary bg-opacity-20 hover:bg-opacity-100"
                    }`}
                    onClick={() => handleTabChange("Games")}
                  >
                    Games
                  </a>
                  <a
                    role="tab"
                    className={`tab ${
                      activeTab === "Achievements"
                        ? "tab-active"
                        : "opacity-80 bg-primary bg-opacity-20 hover:bg-opacity-100"
                    }`}
                    onClick={() => handleTabChange("Achievements")}
                  >
                    Achievements
                  </a>
                  <a
                    role="tab"
                    className={`tab ${
                      activeTab === "Advisor"
                        ? "tab-active"
                        : "opacity-80 bg-primary bg-opacity-20 hover:bg-opacity-100"
                    }`}
                    onClick={() => handleTabChange("Advisor")}
                  >
                    Advisor
                  </a>
                </div>
                <div className="overflow-x-auto flex flex-col lg:flex-row w-[100%] mx-auto self-center justify-center items-center">
                  {activeTab === "Overview" &&
                    (isDemo ? (
                      renderDemoOverview()
                    ) : (
                      <div className="flex flex-col xl:flex-row">
                        <div className="w-full flex flex-col lg:flex-row items-start gap-4 p-4">
                          <div className="w-full lg:w-1/2">
                            <div className="grid grid-cols-1 gap-4">
                              <p className="text-center text-2xl flex-1">
                                <span className="font-bold">RECENT</span>GAMES
                                <button
                                  className="btn bg-accent h-5 min-h-0 m-2"
                                  onClick={() => fetchOverviewGames()}
                                >
                                  <img
                                    src={SyncSVG}
                                    alt="sync"
                                    className="w-4 h-4"
                                  />
                                </button>
                              </p>
                              {Array.isArray(overviewGames) &&
                              overviewGames.length > 0 ? (
                                overviewGames.slice(0, 5).map((game) => {
                                  const achievements = Array.isArray(
                                    allAchievements
                                  )
                                    ? allAchievements.filter(
                                        (achievement) =>
                                          achievement.gameName === game.name
                                      )
                                    : [];
                                  return (
                                    <div
                                      key={game.appid}
                                      className="bg-primary rounded-xl p-4 shadow-xl text-white"
                                    >
                                      <div className="flex flex-row lg:flex-col items-center space-y-4">
                                        <div>
                                          <div className="rounded-xl w-[100%] max-w-[272px] aspect-[460/215] overflow-hidden">
                                            <img
                                              src={game.headerImage}
                                              onError={(e) =>
                                                handleImageError(e, game.appid)
                                              }
                                              alt="Game image"
                                              className="object-cover w-full h-full"
                                            />
                                          </div>
                                        </div>
                                        <div className="w-full text-center flex justify-center lg:text-left space-y-2">
                                          <div className="font-bold text-xl">
                                            <Link
                                              to={`/game/${game.appid}`}
                                              className="hover:text-accent"
                                            >
                                              {game.name ||
                                                `Game ID: ${game.appid}`}
                                            </Link>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })
                              ) : (
                                <div className="text-center p-4">
                                  No games to display
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="w-full lg:w-1/2 card">
                            <p className="text-center text-2xl flex-1 pb-1">
                              <span className="font-bold">RECENT</span>
                              ACHIEVEMENTS
                            </p>

                            <div className="card-body p-4 rounded-xl">
                              <div className="grid grid-cols-1 gap-2">
                                {recentAchievements.length > 0 ? (
                                  recentAchievements.map((achievement) => (
                                    <div
                                      key={`${achievement.appId}-${achievement.apiname}`}
                                      className="bg-primary text-white rounded-xl shadow-xl p-4"
                                    >
                                      <div className="flex items-center space-x-4">
                                        <div className="avatar">
                                          <div className="rounded-xl h-[64px] w-[64px]">
                                            {achievement.icon ? (
                                              <img
                                                src={achievement.icon}
                                                alt={
                                                  achievement.displayName ||
                                                  achievement.name ||
                                                  "Achievement icon"
                                                }
                                              />
                                            ) : (
                                              <div className="bg-gray-300 h-full w-full flex items-center justify-center">
                                                No Icon
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                        <div className="flex-grow">
                                          <div className="font-bold">
                                            {achievement.displayName ||
                                              achievement.name ||
                                              "Unknown Achievement"}
                                          </div>
                                          <div className="text-sm mt-1">
                                            <span className="text-accent">
                                              {achievement.gameName ||
                                                "Unknown Game"}
                                            </span>{" "}
                                            •
                                            <span className="ml-2">
                                              {achievement.unlocktime
                                                ? new Date(
                                                    achievement.unlocktime *
                                                      1000
                                                  ).toLocaleString()
                                                : "Unknown"}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-center p-4">
                                    No recent achievements
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Perfect Games section */}
                        <div className="w-[100%] xl:w-[50%] mx-auto">
                          <div className="grid grid-cols-1 gap-4">
                            <p className="text-center text-2xl flex-1 mt-4 mb-1">
                              <span className="font-bold">PERFECT</span>GAMES
                            </p>
                            {isDemo ? (
                              <div className="bg-primary rounded-xl p-4 shadow-xl">
                                <div className="flex flex-row lg:flex-col items-center space-y-4">
                                  <div>
                                    <div className="rounded-xl w-[100%] xl:w-[50%] max-w-[272px] aspect-[460/215] overflow-hidden">
                                      <img
                                        src="https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg?t=1711626984"
                                        alt="Game image"
                                        className="object-cover w-full h-full"
                                      />
                                    </div>
                                  </div>
                                  <div className="w-full text-center lg:text-left space-y-2">
                                    <div className="font-bold text-xl">
                                      ELDEN RING
                                    </div>
                                    <div className="text-sm">
                                      Achievements:{" "}
                                      <span className="text-success font-bold">
                                        42/42
                                      </span>
                                    </div>
                                    <div className="text-sm">
                                      Time Played:{" "}
                                      <span className="text-accent">
                                        157 hours
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              Array.isArray(gamesToDisplay) &&
                              gamesToDisplay
                                .filter((game) => {
                                  const achievements = Array.isArray(
                                    allAchievements
                                  )
                                    ? allAchievements.filter(
                                        (achievement) =>
                                          achievement.gameName === game.gameName
                                      )
                                    : [];

                                  const earnedAchievements =
                                    achievements.filter(
                                      (achievement) => achievement.achieved
                                    ).length;
                                  const totalAchievements = achievements.length;

                                  return (
                                    totalAchievements > 0 &&
                                    earnedAchievements === totalAchievements
                                  );
                                })
                                .map((game) => {
                                  const achievements = Array.isArray(
                                    allAchievements
                                  )
                                    ? allAchievements.filter(
                                        (achievement) =>
                                          achievement.gameName === game.gameName
                                      )
                                    : [];

                                  const totalAchievements = achievements.length;

                                  return (
                                    <div
                                      key={`perfect-${game.appid}`}
                                      className="bg-primary text-white rounded-xl p-4 shadow-xl"
                                    >
                                      <div className="flex flex-row lg:flex-col items-center space-y-4">
                                        <div>
                                          <div className="rounded-xl w-[100%] xl:[50%] max-w-[272px] aspect-[460/215] overflow-hidden">
                                            <img
                                              src={game.headerImage}
                                              onError={(e) =>
                                                handleImageError(e, game.appid)
                                              }
                                              alt="Game image"
                                              className="object-cover w-full h-full"
                                            />
                                          </div>
                                        </div>
                                        <div className="w-full text-center lg:text-left space-y-2">
                                          <div className="font-bold text-xl flex items-center justify-center">
                                            <Link
                                              to={`/game/${game.appid}`}
                                              className="hover:text-accent"
                                            >
                                              {game.name ||
                                                game.gameName ||
                                                `Game ID: ${game.appid}`}
                                            </Link>
                                            <img
                                              src={AwardSVG}
                                              alt="award"
                                              className="w-8 h-8 ml-2 svg-accent"
                                            />
                                          </div>
                                          <div className="text-sm flex items-center justify-center">
                                            Achievements:{" "}
                                            <span className="text-accent font-bold ml-1">
                                              {totalAchievements}/
                                              {totalAchievements}
                                            </span>
                                          </div>
                                          <div className="text-sm flex items-center justify-center">
                                            Time Played:{" "}
                                            <span className="text-accent ml-1">
                                              {Math.round(
                                                game.playtime_forever / 60
                                              )}{" "}
                                              hours
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })
                            )}
                            {!isDemo &&
                              (!Array.isArray(gamesToDisplay) ||
                                !gamesToDisplay.some((game) => {
                                  const achievements = Array.isArray(
                                    allAchievements
                                  )
                                    ? allAchievements.filter(
                                        (achievement) =>
                                          achievement.gameName === game.gameName
                                      )
                                    : [];
                                  const earnedAchievements =
                                    achievements.filter(
                                      (achievement) => achievement.achieved
                                    ).length;
                                  const totalAchievements = achievements.length;
                                  return (
                                    totalAchievements > 0 &&
                                    earnedAchievements === totalAchievements
                                  );
                                })) && (
                                <div className="text-center p-4">
                                  No perfect games yet. Keep going!
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                    ))}

                  {activeTab === "Games" &&
                    (isDemo ? (
                      renderDemoGames()
                    ) : (
                      <div>
                        <div className="flex flex-row justify-center items-center mt-4">
                          <label className="input input-bordered flex items-center gap-2 w-[50%]">
                            <input
                              type="text"
                              className="grow"
                              placeholder="Search Games"
                              value={searchTerm}
                              onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                                setCurrentGamePage(1);
                              }}
                            />
                            <svg
                              xmlns="https://www.w3.org/2000/svg"
                              viewBox="0 0 16 16"
                              fill="currentColor"
                              className="h-4 w-4 opacity-70"
                            >
                              <path
                                fillRule="evenodd"
                                d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </label>
                        </div>

                        <div className="grid grid-cols-1 gap-4 mx-5 mt-4">
                          {(() => {
                            // Filter and process games
                            const processedGames = gamesToDisplay
                              .filter((game) => game.playtime_forever > 0)
                              .map((game) => {
                                const achievements = allAchievements.filter(
                                  (achievement) =>
                                    achievement.gameName === game.gameName
                                );
                                const earnedAchievements = achievements.filter(
                                  (achievement) => achievement.achieved
                                ).length;
                                const totalAchievements = achievements.length;

                                const totalGlobalPercentages =
                                  achievements.reduce(
                                    (sum, a) =>
                                      sum +
                                      (a.percent ? parseFloat(a.percent) : 0),
                                    0
                                  );
                                const averageGlobalPercentage =
                                  achievements.length > 0
                                    ? (
                                        totalGlobalPercentages /
                                        achievements.length
                                      ).toFixed(1)
                                    : 0;

                                return {
                                  ...game,
                                  earnedAchievements,
                                  totalAchievements,
                                  percent: Number(averageGlobalPercentage),
                                };
                              })
                              .filter((game) => {
                                const searchString = `${game.gameName || ""} ${
                                  game.appid || ""
                                }`.toLowerCase();
                                return searchString.includes(
                                  searchTerm.toLowerCase()
                                );
                              })
                              .sort(
                                (a, b) =>
                                  b.earnedAchievements - a.earnedAchievements
                              );

                            const totalGames = processedGames.length;
                            const totalPages = Math.ceil(totalGames / 10); // 10 games per page
                            const startIndex = (currentGamePage - 1) * 10;
                            const endIndex = startIndex + 10;
                            const currentPageGames = processedGames.slice(
                              startIndex,
                              endIndex
                            );

                            return currentPageGames.map((game, index) => (
                              <div
                                key={game.appid}
                                className="bg-primary rounded-xl p-4 shadow-xl"
                              >
                                <div className="flex flex-col items-center justify-center text-center lg:flex-row space-y-4">
                                  <div>
                                    <div className="rounded-xl w-[100%] max-w-[272px] aspect-[460/215] overflow-hidden">
                                      <img
                                        src={game.headerImage}
                                        onError={(e) =>
                                          handleImageError(e, game.appid)
                                        }
                                        alt="Game image"
                                        className="object-cover w-full h-full"
                                      />
                                    </div>
                                  </div>
                                  <div className="w-full text-center lg:text-left space-y-2 m-4">
                                    <div className="font-bold text-xl">
                                      <Link
                                        to={`/game/${game.appid}`}
                                        className="hover:text-accent"
                                      >
                                        {game.gameName}
                                      </Link>
                                    </div>
                                    <div className="flex items-center justify-center lg:justify-start space-x-2">
                                      <progress
                                        className="progress progress-accent w-56"
                                        value={
                                          game.totalAchievements
                                            ? (game.earnedAchievements /
                                                game.totalAchievements) *
                                              100
                                            : 0
                                        }
                                        max="100"
                                      ></progress>
                                      <span className="text-sm">
                                        {game.earnedAchievements}/
                                        {game.totalAchievements}
                                      </span>
                                    </div>
                                    <div className="text-sm space-y-1">
                                      Average Global Completion:{" "}
                                      <span className="text-accent">
                                        {game.percent}%
                                      </span>
                                      <div>
                                        Time Played:{" "}
                                        <span className="text-accent">
                                          {Math.round(
                                            game.playtime_forever / 60
                                          )}{" "}
                                          hours
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex flex-col gap-2">
                                    <button
                                      className="btn bg-accent btn-xs text-black whitespace-nowrap"
                                      onClick={() =>
                                        syncIndividualGameAchievements(
                                          game.appid
                                        )
                                      }
                                    >
                                      Sync Achievements
                                    </button>
                                    <button className="btn bg-secondary btn-xs text-white">
                                      <Link
                                        to={`/game/${game.appid}`}
                                        className="hover:text-accent"
                                      >
                                        Game Page →
                                      </Link>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ));
                          })()}
                        </div>

                        <div className="join mt-4 mb-4 flex justify-center">
                          <button
                            className="join-item btn"
                            onClick={prevGamePage}
                            disabled={currentGamePage === 1}
                          >
                            «
                          </button>
                          <button className="join-item btn">
                            Page {currentGamePage} of{" "}
                            {(() => {
                              const filteredGames = gamesToDisplay
                                .filter((game) => game.playtime_forever > 0)
                                .filter((game) => {
                                  const searchString = `${
                                    game.gameName || ""
                                  } ${game.appid || ""}`.toLowerCase();
                                  return searchString.includes(
                                    searchTerm.toLowerCase()
                                  );
                                });
                              return Math.ceil(filteredGames.length / 10);
                            })()}
                          </button>
                          <button
                            className="join-item btn"
                            onClick={nextGamePage}
                            disabled={(() => {
                              const filteredGames = gamesToDisplay
                                .filter((game) => game.playtime_forever > 0)
                                .filter((game) => {
                                  const searchString = `${
                                    game.gameName || ""
                                  } ${game.appid || ""}`.toLowerCase();
                                  return searchString.includes(
                                    searchTerm.toLowerCase()
                                  );
                                });
                              const totalPages = Math.ceil(
                                filteredGames.length / 10
                              );
                              return currentGamePage >= totalPages;
                            })()}
                          >
                            »
                          </button>
                        </div>
                      </div>
                    ))}

                  {activeTab === "Achievements" &&
                    (isDemo ? (
                      renderDemoAchievements()
                    ) : (
                      <div className="flex flex-col justify-center items-center m-5">
                        <label className="input input-bordered flex items-center gap-2 w-[50%]">
                          <input
                            type="text"
                            className="grow"
                            placeholder="Search Achievements"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                          <svg
                            xmlns="https://www.w3.org/2000/svg"
                            viewBox="0 0 16 16"
                            fill="currentColor"
                            className="h-4 w-4 opacity-70"
                          >
                            <path
                              fillRule="evenodd"
                              d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </label>
                        <div className="grid grid-cols-1 gap-4 mx-5 mt-4">
                          {filteredAchievements.currentAchievements.length >
                          0 ? (
                            filteredAchievements.currentAchievements.map(
                              (achievement, index) => (
                                <div
                                  key={`${achievement.appId}-${achievement.apiname}`}
                                  className="bg-primary rounded-xl p-4 shadow-xl"
                                >
                                  <div className="flex items-center space-x-4">
                                    <div className="avatar">
                                      <div className="rounded-xl h-[64px] w-[64px]">
                                        {achievement.achieved === 0 ? (
                                          <img
                                            src={achievement.icongray}
                                            style={{ opacity: "0.5" }}
                                            alt="Locked Achievement"
                                          />
                                        ) : achievement.icon ? (
                                          <img
                                            src={achievement.icon}
                                            alt={
                                              achievement.displayName ||
                                              achievement.name ||
                                              "Achievement icon"
                                            }
                                          />
                                        ) : (
                                          <div className="bg-gray-300 h-full w-full flex items-center justify-center">
                                            No Icon
                                          </div>
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
                                        {achievement.description ||
                                          "No description available"}
                                      </div>
                                      <div className="text-sm mt-1">
                                        <span className="text-accent">
                                          {achievement.gameName}
                                        </span>{" "}
                                        •
                                        <span className="ml-2">
                                          {achievement.unlocktime
                                            ? new Date(
                                                achievement.unlocktime * 1000
                                              ).toLocaleString()
                                            : "Locked Achievement"}{" "}
                                          •
                                        </span>
                                        <span className="ml-2 text-accent">
                                          Earned by{" "}
                                          {parseFloat(
                                            achievement.percent || 0
                                          ).toFixed(1)}
                                          % of players
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )
                            )
                          ) : (
                            <div className="text-center p-4">
                              No achievements match your search
                            </div>
                          )}
                        </div>
                        <div className="join mt-4 mb-4">
                          <button
                            className="join-item btn"
                            onClick={prevPage}
                            disabled={currentPage === 1}
                          >
                            «
                          </button>
                          <button className="join-item btn">
                            Page {currentPage} of{" "}
                            {filteredAchievements.totalPages}
                          </button>
                          <button
                            className="join-item btn"
                            onClick={nextPage}
                            disabled={
                              currentPage === filteredAchievements.totalPages
                            }
                          >
                            »
                          </button>
                        </div>
                      </div>
                    ))}

                  {activeTab === "Advisor" &&
                    (isDemo ? (
                      renderDemoAdvisor()
                    ) : isFullySynced ? (
                      <div className="flex flex-col">
                        <h2 className="text-1xl text-center pt-2 pb-2 mr-5 ml-5 rounded-xl mt-5 mb-5 italic">
                          Advisor is based on your synced achievements
                        </h2>
                        <h1 className="text-2xl pt-2 pb-2 mr-5 ml-5 mt-5 mb-5">
                          <span className="font-bold">NEXT</span>GAMES:
                        </h1>
                        <div className="min-w-full flex flex-col bg-primary rounded-xl">
                          <table className="w-full">
                            <tbody>
                              {gamesToDisplay
                                .filter((game) => {
                                  // Only include games that have achievements
                                  const achievements = allAchievements.filter(
                                    (achievement) =>
                                      achievement.gameName === game.gameName
                                  );
                                  return achievements.length > 0;
                                })
                                .map((game) => {
                                  const achievements = allAchievements.filter(
                                    (achievement) =>
                                      achievement.gameName === game.gameName
                                  );
                                  const completedAchievements =
                                    achievements.filter(
                                      (a) => a.achieved
                                    ).length;
                                  const totalAchievements = achievements.length;
                                  const completionRate =
                                    totalAchievements > 0
                                      ? completedAchievements /
                                        totalAchievements
                                      : 0;

                                  const totalGlobalPercentages =
                                    achievements.reduce(
                                      (sum, a) =>
                                        sum + (parseFloat(a.percent) || 0),
                                      0
                                    );
                                  const averageGlobalPercentage =
                                    achievements.length > 0
                                      ? (
                                          totalGlobalPercentages /
                                          achievements.length
                                        ).toFixed(1)
                                      : "0";

                                  return {
                                    ...game,
                                    completionRate,
                                    completedAchievements,
                                    totalAchievements,
                                    averageGlobalPercentage: Number(
                                      averageGlobalPercentage
                                    ),
                                  };
                                })
                                .filter((game) => game.completionRate < 1)
                                .sort(
                                  (a, b) =>
                                    b.averageGlobalPercentage -
                                    a.averageGlobalPercentage
                                )
                                .slice((advisorPage - 1) * 10, advisorPage * 10)
                                .map((game) => (
                                  <tr
                                    key={game.appid}
                                    className="hover:bg-primary hover:bg-opacity-10 transition-colors"
                                  >
                                    <td className="p-4">
                                      <img
                                        src={
                                          game.headerImage ||
                                          `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/header.jpg`
                                        }
                                        alt={game.gameName}
                                        onError={(e) =>
                                          handleImageError(e, game.appid)
                                        }
                                        className="w-full h-auto rounded-lg"
                                      />
                                    </td>
                                    <td className="p-4">
                                      <div className="font-semibold text-lg">
                                        <Link
                                          to={`/game/${game.appid}`}
                                          className="hover:text-accent"
                                        >
                                          {game.gameName}
                                        </Link>
                                      </div>
                                      <div className="text-sm text-white">
                                        Average Global Completion:{" "}
                                        <span className="text-accent">
                                          {game.averageGlobalPercentage}%
                                        </span>
                                      </div>
                                      <div className="text-sm text-white">
                                        Your Completion:{" "}
                                        <span className="text-accent">
                                          {game.completedAchievements}/
                                          {game.totalAchievements}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="p-4">
                                      <div className="flex items-center space-x-2">
                                        <span className="text-accent">
                                          {game.playtime_forever
                                            ? Math.round(
                                                game.playtime_forever / 60
                                              )
                                            : 0}{" "}
                                          hours
                                        </span>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="flex justify-center mt-4 mb-4 space-x-2">
                          <button
                            onClick={() =>
                              setAdvisorPage((prev) => Math.max(1, prev - 1))
                            }
                            disabled={advisorPage === 1}
                            className="px-4 py-2 bg-primary text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Previous
                          </button>
                          <span className="px-4 py-2">Page {advisorPage}</span>
                          <button
                            onClick={() => setAdvisorPage((prev) => prev + 1)}
                            disabled={
                              gamesToDisplay.filter((game) => {
                                const achievements = allAchievements.filter(
                                  (achievement) =>
                                    achievement.gameName === game.gameName
                                );
                                const completedAchievements =
                                  achievements.filter((a) => a.achieved).length;
                                const totalAchievements = achievements.length;
                                return (
                                  totalAchievements > 0 &&
                                  completedAchievements / totalAchievements < 1
                                );
                              }).length <=
                              advisorPage * 10
                            }
                            className="px-4 py-2 bg-primary text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Next
                          </button>
                        </div>

                        <div className="container mx-auto mb-5">
                          <h1 className="text-2xl pt-2 pb-2 mr-5 ml-5 mt-5 mb-5">
                            <span className="font-bold">NEXT</span>ACHIEVEMENTS:
                          </h1>
                          <div className="grid grid-cols-1 gap-4 mx-5">
                            {allAchievements
                              .filter((achievement) => !achievement.achieved)
                              .sort(
                                (a, b) =>
                                  parseFloat(b.percent || 0) -
                                  parseFloat(a.percent || 0)
                              )
                              .slice(0, 10)
                              .map((achievement, index) => (
                                <div
                                  key={`${
                                    achievement.appId || achievement.gameId
                                  }-${achievement.apiname || achievement.name}`}
                                  className="bg-primary rounded-xl p-4 shadow-xl"
                                >
                                  <div className="flex items-center space-x-4">
                                    <div className="avatar">
                                      <div className="rounded-xl h-[64px] w-[64px]">
                                        {achievement.icongray ? (
                                          <img
                                            src={achievement.icongray}
                                            alt={
                                              achievement.displayName ||
                                              achievement.name
                                            }
                                            style={{ opacity: "0.7" }}
                                          />
                                        ) : achievement.icon ? (
                                          <img
                                            src={achievement.icon}
                                            alt={
                                              achievement.displayName ||
                                              achievement.name
                                            }
                                            style={{ opacity: "0.7" }}
                                          />
                                        ) : (
                                          <div className="bg-gray-300 h-full w-full flex items-center justify-center">
                                            No Icon
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex-grow">
                                      <div className="font-bold">
                                        {achievement.displayName ||
                                          achievement.name}
                                      </div>
                                      <div className="text-sm opacity-70">
                                        {achievement.description ||
                                          "No description available"}
                                      </div>
                                      <div className="text-sm mt-1">
                                        <span className="text-accent">
                                          {achievement.gameName ||
                                            "Unknown Game"}
                                        </span>{" "}
                                        •
                                        <span className="ml-2">
                                          <span className="text-accent mr-1">
                                            {parseFloat(
                                              achievement.percent || 0
                                            ).toFixed(1)}
                                            %
                                          </span>
                                          of players have this
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-2xl text-center pt-2 pb-2 bg-neutral mr-5 ml-5 rounded-xl mt-5 mb-5">
                          Advisor requires fully synced data, hit the sync all
                          button under your profile avatar above.
                        </p>
                      </div>
                    ))}
                </div>{" "}
                {/* Close the overflow-x-auto div */}
                <footer className="footer footer-center bg-primary text-primary-content p-10 mt-10">
                  <aside>
                    <a href="https://github.com/c0deV1king">
                      <img
                        src={GithubSVG}
                        alt="github"
                        className="w-[64px] h-[64px] github-logo"
                      />
                    </a>
                    <p className="font-bold">
                      Created with ♥️ by c0dev1king
                      <br />
                    </p>
                    <p>
                      SteamTracker is not an official Steam product. The Steam
                      name, logo, and related trademarks are trademarks of Valve
                      Corporation. Valve Corporation is not affiliated with
                      SteamTracker.
                    </p>
                  </aside>
                </footer>
              </div>{" "}
            </div>
          }
        />
      </Routes>
    </>
  );
}
