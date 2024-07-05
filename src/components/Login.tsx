// In your Login component
import React, { useState } from 'react';
import { AUTH_ENDPOINT } from '../constants/apiEndpoints';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

  const handleLogin = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault(); // Prevent the form from refreshing the page
    try {
      const response = await fetch(AUTH_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.status === 200) {
        const { token, user } = data.data;
        // Store the token in local storage or context
        localStorage.setItem('userToken', token);
        localStorage.setItem('userSettings', JSON.stringify(user.settings));
        // redirect to home page
        navigate('/');
      } else {
        console.error('Login failed:', data.message);
        // show toast
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Login failed: ' + (error as Error).message);
    }
  };

  return (
    <form className="w-full max-w-xs">
      <div className="md:flex md:items-center mb-3">
        <div className="md:w-1/3">
          <label className="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4" htmlFor="login-email">Email</label>
        </div>
        <div className="md:w-2/3">
          <input
            className="flex-grow rounded-md border dark:text-gray-100 dark:bg-gray-850 dark:border-white/20 px-2 py-1"
            id="login-email"
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />
        </div>
      </div>
      <div className="md:flex md:items-center mb-3">
        <div className="md:w-1/3">
          <label className="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4" htmlFor="login-password">Password</label>
        </div>
        <div className="md:w-2/3">
          <input
            className="flex-grow rounded-md border dark:text-gray-100 dark:bg-gray-850 dark:border-white/20 px-2 py-1"
            id="login-password"
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
      <div className="md:flex md:items-center">
        <div className="md:w-1/3"></div>
        <div className="md:w-2/3">
          <p className="mt-2 text-gray-500 dark:text-gray-300">
            <a href="/register">Register</a> or <a href="/forgot-password">Forgot password</a>
          </p>
        </div>
      </div>
    </form>
  );
};

export default Login;