import React, {useContext, useEffect, useRef, useState} from 'react';
import {UserContext} from '../context/UserContext';
import {GOOGLE_CLIENT_ID, GOOGLE_DEVELOPER_KEY} from "../config";
import ConversationService from "../service/ConversationService";
import {NotificationService} from "../service/NotificationService";
import {useTranslation} from 'react-i18next';
import {useConfirmDialog} from './ConfirmDialog';
import UserService from "../service/UserService"; // Add this line to import UserService

import useDrivePicker from 'react-google-drive-picker'
import { gapi } from 'gapi-script';
import { GoogleSelectedDetails } from '../models/User';

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
  const {showConfirmDialog, ConfirmDialog, isOpen} = useConfirmDialog();

  const editableInstructionsRef = useRef<{ getCurrentValue: () => string }>(null);

  const [openPicker, authResponse] = useDrivePicker();
  

  const [isSignedIn, setIsSignedIn] = useState(false);
  const [sheets, setSheets] = useState<GoogleSheet[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSheetId, setSelectedSheetId] = useState('');
  const [selectedSheetName, setSelectedSheetName] = useState('');
  const [sheetDetails, setSheetDetails] = useState([]);
  const [selectedDetails, setSelectedDetails] = useState<GoogleSelectedDetails[]>([]);
  const [authToken, setAuthToken] = useState(userSettings.googleAccessToken);

  useEffect(() => {
    if (authResponse) {
      setAuthToken(authResponse.access_token);
      // call api to update google access token
      try {
        userSettings.token && UserService.updateSettings(userSettings)
          .then((response) => {
            if (response.status === 200) {
              NotificationService.handleSuccess("Google access token has been successfully updated.");
            } else {
              NotificationService.handleUnexpectedError(new Error('An unknown error occurred'), "Failed to update google access token");
            }
          }).then(() => {
            // update user settings in context
            setUserSettings({...userSettings, googleAccessToken: authResponse.access_token});
          });
      } catch(error) {
        if (error instanceof Error) {
          NotificationService.handleUnexpectedError(error, "Failed to update google access token");
        } else {
          NotificationService.handleUnexpectedError(new Error('An unknown error occurred'), "Failed to update google access token");
        }
      }
      console.log('authResponse:', authResponse);
    }
  }, [authResponse]);

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
    function start() {
      gapi.client.init({
        apiKey: GOOGLE_DEVELOPER_KEY,
        clientId: GOOGLE_CLIENT_ID,
        discoveryDocs: [
          'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
          'https://sheets.googleapis.com/$discovery/rest?version=v4'
        ],
        scope: 'https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/spreadsheets.readonly https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/spreadsheets',
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
      setAuthToken(gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token);
    });
  };

  const handleSignOutClick = () => {
    gapi.auth2.getAuthInstance().signOut();
    setAuthToken('');
  };

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
    gapi.client.sheets.spreadsheets.get({
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
    listSheetDetails(sheetId);
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
    setUserSettings({...userSettings, googleAccessToken: authToken, googleSelectedDetails: selectedDetails});
    // update google access token in backend
    if (userSettings.token) {
      UserService.updateGoogleSettings(userSettings.token, authToken, selectedDetails)
        .then((response) => {
          if (response.status === 200) {
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

  const filteredSheets = sheets.filter((sheet: GoogleSheetInfo) => {
    return sheet.name.toLowerCase().includes(searchQuery.toLowerCase());
  }
  );

  const renderStorageInfo = (value?: number | string) => value ?? t('non-applicable');

  const handleOpenPicker = () => {
    openPicker({
      // role: 'reader',
      clientId: GOOGLE_CLIENT_ID,
      developerKey: GOOGLE_DEVELOPER_KEY,
      viewId: "SPREADSHEETS",
      // token: token, // pass oauth token in case you already have one
      token: authToken,
      showUploadView: true,
      showUploadFolders: true,
      supportDrives: true,
      multiselect: true,
      // customViews: customViewsArray, // custom view
      customScopes: ['https://www.googleapis.com/auth/drive.file'],
      callbackFunction: (data) => {
        if (data.action === 'loaded') {
          console.log('Google Drive Picker loaded successfully')
          console.log('authResponse:', authResponse);
        }
        if (data.action === 'picked') {
          const file = data.docs[0];
          const file_name = file.name;
          if (data.action === 'picked') {
            //console.log('User selected the following files:', data.docs)
            const file = data.docs[0];
            console.log('Selected file:', file);
   
            //ermissions seclected file for user
            const permission = {
              role: 'reader',
              type: 'user',
              emailAddress: 'buiduyet.it@gmail.com'
            };
         
   
            window.gapi.auth2.init({
              client_id: "124252875894-uiliht36jjfrf0hspqkkbmvbni89vo92.apps.googleusercontent.com"
            }).then(() => {
              window.gapi.client.drive.permissions.create({
                fileId: file.id,
                resource: permission
              }).then((res: any) => {
                console.log('Permission created:', res);
              }).catch((error: Error) => {
                console.log('Error creating permission:', error);
              });
            });
          }
        }
      },
    })
  }

  return (
    <div>
      <div className="flex flex-col flex-1">
        <div className="setting-panel flex justify-between">
          <button
            className="rounded-md border dark:border-white/20 p-1 mr-2 flex items-center justify-between"
            onClick={() => handleOpenPicker()}><svg height="16px" width="16px" viewBox="0 0 512 512" className="w-4 h-4 mr-3">
              <path className="svg-color-1" d="M456.348,495.304c0,9.217-7.479,16.696-16.696,16.696H72.348c-9.217,0-16.696-7.479-16.696-16.696  V16.696C55.652,7.479,63.131,0,72.348,0h233.739c4.424,0,8.674,1.761,11.804,4.892l133.565,133.565  c3.131,3.13,4.892,7.379,4.892,11.804V495.304z"/>
              <path className="svg-color-2" d="M456.348,495.304V150.278c0-4.437-1.766-8.691-4.909-11.822L317.389,4.871  C314.258,1.752,310.019,0,305.601,0H256v512h183.652C448.873,512,456.348,504.525,456.348,495.304z"/>
              <path className="svg-color-1" d="M451.459,138.459L317.891,4.892C314.76,1.76,310.511,0,306.082,0h-16.691l0.001,150.261  c0,9.22,7.475,16.696,16.696,16.696h150.26v-16.696C456.348,145.834,454.589,141.589,451.459,138.459z"/>
              <path className="svg-color-white" d="M372.87,211.478H139.13c-9.217,0-16.696,7.479-16.696,16.696v200.348  c0,9.217,7.479,16.696,16.696,16.696H372.87c9.217,0,16.696-7.479,16.696-16.696V228.174  C389.565,218.957,382.087,211.478,372.87,211.478z M155.826,311.652h66.783v33.391h-66.783V311.652z M256,311.652h100.174v33.391  H256V311.652z M356.174,278.261H256V244.87h100.174V278.261z M222.609,244.87v33.391h-66.783V244.87H222.609z M155.826,378.435  h66.783v33.391h-66.783V378.435z M256,411.826v-33.391h100.174v33.391H256z"/>
              <path className="svg-color-3" d="M372.87,211.478H256v33.391h100.174v33.391H256v33.391h100.174v33.391H256v33.391h100.174v33.391H256  v33.391h116.87c9.22,0,16.696-7.475,16.696-16.696V228.174C389.565,218.953,382.09,211.478,372.87,211.478z"/>
            </svg>Select Google sheet</button>
        </div>
        <div className="setting-panel flex justify-between">
          {isSignedIn ? (
            <div className="flex flex-row flex-1 justify-between">
              <button onClick={handleSignOutClick} className="py-2 px-4 bg-red-500 text-white rounded hover:bg-red-700">Sign Out</button>
              <button onClick={handleSaveGoogleInfo} className="rounded-md border dark:border-white/20 py-2 px-4">Save</button>
            </div>
          ) : (
            <button onClick={handleSignInClick}>Sign In</button>
          )}
        </div>
        <div className="setting-panel flex justify-between">
          {isSignedIn && (
            <div>
              <h3>Sheets name:</h3>
              <input
                className="flex-grow rounded-md border dark:text-gray-100 dark:bg-gray-850 dark:border-white/20 px-2 py-1 w-full"
                type="text"
                placeholder="Sheets Name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <ul className="google-sheet-list rounded-md border dark:text-gray-100 dark:bg-gray-850 dark:border-white/20 mt-3 py-2 px-2">
                {filteredSheets.map((sheet: GoogleSheetInfo) => (
                  <li key={sheet.id} onClick={() => handleSheetClick(sheet.id, sheet.name)}>
                    {sheet.name}
                  </li>
                ))}
              </ul>
              {selectedSheetId && (
                <div>
                  <h4 className="mt-3">Selected Sheet ID: {selectedSheetId}</h4>
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
  );
};

export default UserSettingsModal;
