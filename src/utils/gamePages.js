import { useState, useCallback } from "react";

export const gamePages = (gamesToDisplay) => {
  const [currentGamePage, setCurrentGamePage] = useState(1);
  const [gamesPerPage] = useState(30);

  const getCurrentPageGames = useCallback(
    (gameid) => {
      const games = gamesToDisplay[gameid] || [];
      const indexOfLastGame = currentGamePage * gamesPerPage;
      const indexOfFirstGame = indexOfLastGame - gamesPerPage;

      return games.slice(indexOfFirstGame, indexOfLastGame);
    },
    [gamesToDisplay, currentGamePage, gamesPerPage]
  );

  const nextGamePage = useCallback(() => {
    setCurrentGamePage((prevGamePage) => prevGamePage + 1);
  }, []);

  const prevGamePage = useCallback(() => {
    setCurrentGamePage((prevGamePage) => Math.max(prevGamePage - 1, 1));
  }, []);

  const goToGamePage = useCallback((pageNumber) => {
    setCurrentGamePage(pageNumber);
  }, []);

  const getTotalGamePages = useCallback(
    (gameid) => {
      const games = gamesToDisplay[gameid] || [];
      return Math.ceil(games.length / gamesPerPage);
    },
    [gamesToDisplay, gamesPerPage]
  );

  return {
    currentGamePage,
    setCurrentGamePage,
    gamesPerPage,
    getCurrentPageGames,
    nextGamePage,
    prevGamePage,
    goToGamePage,
    getTotalGamePages,
  };
};
