import React, { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AUTH_ENDPOINT } from '../constants/apiEndpoints';

const Register: React.FC = () => {
  const [domain, setDomain] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [rePassword, setRePassword] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');

  useEffect(() => {
    let errorString = '';
    if (password.length > 0 && password.length < 6) {
      errorString = '<li>Password must be at least 6 characters long</li>';
    }
    if (password.length > 0 && rePassword.length > 0 && password !== rePassword) {
      errorString += '<li>Passwords must match</li>';
    }
    if (errorString.length > 0) {
      errorString = `<ul>${errorString}</ul>`;
    }
    setPasswordError(errorString);
  }, [password, rePassword]);
  const navigate = useNavigate();

  const handleRegister = async (event: FormEvent) => {
    event.preventDefault();
    // validate data
    if (!domain || !email || !password || !rePassword) {
      toast.error('Domain, email, password and re-password are required');
      return;
    }
    try {
      const response = await fetch(`${AUTH_ENDPOINT}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ domain, email, password, re_password: rePassword }),
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
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Register failed: ' + (error as Error).message);
    }
  };

  return (
    <form className="w-full max-w-xs" onSubmit={handleRegister}>
      <div className="md:flex md:items-center mb-3">
        <div className="md:w-1/3">
          <label className="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4" htmlFor="user-domain">Domain</label>
        </div>
        <div className="md:w-2/3">
          <select
            className="w-full flex-grow rounded-md border dark:text-gray-100 dark:bg-gray-850 dark:border-white/20 px-2 py-1"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
          >
            <option value="">Select your domain</option>
            <option value="domain-1">Doamin #001</option>
            <option value="domain-2">Doamin #002</option>
          </select>
        </div>
      </div>
      <div className="md:flex md:items-center mb-3">
        <div className="md:w-1/3">
          <label className="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4" htmlFor="user-email">Email</label>
        </div>
        <div className="md:w-2/3">
          <input
            className="w-full flex-grow rounded-md border dark:text-gray-100 dark:bg-gray-850 dark:border-white/20 px-2 py-1"
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
            className="w-full flex-grow rounded-md border dark:text-gray-100 dark:bg-gray-850 dark:border-white/20 px-2 py-1"
            id="user-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
        </div>
      </div>
      <div className="md:flex md:items-center mb-3">
        <div className="md:w-1/3">
          <label className="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4" htmlFor="user-re-password">Re-Password</label>
        </div>
        <div className="md:w-2/3">
          <input
            className="w-full flex-grow rounded-md border dark:text-gray-100 dark:bg-gray-850 dark:border-white/20 px-2 py-1"
            id="user-re-password"
            type="password"
            value={rePassword}
            onChange={(e) => setRePassword(e.target.value)}
            placeholder="Re-Password"
          />
        </div>
      </div>
      <div className="md:flex md:items-center mb-3">
        <div className="md:w-1/3"></div>
        <div className="md:w-2/3">
          <div className="text-red-500" dangerouslySetInnerHTML={{ __html: passwordError }}></div>
        </div>
      </div>
      <div className="md:flex md:items-center">
        <div className="md:w-1/3"></div>
        <div className="md:w-2/3">
          <button
            className="rounded-md border dark:border-white/20 p-1 mr-2"
            onClick={handleRegister}
          >Register</button> or <button
            className="rounded-md border dark:border-white/20 p-1"
            onClick={() => navigate('/login')}
          >Login</button>
        </div>
      </div>
    </form>
  );
};

export default Register;