import React, { useState, useEffect } from 'react';
import SteamLogin from './SteamLogin';
import { useSteamData } from '../hooks/useSteamData';
import GithubSVG from '../img/github.svg?react';
import { ChangelogPage } from './ChangelogPage';

const AuthPage = ({ onLogin, onDemoLogin }) => {
  const [steamId, setSteamId] = useState('');

  useEffect(() => {
    const savedSteamId = localStorage.getItem('steamId');
    if (savedSteamId) setSteamId(savedSteamId);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
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

        <div className='flex flex-row justify-center items-center mt-4'>
          <button className="btn hover:text-accent text-sm italic bg-transparent border-none hover:bg-transparent font-normal p-0" onClick={() => document.getElementById('my_modal_3').showModal()}>&lt;changelog /&gt;</button>
          <dialog id="my_modal_3" className="modal">
            <div className="modal-box">
              <form method="dialog">
                <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
              </form>
              <ChangelogPage />
            </div>
          </dialog>
        </div>

      </div>
    </div>
  );
};

export { AuthPage };
