import { useState, useCallback } from "react";

export const achievementPages = (allAchievements) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [achievementsPerPage] = useState(30);

    const getCurrentPageAchievements = useCallback((gameid) => {
        const achievements = allAchievements[gameid] || [];
        const indexOfLastAchievement = currentPage * achievementsPerPage;
        const indexOfFirstAchievement = indexOfLastAchievement - achievementsPerPage;

        return achievements.slice(indexOfFirstAchievement, indexOfLastAchievement);
    }, [allAchievements, currentPage, achievementsPerPage]);

    const nextPage = useCallback(() => {
        setCurrentPage((prevPage) => prevPage + 1);
    }, []);

    const prevPage = useCallback(() => {
        setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
    }, []);

    const goToPage = useCallback((pageNumber) => {
        setCurrentPage(pageNumber);
    }, []);

    const getTotalPages = useCallback((gameid) => {
        const achievements = allAchievements[gameid] || [];
        return Math.ceil(achievements.length / achievementsPerPage);
    }, [allAchievements, achievementsPerPage]);

    return {
        currentPage,
        setCurrentPage,
        achievementsPerPage,
        getCurrentPageAchievements,
        nextPage,
        prevPage,
        goToPage,
        getTotalPages
    }
}