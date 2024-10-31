import React, { useState, useEffect } from 'react';
import SteamLogin from './SteamLogin';
import { useSteamData } from '../hooks/useSteamData';
import GithubSVG from '../img/github.svg?react';

const AuthPage = ({ onLogin, onDemoLogin }) => {
  const [steamId, setSteamId] = useState('');


  useEffect(() => {
    // Load saved credentials from localStorage on component mount
    const savedSteamId = localStorage.getItem('steamId');
    if (savedSteamId) setSteamId(savedSteamId);
  }, []);


  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically validate the credentials
    localStorage.setItem('steamId', steamId);
    onLogin();
    window.location.reload();
  };

  const handleDemoLogin = () => {
    onDemoLogin();
    window.location.reload();
  };

  const handleSteamIdReceived = (receivedSteamId) => {
    setSteamId(receivedSteamId);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-base-100 p-8 rounded-lg shadow-lg w-96 border border-black">
        <h1 className="text-3xl mb-6 text-center"><span className="font-bold">STEAM</span>TRACKER</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="steamId" className="block mb-2">Steam ID</label>
            <input
              type="text"
              id="steamId"
              value={steamId}
              onChange={(e) => setSteamId(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <button type="submit" className="w-full btn btn-primary mb-4">
            Authenticate
          </button>
        </form>
        <div className="text-center flex flex-col justify-center items-center">
          <p className="mb-2">Or</p>
          <SteamLogin onSteamIdReceived={handleSteamIdReceived} />
        </div>
        <button
          onClick={handleDemoLogin}
          className="w-full btn btn-accent mt-4"
        > Try Demo Mode
        </button>

        <div className='flex flex-col justify-center items-center'>
          <a href="https://github.com/c0dev1king" target="_blank" rel="noopener noreferrer"><GithubSVG className='github-logo w-[32px] h-[32px] fill-black mt-4' /></a>
        </div>

      </div>
    </div>
  );
};

export { AuthPage };
