import React, {createContext, ReactNode, useEffect, useState} from 'react';
import { defaultUserSettings, UserSettings } from './models/User';
import { use } from 'i18next';

export type UserTheme = 'light' | 'dark' | 'system';
export type Theme = 'light' | 'dark';

const determineEffectiveTheme = (userTheme: UserTheme): Theme => {
  if (userTheme === 'system' || !userTheme) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return userTheme;
};

export const UserContext = createContext<{
  userSettings: UserSettings;
  setUserSettings: React.Dispatch<React.SetStateAction<UserSettings>>;
}>({
  userSettings: defaultUserSettings,
  setUserSettings: () => {
  },
});

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({children}: UserProviderProps) => {
  const [userSettings, setUserSettings] = useState<UserSettings>(() => {
   const access_token = localStorage.getItem('access_token') || defaultUserSettings.access_token;
   const refresh_token = localStorage.getItem('refresh_token') || defaultUserSettings.refresh_token;

    const user_id = localStorage.getItem('user_id') || defaultUserSettings.user_id;
    const role = localStorage.getItem('role') || defaultUserSettings.role;
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
      access_token,
      refresh_token,
      user_id,
      role,
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

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    mediaQuery.addEventListener('change', mediaQueryChangeHandler);
    updateTheme();

    // load user token if available
    const access_token = localStorage.getItem('access_token') || defaultUserSettings.access_token;
    const refresh_token = localStorage.getItem('refresh_token') || defaultUserSettings.refresh_token;

    if (access_token !== defaultUserSettings.access_token) {
      setUserSettings(prevSettings => ({...prevSettings, access_token}));
    }

    if (refresh_token !== defaultUserSettings.refresh_token) {
      setUserSettings(prevSettings => ({...prevSettings, refresh_token}));
    }

    return () => {
      mediaQuery.removeEventListener('change', mediaQueryChangeHandler);
    };
  }, []);

  useEffect(() => {
    if (userSettings.user_id === null || userSettings.user_id === '') {
      localStorage.setItem('user_id', defaultUserSettings.role);
    } else {
      localStorage.setItem('user_id', userSettings.user_id);
    }
  }, [userSettings.role]);

  useEffect(() => {
    if (userSettings.access_token === undefined) {
      localStorage.removeItem('access_token');
    } else {
      localStorage.setItem('access_token', userSettings.access_token);
    }
  } , [userSettings.access_token]);

  useEffect(() => {
    if (userSettings.refresh_token === undefined) {
      localStorage.removeItem('refresh_token');
    } else {
      localStorage.setItem('refresh_token', userSettings.refresh_token);
    }
  } , [userSettings.refresh_token]);

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
      <UserContext.Provider value={{userSettings, setUserSettings}}>
        {children}
      </UserContext.Provider>
  );
};

// Usage hint
// const { userSettings, setUserSettings } = useContext(UserContext);
