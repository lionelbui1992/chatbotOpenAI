// In your Login component
import React, { FormEvent, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Auth from '../service/Auth';
import { UserContext } from '../UserContext';
import '../assets/styles/Login.css'
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

  const {userSettings, setUserSettings} = useContext(UserContext);

  useEffect(() => {
   // clear token in context
   setUserSettings({...userSettings, access_token: undefined});
  }, []);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault(); // Prevent the form from refreshing the page
    // validate data
    if (!email || !password) {
      toast.error('Email and password are required');
      return;
    }
    let user = await Auth.login(email, password);
    if (user) {
      // update token to context
      setUserSettings({
        ...userSettings,
        access_token: user.settings.access_token,
        refresh_token: user.settings.refresh_token,
        user_id: user.id,
        domain: user.domain,
        email: user.email,
        name: user.name,
        userTheme: user.settings.userTheme,
        theme: user.settings.theme,
        model: user.settings.model,
        instructions: user.settings.instructions,
        speechModel: user.settings.speechModel,
        speechVoice: user.settings.speechVoice,
        speechSpeed: user.settings.speechSpeed,
        googleAccessToken: user.settings.googleAccessToken,
        googleSelectedDetails: user.settings.googleSelectedDetails,
        tags: user.settings.tags,
      });

      // redirect to home page
      navigate('/');
    }
  };

  return (
     <div className="login-container">
        <form className="w-full max-w-xs ml-2.5" onSubmit={handleLogin}>
          <div className='w-full'>
              <div className="md:flex md:items-center mb-3">
              <div className="md:w-1/3">
                <label className="block text-gray-500 font-bold md:text-left mb-1 md:mb-0 pr-4" htmlFor="user-email">Email</label>
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
                <label className="block text-gray-500 font-bold md:text-left mb-1 md:mb-0 pr-4" htmlFor="user-password">Password</label>
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
          </div>
      </form>
     </div>
  );
};

export default Login;