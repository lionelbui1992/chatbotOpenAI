class User {
    id: number;
    domain: string;
    email: string;
    name: string;
    token: string;
    settings?: object;

    constructor(
        id: number,
        domain: string,
        email: string,
        name: string,
        token: string,
        settings?: object
    ) {
        this.id = id;
        this.domain = domain;
        this.email = email;
        this.name = name;
        this.token = token;
        this.settings = settings;
    }
}

class UserSettings {
    sheet_name?: string;
    spreadsheet_id?: string;
    tag?: string[];

    constructor(sheet_name?: string, spreadsheet_id?: string, tag?: string[]) {
        this.sheet_name = sheet_name;
        this.spreadsheet_id = spreadsheet_id;
        this.tag = tag;
    }
}

export default User;
export { UserSettings };