import React, { useState, useEffect, FormEvent, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Auth from '../service/Auth';
import { UserContext } from '../UserContext';
import { DOMAIN_ENDPOINT } from '../constants/apiEndpoints';

const Register: React.FC = () => {
  const [domain, setDomain] = useState<string>('');
  const [domainList, setDomainList] = useState<string[]>([]);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [rePassword, setRePassword] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');

  const {userSettings, setUserSettings} = useContext(UserContext);

  const navigate = useNavigate();

  useEffect(() => {
    // clear token in context
    setUserSettings({...userSettings, token: undefined});
    // call get domain api
    const getDomainList = async () => {
      try {
        const domain = await fetch(DOMAIN_ENDPOINT);
        const domainData = await domain.json();
        console.log(domainData);
        if (domainData && domainData.status === 'success' && domainData.data.length > 0) {
          setDomainList(domainData.data);
        }
      } catch (error) {
        console.error(error);
      }
    }
    getDomainList();
   }, []);

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

  const handleRegister = async (event: FormEvent) => {
    event.preventDefault();
    // validate data
    if (!domain || !email || !password || !rePassword) {
      toast.error('Domain, email, password and re-password are required');
      return;
    }
    const user = await Auth.register(domain, email, password, rePassword);
    if (user) {
      // update token to context
      setUserSettings({
        ...userSettings,
        token: user.token,
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
    <form className="w-full max-w-xs" onSubmit={handleRegister}>
      <div className="mb-4"></div>
      <div className="md:flex md:items-center mb-3">
        <div className="md:w-1/3">
          <label className="block text-gray-500 font-bold md:text-left mb-1 md:mb-0 pr-4" htmlFor="user-domain">Domain</label>
        </div>
        <div className="md:w-2/3">
          <select
            className="w-full flex-grow rounded-md border dark:text-gray-100 dark:bg-gray-850 dark:border-white/20 px-2 py-1"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
          >
            <option value="">Select your domain</option>
            {domainList.map((domain:any, index) => (
              <option key={domain.name + index} value={domain.name}>{domain.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="md:flex md:items-center mb-3">
        <div className="md:w-1/3">
          <label className="block text-gray-500 font-bold md:text-left mb-1 md:mb-0 pr-4" htmlFor="user-email">Email</label>
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
          <label className="block text-gray-500 font-bold md:text-left mb-1 md:mb-0 pr-4" htmlFor="user-password">Password</label>
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
          <label className="block text-gray-500 font-bold md:text-left mb-1 md:mb-0 pr-4" htmlFor="user-re-password">Re-Password</label>
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
    </div>
  );
};

export default Register;
function setUserSettings(arg0: any) {
  throw new Error('Function not implemented.');
}

