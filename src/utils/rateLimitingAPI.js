export const randomDelay = () => {
    const min = 400;
    const max = 1500;
    return Math.floor(Math.random() * (max - min + 1) + min);
  };
  
  export const delayedFetch = async (url, options = {}) => {
    await new Promise(resolve => setTimeout(resolve, randomDelay()));
    return fetch(url, options);
  };