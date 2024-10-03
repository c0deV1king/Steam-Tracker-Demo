export const randomDelay = () => {
    const min = 75;
    const max = 300;
    return Math.floor(Math.random() * (max - min + 1) + min);
  };
  
  export const delayedFetch = async (url, options = {}) => {
    await new Promise(resolve => setTimeout(resolve, randomDelay()));
    return fetch(url, options);
  };