import { USER_ENDPOINT } from "../constants/apiEndpoints";
import { GoogleSelectedDetails, UserSettings } from '../models/User';

class UserService {
    // static async getSettings(token: string): Promise<UserSettings | null> {
    //     const response = await fetch(USER_ENDPOINT + '/settings', {
    //         headers: {
    //           'Authorization': `Bearer ${token}`,
    //         },
    //     });
    //     const data = await response.json();
    //     if (response.status === 200) {
    //         return data.data;
    //     } else {
    //         return null;
    //     }
    // }

    static async updateSettings(userSettings: UserSettings): Promise<Response> {
        return await fetch(USER_ENDPOINT + '/settings', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userSettings.access_token}`,
            },
            body: JSON.stringify(userSettings),
        });
    }

    static async updateGoogleSettings(token: string, googleAccessToken: string, googleSelectedDetails: GoogleSelectedDetails[], updateData = true): Promise<any> {
        const response = await fetch(USER_ENDPOINT + '/google', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                googleAccessToken,
                googleSelectedDetails,
                updateData,
            }),
        });
        const {data} = await response.json();
        const status = response.status;
        return { data, status };
    }
}

export default UserService;
