import { AUTH_ENDPOINT } from '../constants/apiEndpoints';
import { toast } from 'react-toastify';
import User, { UserSettings } from '../models/User';

class Auth {
    static async register(domain: string, email: string, password: string, rePassword: string): Promise<User | null> {
        const response = await fetch(`${AUTH_ENDPOINT}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ domain, email, password, re_password: rePassword }),
        });
        const data = await response.json();
        if (response.status === 200) {
            const { token, user } = data.data;
            localStorage.setItem('userToken', token);
            localStorage.setItem('userSettings', JSON.stringify(user.settings));
            return new User(user.id, user.domain, user.email, user.name, token, new UserSettings(user.settings.sheet_name, user.settings.spreadsheet_id, user.settings.tag));
        } else {
            toast.error(data.message);
            return null;
        }
    }

    static async login(email: string, password: string): Promise<User | null> {
        const response = await fetch(`${AUTH_ENDPOINT}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (response.status === 200) {
            const { token, user } = data.data;
            localStorage.setItem('userToken', token);
            localStorage.setItem('userSettings', JSON.stringify(user.settings));
            return new User(user.id, user.domain, user.email, user.name, token, new UserSettings(user.settings.sheet_name, user.settings.spreadsheet_id, user.settings.tag));
        } else {
            toast.error(data.message);
            return null;
        }
    }
}

export default Auth;