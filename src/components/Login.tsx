// In your Login component
import React, { FormEvent, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

  const {userSettings, setUserSettings, login} = useContext(UserContext);

  useEffect(() => {
   // clear token in context
   setUserSettings({...userSettings, token: undefined});
  }, []);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault(); // Prevent the form from refreshing the page
    // validate data
    if (!email || !password) {
      toast.error('Email and password are required');
      return;
    }
    try {
      login(email, password);
      navigate('/');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <form className="w-full max-w-xs" onSubmit={handleLogin}>
      <div className="mb-4"></div>
      <div className="md:flex md:items-center mb-3">
        <div className="md:w-1/3">
          <label className="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4" htmlFor="user-email">Email</label>
        </div>
        <div className="md:w-2/3">
          <input
            className="flex-grow rounded-md border dark:text-gray-100 dark:bg-gray-850 dark:border-white/20 px-2 py-1"
            id="user-email"
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />
        </div>
      </div>
      <div className="md:flex md:items-center mb-3">
        <div className="md:w-1/3">
          <label className="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4" htmlFor="user-password">Password</label>
        </div>
        <div className="md:w-2/3">
          <input
            className="flex-grow rounded-md border dark:text-gray-100 dark:bg-gray-850 dark:border-white/20 px-2 py-1"
            id="user-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
        </div>
      </div>
      <div className="md:flex md:items-center">
        <div className="md:w-1/3"></div>
        <div className="md:w-2/3">
          <button
            className="rounded-md border dark:border-white/20 p-1"
            onClick={handleLogin}
          >Login</button>
        </div>
      </div>
      <div className="mb-4">&nbsp;</div>
      <div className="md:flex md:items-center">
        <div className="md:w-1/3"></div>
        <div className="md:w-2/3">
          <p className="mt-2 text-gray-500 dark:text-gray-300">
            <a href="/register" onClick={(e) => {e.preventDefault(); navigate('/register');}}>Register</a> or <a href="/forgot-password" onClick={(e) => {e.preventDefault();navigate('/forgot-password');}}>Forgot password</a>
          </p>
        </div>
      </div>
    </form>
  );
};

export default Login;