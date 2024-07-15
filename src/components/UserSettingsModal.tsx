import React, {useContext, useEffect, useRef, useState} from 'react';
import {
  CircleStackIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  XMarkIcon,
  ArrowLeftOnRectangleIcon,
  ChevronLeftIcon, 
  ChevronRightIcon
} from "@heroicons/react/24/outline";
import {Theme, UserContext} from '../UserContext';
import ModelSelect from './ModelSelect';
import {EditableField} from "./EditableField";
import './UserSettingsModal.css';
import {GOOGLE_CLIENT_ID, GOOGLE_DEVELOPER_KEY, OPENAI_DEFAULT_SYSTEM_PROMPT} from "../config";
import ConversationService from "../service/ConversationService";
import {NotificationService} from "../service/NotificationService";
import {useTranslation} from 'react-i18next';
import {Transition} from '@headlessui/react';
import EditableInstructions from './EditableInstructions';
import {useConfirmDialog} from './ConfirmDialog';
import {DEFAULT_MODEL} from "../constants/appConstants";
import UserService from "../service/UserService"; // Add this line to import UserService

import { gapi } from 'gapi-script';
import { GoogleSelectedDetails } from '../models/User';
import { useNavigate } from 'react-router-dom';

interface UserSettingsModalProps {
  isVisible: boolean;
  onClose: () => void;
}

declare global {
  interface Window {
    gapi: any;
  }
}

interface GoogleSheet {
  id: string;
  name: string;
  title: string;
}

interface GoogleSheetInfo {
  id: string;
  name: string;
}

interface GoogleSheetInfo2 {
  id: string;
  title: string;
}

interface GoogleSheetDetail {
  properties: {
    sheetId: number;
    title: string;
  };
}

enum Tab {
  GENERAL_TAB = "General",
  INSTRUCTIONS_TAB = "Instructions",
  GOOGLE_TAB = "Google Connect",
  STORAGE_TAB = "Storage",
}

const SAMPLE_AUDIO_TEXT =
  "The quick brown fox jumps over the lazy dog.\n" +
  "Sandy Sells Sea-Shells by the Sea-Shore.";

