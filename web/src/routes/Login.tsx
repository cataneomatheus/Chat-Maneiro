import type { FormEvent } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const STORAGE_KEY = 'chat-nickname';

const LoginPage = () => {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState(() => localStorage.getItem(STORAGE_KEY) ?? '');
  const [error, setError] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = nickname.trim();

    if (!trimmed) {
      setError('Informe um apelido para entrar no chat.');
      return;
    }

    localStorage.setItem(STORAGE_KEY, trimmed);
    navigate('/chat');
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 px-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900/80 p-8 shadow-xl ring-1 ring-slate-800">
        <h1 className="text-center text-3xl font-semibold text-white">Chat Maneiro</h1>
        <p className="mt-2 text-center text-sm text-slate-400">
          Escolha um apelido para entrar na sala.
        </p>
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-200" htmlFor="nickname">
              Apelido
            </label>
            <input
              autoFocus
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
              id="nickname"
              maxLength={24}
              onChange={(event) => {
                setNickname(event.target.value);
                if (error) {
                  setError('');
                }
              }}
              placeholder="Digite seu apelido"
              value={nickname}
            />
            {error ? <p className="text-sm text-red-400">{error}</p> : null}
          </div>
          <button
            className="w-full rounded-lg bg-sky-500 px-4 py-3 text-sm font-semibold tracking-wide text-white transition hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-900"
            type="submit"
          >
            Entrar no chat
          </button>
        </form>
      </div>
    </main>
  );
};

export default LoginPage;
