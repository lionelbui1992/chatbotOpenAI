import { use } from 'i18next';
import React, {createContext, ReactNode, useEffect, useState} from 'react';
import Cookies from 'js-cookie';
import { UserSettings } from '../models/User';

import Api from '../service/Api';
import { AUTH_ENDPOINT } from '../constants/apiEndpoints';

export type UserTheme = 'light' | 'dark' | 'system';
export type Theme = 'light' | 'dark';

const defaultUserSettings: UserSettings = {
  token: undefined,
  isAuthenticated: false,
  user_id: null,
  domain: '',
  email: '',
  name: '',
  userTheme: 'system',
  theme: 'light',
  model: null,
  instructions: '',
  speechModel: 'tts-1',
  speechVoice: 'echo',
  speechSpeed: 1.0,
  googleAccessToken: "",
  googleSelectedDetails: [],
  tags: [],
};

const determineEffectiveTheme = (userTheme: UserTheme): Theme => {
  if (userTheme === 'system' || !userTheme) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return userTheme;
};

export const UserContext = createContext<{
  userSettings: UserSettings;
  setUserSettings: React.Dispatch<React.SetStateAction<UserSettings>>;
  login: (email: string, password: string) => void;
  refresh: () => void;
  logout: () => void;
}>({
  userSettings: defaultUserSettings,
  setUserSettings: () => {
  },
  login: () => {
  },
  refresh: () => {
  },
  logout: () => {
  },
});

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({children}: UserProviderProps) => {
  const [userSettings, setUserSettings] = useState<UserSettings>(() => {
    const storedToken = localStorage.getItem('userToken');
    const token = storedToken ? storedToken : defaultUserSettings.token;
    const isAuthenticated = token !== undefined;
    const user_id = localStorage.getItem('user_id') || defaultUserSettings.user_id;
    const domain = localStorage.getItem('userDomain') || defaultUserSettings.domain;
    const email = localStorage.getItem('userEmail') || defaultUserSettings.email;
    const name = localStorage.getItem('userName') || defaultUserSettings.name;

    const storedUserTheme = localStorage.getItem('theme');
    const userTheme: UserTheme = (storedUserTheme === 'light' || storedUserTheme === 'dark' || storedUserTheme === 'system') ? storedUserTheme : defaultUserSettings.userTheme;

    const model = localStorage.getItem('defaultModel') || defaultUserSettings.model;
    const instructions = localStorage.getItem('defaultInstructions') || defaultUserSettings.instructions;
    const speechModel = localStorage.getItem('defaultSpeechModel') || defaultUserSettings.speechModel;
    const speechVoice = localStorage.getItem('defaultSpeechVoice') || defaultUserSettings.speechVoice;

    const speechSpeedRaw = localStorage.getItem('defaultSpeechSpeed');
    const speechSpeed = speechSpeedRaw !== null ? Number(speechSpeedRaw) : defaultUserSettings.speechSpeed;

    const effectiveTheme = determineEffectiveTheme(userTheme);

    const googleAccessToken = localStorage.getItem('googleAccessToken') || defaultUserSettings.googleAccessToken;
    const googleSelectedDetails = localStorage.getItem('googleSelectedDetails') ? JSON.parse(localStorage.getItem('googleSelectedDetails')!) : defaultUserSettings.googleSelectedDetails;
    const tags = localStorage.getItem('tag')?.split(',') || defaultUserSettings.tags;

    return {
      token,
      isAuthenticated,
      user_id,
      domain,
      email,
      name,
      userTheme: userTheme,
      theme: effectiveTheme,
      model,
      instructions,
      speechModel,
      speechVoice,
      speechSpeed,
      googleAccessToken,
      googleSelectedDetails,
      tags,
    };
  });

  const login = async (email: string, password: string) => {
    try {
      const { data } = await Api.post(AUTH_ENDPOINT + '/login', {email, password});
      const { access_token, refresh_token, user } = data.data;
      Cookies.set('token', access_token);
      Cookies.set('refreshToken', refresh_token);
      setUserSettings(prevSettings => ({...prevSettings, isAuthenticated: true}));
      setUserSettings({
        ...userSettings,
        token: access_token,
        isAuthenticated: true,
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
    } catch (error) {
      throw new Error(String(error));
    }
  };

  const refresh = async () => {
    try {
      const { data } = await Api.post(AUTH_ENDPOINT + '/refresh');
      const { access_token, refersh_token } = data.data;
      Cookies.set('token', access_token);
      Cookies.set('refreshToken', refersh_token);
      setUserSettings({
        ...userSettings,
        token: access_token,
        isAuthenticated: true,
      });
    } catch (error) {
      throw new Error(String(error));
    }
  };

  const logout = () => {
    Cookies.remove('token');
    Cookies.remove('refreshToken');
    setUserSettings(prevSettings => ({...prevSettings, isAuthenticated: true}));
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const interval = setInterval(() => {
      if (!Cookies.get('token')) {
        setUserSettings(prevSettings => ({...prevSettings, isAuthenticated: false}));
      }
    }, 1000);

    const checkAuthStatus = async () => {
      try {
        await Api.get(AUTH_ENDPOINT + '/status'); // An endpoint to check if the user is authenticated
        setUserSettings(prevSettings => ({...prevSettings, isAuthenticated: true}));
      } catch (error) {
        setUserSettings(prevSettings => ({...prevSettings, isAuthenticated: false}));
      }
    };

    checkAuthStatus();

    mediaQuery.addEventListener('change', mediaQueryChangeHandler);
    updateTheme();

    return () => {
      clearInterval(interval);
      mediaQuery.removeEventListener('change', mediaQueryChangeHandler);
    };
  }, []);

  useEffect(() => {
    if (userSettings.token === undefined) {
      localStorage.removeItem('userToken');
    } else {
      localStorage.setItem('userToken', userSettings.token);
    }
  } , [userSettings.token]);

  useEffect(() => {
    localStorage.setItem('theme', userSettings.userTheme);
  }, [userSettings.userTheme]);

  useEffect(() => {
    if (userSettings.model === null || userSettings.model === '') {
      localStorage.removeItem('defaultModel');
    } else {
      localStorage.setItem('defaultModel', userSettings.model);
    }
  }, [userSettings.model]);

  useEffect(() => {
    if (userSettings.instructions === '') {
      localStorage.removeItem('defaultInstructions');
    } else {
      localStorage.setItem('defaultInstructions', userSettings.instructions);
    }
  }, [userSettings.instructions]);

  useEffect(() => {
    const newEffectiveTheme = determineEffectiveTheme(userSettings.userTheme);
    setUserSettings(prevSettings => ({...prevSettings, theme: newEffectiveTheme}));

    if (newEffectiveTheme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [userSettings.userTheme]);

  const mediaQueryChangeHandler = (e: MediaQueryListEvent) => {
    const newSystemTheme: Theme = e.matches ? 'dark' : 'light';
    if (userSettings.userTheme === 'system') {
      setUserSettings((prevSettings) => ({
        ...prevSettings,
        theme: newSystemTheme,
      }));
    }
  };

  const updateTheme = () => {
    const newEffectiveTheme = determineEffectiveTheme(userSettings.userTheme || 'system');
    if (newEffectiveTheme !== userSettings.theme) {
      setUserSettings((prevSettings) => ({...prevSettings, theme: newEffectiveTheme}));
    }
    if (newEffectiveTheme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  };

  useEffect(() => {
    if (userSettings.speechModel === null || userSettings.speechModel === '') {
      localStorage.removeItem('defaultSpeechModel');
    } else {
      localStorage.setItem('defaultSpeechModel', userSettings.speechModel);
    }
  }, [userSettings.speechModel]);

  useEffect(() => {
    if (userSettings.speechVoice === null || userSettings.speechVoice === '') {
      localStorage.removeItem('defaultSpeechVoice');
    } else {
      localStorage.setItem('defaultSpeechVoice', userSettings.speechVoice);
    }
  }, [userSettings.speechVoice]);

  useEffect(() => {
    if (userSettings.speechSpeed === null || userSettings.speechSpeed === undefined || userSettings.speechSpeed < 0.25 || userSettings.speechSpeed > 4.0) {
      localStorage.removeItem('defaultSpeechSpeed');
    } else {
      localStorage.setItem('defaultSpeechSpeed', String(userSettings.speechSpeed));
    }
  }, [userSettings.speechSpeed]);

  useEffect(() => {
    if (userSettings.googleAccessToken === null || userSettings.googleAccessToken === undefined) {
      localStorage.removeItem('googleAccessToken');
    } else {
      localStorage.setItem('googleAccessToken', userSettings.googleAccessToken);
    }
  }, [userSettings.googleAccessToken]);

  useEffect(() => {
    if (userSettings.googleSelectedDetails === null || userSettings.googleSelectedDetails === undefined) {
      localStorage.removeItem('googleSelectedDetails');
    } else {
      localStorage.setItem('googleSelectedDetails', JSON.stringify(userSettings.googleSelectedDetails));
    }
  }, [userSettings.googleSelectedDetails]);

  useEffect(() => {
    if (userSettings.tags === null || userSettings.tags === undefined) {
      localStorage.removeItem('tag');
    } else {
      localStorage.setItem('tag', userSettings.tags.join(','));
    }
  }, [userSettings.tags]);

  return (
      <UserContext.Provider value={{userSettings, setUserSettings, login, refresh, logout}}>
        {children}
      </UserContext.Provider>
  );
};

// Usage hint
// const { userSettings, setUserSettings } = useContext(UserContext);
