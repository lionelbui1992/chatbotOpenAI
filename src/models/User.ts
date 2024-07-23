import { Theme, UserTheme } from "../UserContext";

class User {
    id: string;
    role: string;
    domain: string;
    email: string;
    name: string;
    token: string;
    settings: UserSettings;

    constructor(
        id: string,
        role: string,
        domain: string,
        email: string,
        name: string,
        token: string,
        settings: UserSettings
    ) {
        this.id = id;
        this.role = role;
        this.domain = domain;
        this.email = email;
        this.name = name;
        this.token = token;
        this.settings = settings;
    }
}

interface GoogleSelectedDetails {
    id: string;
    sheetId: string;
    sheetName: string;
    title: string;
}

interface UserSettings {
    token?: string;
    user_id: string | null;
    role: string;
    domain: string;
    email: string;
    name: string;
    userTheme: UserTheme;
    theme: Theme;
    model: string | null;
    instructions: string;
    speechModel: string;
    speechVoice: string;
    speechSpeed: number;
    googleAccessToken: string;
    googleSelectedDetails: GoogleSelectedDetails[];
    tags: string[] | null;
}

const defaultUserSettings: UserSettings = {
    token: undefined,
    user_id: null,
    role: 'user',
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

export default User;
export type { UserSettings, GoogleSelectedDetails };
export { defaultUserSettings };