const UserSettingsModal: React.FC<UserSettingsModalProps> = ({isVisible, onClose}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const {userSettings, setUserSettings} = useContext(UserContext);
  const [activeTab, setActiveTab] = useState<Tab>(Tab.GENERAL_TAB);
  const {showConfirmDialog, ConfirmDialog, isOpen} = useConfirmDialog();

  const [storageUsage, setStorageUsage] = useState<number | undefined>();
  const [storageQuota, setStorageQuota] = useState<number | undefined>();
  const [percentageUsed, setPercentageUsed] = useState<number | undefined>();
  const {t} = useTranslation();
  const editableInstructionsRef = useRef<{ getCurrentValue: () => string }>(null);
  

  const [isSignedIn, setIsSignedIn] = useState(false);
  const [sheets, setSheets] = useState<GoogleSheet[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSheetId, setSelectedSheetId] = useState('');
  const [selectedSheetName, setSelectedSheetName] = useState('');
  const [sheetDetails, setSheetDetails] = useState([]);
  const [selectedDetails, setSelectedDetails] = useState<GoogleSelectedDetails[]>([]);
  const [authToken, setAuthToken] = useState(userSettings.googleAccessToken);
  const [sellectedDriveInfo,setSelectedDriveInfo] = useState(userSettings.googleSelectedDetails);
  const [isLoading,setIsLoading] = useState(false);
  const [showBar,setShowBar] = useState(false)
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

const navigate = useNavigate();

  useEffect(()=>{
    if(Array(sellectedDriveInfo)){
      handleSheetClick(sellectedDriveInfo[0]?.sheetId,sellectedDriveInfo[0]?.sheetName);
      setSelectedDetails(sellectedDriveInfo)
    }
  },[sellectedDriveInfo])
  useEffect(() => {
    if (isVisible) {
      setActiveTab(Tab.GENERAL_TAB);
    }
  }, [isVisible]);

  const formatBytesToMB = (bytes?: number) => {
    if (typeof bytes === 'undefined') {
      return;
    }
    const megabytes = bytes / 1024 / 1024;
    return `${megabytes.toFixed(2)} MB`;
  };

  const handleDeleteAllConversations = async () => {
    showConfirmDialog({
      message: 'Are you sure you want to delete all conversations? This action cannot be undone.',
      confirmText: 'Delete',
      confirmButtonVariant: 'critical',
      onConfirm: async () => {
        try {
          await ConversationService.deleteAllConversations();
          NotificationService.handleSuccess("All conversations have been successfully deleted.");
        } catch (error) {
          console.error('Failed to delete all conversations:', error);
          if (error instanceof Error) {
            NotificationService.handleUnexpectedError(error, "Failed to delete all conversations");
          } else {
            NotificationService.handleUnexpectedError(new Error('An unknown error occurred'), "Failed to delete all conversations");
          }
        }
      },
    })
  };

  const handleClose = () => {
    const currentInstructions = editableInstructionsRef.current?.getCurrentValue();
    setUserSettings({...userSettings, instructions: currentInstructions || ''});
    onClose();
  };


  useEffect(() => {
    const closeModalOnOutsideClick = (event: MouseEvent) => {
      if (!isOpen && dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (!isOpen && event.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('mousedown', closeModalOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);

    return () => {
      document.removeEventListener('mousedown', closeModalOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [handleClose]);

  useEffect(() => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      navigator.storage.estimate().then(({usage, quota}) => {
        setStorageUsage(usage);
        setStorageQuota(quota);
        if (typeof usage !== 'undefined' && typeof quota !== 'undefined') {
          setPercentageUsed(((usage / quota) * 100));
        }
      }).catch((error: Error) => {
        console.error('Error getting storage estimate:', error);
      });
    } else {
      console.log('Storage Estimation API is not supported in this browser.');
    }
    function start() {
      gapi.client.init({
        apiKey: GOOGLE_DEVELOPER_KEY,
        clientId: GOOGLE_CLIENT_ID,
        discoveryDocs: [
          'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
          'https://sheets.googleapis.com/$discovery/rest?version=v4'
        ],
        scope: [
          'https://www.googleapis.com/auth/drive.metadata.readonly',
          'https://www.googleapis.com/auth/spreadsheets.readonly',
          'https://www.googleapis.com/auth/drive.file',
          'https://www.googleapis.com/auth/spreadsheets'].join(' '),
      }).then(() => {
        gapi.auth2.getAuthInstance().isSignedIn.listen(setIsSignedIn);
        setIsSignedIn(gapi.auth2.getAuthInstance().isSignedIn.get());

        if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
          setAuthToken(gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token);
        }
      }).catch((error: Error) => {
        console.error('Error initializing gapi client:', error);
      });
    }

    gapi.load('client:auth2', start);
  }, []);


  const handleSignInClick = () => {
    gapi.auth2.getAuthInstance().signIn().then(() => {
      console.log(gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token);
      setAuthToken(gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token);
      if(gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token){
        setIsSignedIn(true)
      }
    });
  };
  const handleSignOutClick = () => {
    gapi.auth2.getAuthInstance().signOut();
    setIsSignedIn(false)
    setAuthToken('');
  };

  const Logout=()=>{
    setAuthToken('');
    onClose();
    navigate('/login')
  }

  const listSheets = () => {
    gapi.client.drive.files.list({
      'q': "mimeType='application/vnd.google-apps.spreadsheet'",
      'fields': 'files(id, name)',
    }).then((response: any) => {
      setSheets(response.result.files);
    }).catch((error: Error) => {
      console.error('Error listing sheets:', error);
    });
  };

  const listSheetDetails = (sheetId: string) => {
    gapi.client?.sheets?.spreadsheets.get({
      spreadsheetId: sheetId,
    }).then((response: any) => {
      const sheetsData = response.result.sheets.map((sheet: GoogleSheetDetail) => ({ id: sheet.properties.sheetId, title: sheet.properties.title }));
      setSheetDetails(sheetsData);
    }).catch((error: Error) => {
      console.error('Error getting sheet details:', error);
    });
  };

  useEffect(() => {
    if (isSignedIn) {
      listSheets();
    }
  }, [isSignedIn]);

  const handleSheetClick = (sheetId: string, sheetName: string) => {
    setSelectedSheetId(sheetId);
    setSelectedSheetName(sheetName);
    listSheetDetails(sheetId ?? "");
  };

  const handleDetailClick = (detail: GoogleSheetInfo2) => {
    setSelectedDetails((prevDetails) =>
      prevDetails.some(d => d.id === detail.id)
        ? prevDetails.filter(d => d.id !== detail.id)
        : [...prevDetails, { ...detail, sheetName: selectedSheetName, sheetId: selectedSheetId }]
    );
  };

  const handleSaveGoogleInfo = () => {
    // update user settings in context
    onClose();
    setUserSettings({...userSettings, googleAccessToken: authToken, googleSelectedDetails: selectedDetails});
    // update google access token in backend
    if (userSettings.token) {
      UserService.updateGoogleSettings(userSettings.token, authToken, selectedDetails)
        .then((response) => {
          if (response.status === 200) {
            setIsLoading(false);
            NotificationService.handleSuccess("Google access token has been successfully updated.");
          } else {
            NotificationService.handleUnexpectedError(new Error('An unknown error occurred'), "Failed to update google access token");
          }
        }).catch((error) => {
          if (error instanceof Error) {
            NotificationService.handleUnexpectedError(error, "Failed to update google access token");
          } else {
            NotificationService.handleUnexpectedError(new Error('An unknown error occurred'), "Failed to update google access token");
          }
        });
      }
  };

  const filteredSheets = sheets?.filter((sheet: GoogleSheetInfo) => {
    return sheet.name.toLowerCase().includes(searchQuery.toLowerCase());
  }
  );
  const renderStorageInfo = (value?: number | string) => value ?? t('non-applicable');
  const showSettingLeftBar = (status:boolean)=>{
    setShowBar(status);
  }
  return (
      <Transition show={isVisible} as={React.Fragment}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 px-4">
          <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
          >
            <div ref={dialogRef}
                  className="flex flex-col bg-white dark:bg-gray-850 rounded-lg w-full max-w-md mx-auto overflow-hidden mx-4 min-h-640 user-setting-container"
                    >
              <div id='user-settings-header'
                    className="flex justify-between items-center border-b border-gray-200 p-4 flex-wrap">
                <h1 className="text-lg font-semibold">{t('settings-header')}</h1>
                <button onClick={handleClose}
                        className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100">
                  <XMarkIcon className="h-8 w-8" aria-hidden="true"/>
                </button>
              </div>
              <div id='user-settings-content' className="flex flex-1">
                {
                  showBar ? (
                        <ChevronLeftIcon className="chevoright" onClick={()=>showSettingLeftBar(false)} />
                  ):(
                    <ChevronRightIcon className="chevoright" onClick={()=>showSettingLeftBar(true)} />
                  )
                }
                <div className="border-r border-gray-200 flex-col user-setting-side-bar" style={showBar ? { display: 'flex' } : { display: 'none' }}>
                  <div
                      className={`cursor-pointer p-4 flex items-center ${activeTab === Tab.GENERAL_TAB ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
                      onClick={() => setActiveTab(Tab.GENERAL_TAB)}>
                    <Cog6ToothIcon className="w-4 h-4 mr-3" aria-hidden="true"/>{t('general-tab')}
                  </div>
                  <div
                      className={`cursor-pointer p-4 flex items-center ${activeTab === Tab.INSTRUCTIONS_TAB ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
                      onClick={() => setActiveTab(Tab.INSTRUCTIONS_TAB)}>
                    <DocumentTextIcon className="w-4 h-4 mr-3"
                                      aria-hidden="true"/>{t('instructions-tab')}
                  </div>
                  <div
                    className={`cursor-pointer p-4 flex items-center ${activeTab === Tab.GOOGLE_TAB ? 'bg-gray-200 dark:bg-gray-700' : ''}`} // Added new Tab
                    onClick={() => setActiveTab(Tab.GOOGLE_TAB)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16px" height="16px" viewBox="0 0 32 32" fill="none" className="w-4 h-4 mr-3">
                      <path d="M2 11.9556C2 8.47078 2 6.7284 2.67818 5.39739C3.27473 4.22661 4.22661 3.27473 5.39739 2.67818C6.7284 2 8.47078 2 11.9556 2H20.0444C23.5292 2 25.2716 2 26.6026 2.67818C27.7734 3.27473 28.7253 4.22661 29.3218 5.39739C30 6.7284 30 8.47078 30 11.9556V20.0444C30 23.5292 30 25.2716 29.3218 26.6026C28.7253 27.7734 27.7734 28.7253 26.6026 29.3218C25.2716 30 23.5292 30 20.0444 30H11.9556C8.47078 30 6.7284 30 5.39739 29.3218C4.22661 28.7253 3.27473 27.7734 2.67818 26.6026C2 25.2716 2 23.5292 2 20.0444V11.9556Z" fill="white"/>
                      <path d="M16.0019 12.4507L12.541 6.34297C12.6559 6.22598 12.7881 6.14924 12.9203 6.09766C11.8998 6.43355 11.4315 7.57961 11.4315 7.57961L5.10895 18.7345C5.01999 19.0843 4.99528 19.4 5.0064 19.6781H11.9072L16.0019 12.4507Z" fill="#34A853"/>
                      <path d="M16.002 12.4507L20.0967 19.6781H26.9975C27.0086 19.4 26.9839 19.0843 26.8949 18.7345L20.5724 7.57961C20.5724 7.57961 20.1029 6.43355 19.0835 6.09766C19.2145 6.14924 19.3479 6.22598 19.4628 6.34297L16.002 12.4507Z" fill="#FBBC05"/>
                      <path d="M16.0019 12.4514L19.4628 6.34371C19.3479 6.22671 19.2144 6.14997 19.0835 6.09839C18.9327 6.04933 18.7709 6.01662 18.5954 6.00781H18.4125H13.5913H13.4084C13.2342 6.01536 13.0711 6.04807 12.9203 6.09839C12.7894 6.14997 12.6559 6.22671 12.541 6.34371L16.0019 12.4514Z" fill="#188038"/>
                      <path d="M11.9082 19.6782L8.48687 25.7168C8.48687 25.7168 8.3732 25.6614 8.21875 25.5469C8.70434 25.9206 9.17633 25.9998 9.17633 25.9998H22.6134C23.3547 25.9998 23.5092 25.7168 23.5092 25.7168C23.5116 25.7155 23.5129 25.7142 23.5153 25.713L20.0965 19.6782H11.9082Z" fill="#4285F4"/>
                      <path d="M11.9086 19.6782H5.00781C5.04241 20.4985 5.39826 20.9778 5.39826 20.9778L5.65773 21.4281C5.67627 21.4546 5.68739 21.4697 5.68739 21.4697L6.25205 22.461L7.51976 24.6676C7.55683 24.7569 7.60008 24.8386 7.6458 24.9166C7.66309 24.9431 7.67915 24.972 7.69769 24.9972C7.70263 25.0047 7.70757 25.0123 7.71252 25.0198C7.86944 25.2412 8.04489 25.4123 8.22034 25.5469C8.37479 25.6627 8.48847 25.7168 8.48847 25.7168L11.9086 19.6782Z" fill="#1967D2"/>
                      <path d="M20.0967 19.6782H26.9974C26.9628 20.4985 26.607 20.9778 26.607 20.9778L26.3475 21.4281C26.329 21.4546 26.3179 21.4697 26.3179 21.4697L25.7532 22.461L24.4855 24.6676C24.4484 24.7569 24.4052 24.8386 24.3595 24.9166C24.3422 24.9431 24.3261 24.972 24.3076 24.9972C24.3026 25.0047 24.2977 25.0123 24.2927 25.0198C24.1358 25.2412 23.9604 25.4123 23.7849 25.5469C23.6305 25.6627 23.5168 25.7168 23.5168 25.7168L20.0967 19.6782Z" fill="#EA4335"/>
                    </svg>GOOGLE
                  </div>
                  <div
                      className={`cursor-pointer p-4 flex items-center ${activeTab === Tab.STORAGE_TAB ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
                      onClick={() => setActiveTab(Tab.STORAGE_TAB)}>
                    <CircleStackIcon className="w-4 h-4 mr-3" aria-hidden="true"/>{t('storage-tab')}
                  </div>
                  <div
                      className={`cursor-pointer p-4 flex items-center`}
                      onClick={() => Logout()}>
                    <ArrowLeftOnRectangleIcon className="w-4 h-4 mr-3" aria-hidden="true"/>Logout
                  </div>
                </div>
                <div className="flex-1 p-4 flex flex-col tab-content">
                  <div className={`${activeTab === Tab.GENERAL_TAB ? 'flex flex-col flex-1' : 'hidden'}`}>
                    <div className="border-b border-token-border-light pb-3 last-of-type:border-b-0">
                      <div className="flex items-center justify-between setting-panel flex-wrap">
                        <label htmlFor="theme">{t('theme-label')}</label>
                        <select id='theme' name='theme'
                                className="custom-select dark:custom-select border-gray-300 border rounded p-2
                                dark:bg-gray-800 dark:text-white dark:border-gray-600"
                                value={userSettings.userTheme}
                                onChange={(e) => {
                                  setUserSettings({
                                    ...userSettings,
                                    userTheme: e.target.value as Theme
                                  });
                                }}>
                          <option value="dark">{t('dark-option')}</option>
                          <option value="light">{t('light-option')}</option>
                          <option value="system">{t('system-option')}</option>
                        </select>

                      </div>
                      <div className="flex items-center justify-between setting-panel">
                        {userSettings.model ? (
                            <label htmlFor="model">{t('model-header')}</label>
                        ) : (
                            <span>{t('model-header')}</span>
                        )}
                        <EditableField<string | null>
                            readOnly={false}
                            id="model"
                            label=""
                            value={userSettings.model}
                            defaultValue={null}
                            defaultValueLabel={DEFAULT_MODEL}
                            editorComponent={(props) =>
                                <ModelSelect value={userSettings.model}
                                              onModelSelect={props.onValueChange}
                                              models={[]} allowNone={true}
                                              allowNoneLabel="Default"/>}
                            onValueChange={(value: string | null) => {
                              setUserSettings({...userSettings, model: value});
                            }}
                        />
                      </div>
                    </div>
                  </div>
                  <div
                      className={`${activeTab === Tab.INSTRUCTIONS_TAB ? 'flex flex-col flex-1' : 'hidden'}`}>
                    <div
                        className="flex flex-col flex-1 border-b border-token-border-light pb-3 last-of-type:border-b-0">
                      <EditableInstructions
                          ref={editableInstructionsRef}
                          initialValue={userSettings.instructions}
                          placeholder={OPENAI_DEFAULT_SYSTEM_PROMPT}
                          onChange={(text) => {
                            // setUserSettings({...userSettings, instructions: text});
                          }}
                          className="flex flex-col h-full"
                      />
                    </div>
                  </div>
                  <div className={`${activeTab === Tab.GOOGLE_TAB ? 'flex flex-col flex-1 google-tab' : 'hidden'}`}>
                    <div className="flex flex-col flex-1">
                      <div className="setting-panel">
                        {isSignedIn ? (
                          <div className="google-button-setting">
                            <button onClick={handleSignOutClick} className="py-2 px-4 bg-red-500 text-white rounded hover:bg-red-700">Sign Out</button>
                            <button onClick={handleSaveGoogleInfo} className="rounded-md border dark:border-white/20 py-2 px-4">Save</button>
                          </div>
                        ) : (
                          <button onClick={handleSignInClick}>Sign In</button>
                        )}
                      </div>
                      <div className="setting-panel flex justify-between">
                        {isSignedIn && (
                          <div className='w-full'>
                            <h3 >Sheets name:</h3>
                            <input
                              className="flex-grow rounded-md border dark:text-gray-100 dark:bg-gray-850 dark:border-white/20 px-2 py-1 w-full"
                              type="text"
                              placeholder="Sheets Name..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <ul className="google-sheet-list rounded-md border dark:text-gray-100 dark:bg-gray-850 dark:border-white/20 mt-3 py-2 px-2">
                              {filteredSheets.map((sheet: GoogleSheetInfo) => (
                                <li 
                                key={sheet.id} onClick={() => handleSheetClick(sheet.id, sheet.name)}
                                className={sheet?.id === sellectedDriveInfo[0]?.sheetId ? 'selected' : ''}
                                >
                                  {sheet.name}
                                </li>
                              ))}
                            </ul>
                            {selectedSheetId && (
                              <div>
                                <h4 className="mt-3 break-all">Selected Sheet ID: {selectedSheetId}</h4>
                                <ul className="google-sheet-list rounded-md border dark:text-gray-100 dark:bg-gray-850 dark:border-white/20 mt-3 py-2 px-2">
                                  {sheetDetails.map((detail: GoogleSheet, index: number) => (
                                    <li
                                      key={index}
                                      onClick={() => handleDetailClick(detail)}
                                      style={{
                                        cursor: 'pointer',
                                        textDecoration: selectedDetails.some(d => d.id === detail.id) ? 'underline' : 'none',
                                        color: selectedDetails.some(d => d.id === detail.id) ? 'blue' : 'black'
                                      }}
                                      className={selectedDetails.some(d => d.id === detail.id) ? 'google-sheet-selected' : ''}
                                    >
                                      {index + 1}. {detail.title}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {selectedDetails.length > 0 && (
                              <div>
                                <h4 className="mt-3">Selected Details:</h4>
                                <select multiple style={{ width: '100%', height: '100px' }} className="rounded-md border dark:text-gray-100 dark:bg-gray-850 dark:border-white/20 mt-3 py-2 px-2">
                                  {selectedDetails.map((detail, index) => (
                                    <option key={index} value={detail.id}>
                                      {index + 1}. {detail.sheetName} - {detail.title}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={`${activeTab === Tab.STORAGE_TAB ? 'flex flex-col flex-1' : 'hidden'}`}>
                    <h3 className="text-lg mb-4">{t('storage-header')}</h3>
                    <div className="setting-panel">
                      <p>Chats are stored locally in your browser's IndexedDB.</p>
                      <p>
                        Usage: {`${renderStorageInfo(formatBytesToMB(storageUsage))} of
                    ${renderStorageInfo(formatBytesToMB(storageQuota))}
                    (${renderStorageInfo(percentageUsed ? `${percentageUsed.toFixed(2)}%` : undefined)})`}
                      </p>
                    </div>
                    <div className="flex items-center justify-between setting-panel">
                      <span>{''}</span>
                      <div>
                        <button onClick={handleDeleteAllConversations}
                                className="mt-4 py-2 px-4 bg-red-500 text-white rounded hover:bg-red-700">{t('delete-all-chats-button')}
                        </button>
                        {ConfirmDialog}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Transition>
  );
};

export default UserSettingsModal;
