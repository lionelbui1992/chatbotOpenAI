import { Theme, UserTheme } from "../UserContext";

class User {
    id: string;
    domain: string;
    email: string;
    name: string;
    token: string;
    settings: UserSettings;

    constructor(
        id: string,
        domain: string,
        email: string,
        name: string,
        token: string,
        settings: UserSettings
    ) {
        this.id = id;
        this.domain = domain;
        this.email = email;
        this.name = name;
        this.token = token;
        this.settings = settings;
    }
}

interface UserSettings {
    token?: string;
    user_id: string | null;
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
    sheetName: string;
    spreadsheetID: string;
    tags: string[] | null;
}

export default User;
export type { UserSettings };
