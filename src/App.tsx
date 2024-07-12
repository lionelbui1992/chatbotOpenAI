import React, {useContext, useState} from 'react';
import {BrowserRouter, Navigate, Route, Routes} from 'react-router-dom';
import {I18nextProvider} from 'react-i18next';
import i18n from './i18n';
import Sidebar from "./components/SideBar";
import MainPage from "./components/MainPage";
import './App.css';
import {ToastContainer} from "react-toastify";
import ExploreCustomChats from "./components/ExploreCustomChats";
import CustomChatEditor from './components/CustomChatEditor';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Register from './components/Register';
import { UserContext } from './UserContext';

const App = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const {userSettings, setUserSettings} = useContext(UserContext);
  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  interface MainPageProps {
    className: string;
    isSidebarCollapsed: boolean;
    toggleSidebarCollapse: () => void;
  }

  const MainPageWithProps: React.FC<Partial<MainPageProps>> = (props) => (
      <MainPage
          className={'main-content'}
          isSidebarCollapsed={isSidebarCollapsed}
          toggleSidebarCollapse={toggleSidebarCollapse}
          {...props}
      />
  );
  return (
      <BrowserRouter>
        <I18nextProvider i18n={i18n}>
          <div className="App dark:bg-gray-900 dark:text-gray-100">
            <ToastContainer/>
            <div className="flex overflow-hidden w-full h-full relative z-0">
              {
                userSettings.token ? (
                  <Sidebar
                  className="sidebar-container flex-shrink-0"
                  isSidebarCollapsed={isSidebarCollapsed}
                  toggleSidebarCollapse={toggleSidebarCollapse}/>
                ):(
                  <></>
                )
              }
              <div className="flex-grow h-full overflow-hidden">
                <Routes>
                  <Route path="/" element={<ProtectedRoute><MainPageWithProps/></ProtectedRoute>}/>
                  <Route path="/c/:id" element={<ProtectedRoute><MainPageWithProps/></ProtectedRoute>}/>
                  <Route path="/explore" element={<ProtectedRoute><ExploreCustomChats/></ProtectedRoute>}/>
                  // Use the wrapper for new routes
                  <Route path="/g/:gid" element={<ProtectedRoute><MainPageWithProps/></ProtectedRoute>}/>
                  <Route path="/g/:gid/c/:id" element={<ProtectedRoute><MainPageWithProps/></ProtectedRoute>}/>
                  <Route path="/custom/editor" element={<ProtectedRoute><CustomChatEditor/></ProtectedRoute>}/>
                  <Route path="/custom/editor/:id" element={<ProtectedRoute><CustomChatEditor/></ProtectedRoute>}/>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="*" element={<Navigate to="/" replace/>}/>
                </Routes>
              </div>
            </div>
          </div>
        </I18nextProvider>
      </BrowserRouter>
  );
};

export default App;
