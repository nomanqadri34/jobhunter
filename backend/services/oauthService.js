import { google } from 'googleapis';
import axios from 'axios';

// Google OAuth configuration
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

export const oauthService = {
    // Google OAuth
    getGoogleAuthUrl() {
        const scopes = [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/drive.readonly'
        ];

        return oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes,
            prompt: 'consent'
        });
    },

    async handleGoogleCallback(code) {
        try {
            const { tokens } = await oauth2Client.getToken(code);
            oauth2Client.setCredentials(tokens);

            // Get user info
            const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
            const userInfo = await oauth2.userinfo.get();

            return {
                tokens,
                userInfo: userInfo.data
            };
        } catch (error) {
            console.error('Google OAuth error:', error);
            throw error;
        }
    },

    // LinkedIn OAuth
    getLinkedInAuthUrl() {
        const clientId = process.env.LINKEDIN_CLIENT_ID;
        const redirectUri = encodeURIComponent(process.env.LINKEDIN_REDIRECT_URI);
        const scope = encodeURIComponent('r_liteprofile r_emailaddress');

        return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
    },

    async handleLinkedInCallback(code) {
        try {
            // Exchange code for access token
            const tokenResponse = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', {
                grant_type: 'authorization_code',
                code,
                redirect_uri: process.env.LINKEDIN_REDIRECT_URI,
                client_id: process.env.LINKEDIN_CLIENT_ID,
                client_secret: process.env.LINKEDIN_CLIENT_SECRET
            }, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            const accessToken = tokenResponse.data.access_token;

            // Get user profile
            const profileResponse = await axios.get('https://api.linkedin.com/v2/people/~', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            // Get user email
            const emailResponse = await axios.get('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            return {
                accessToken,
                profile: profileResponse.data,
                email: emailResponse.data.elements[0]['handle~'].emailAddress
            };
        } catch (error) {
            console.error('LinkedIn OAuth error:', error);
            throw error;
        }
    },

    // Google Calendar integration
    async createCalendarEvent(tokens, eventData) {
        try {
            oauth2Client.setCredentials(tokens);
            const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

            const event = {
                summary: eventData.title,
                description: eventData.description,
                start: {
                    dateTime: eventData.startTime,
                    timeZone: eventData.timeZone || 'America/New_York'
                },
                end: {
                    dateTime: eventData.endTime,
                    timeZone: eventData.timeZone || 'America/New_York'
                },
                reminders: {
                    useDefault: false,
                    overrides: [
                        { method: 'email', minutes: 24 * 60 }, // 1 day before
                        { method: 'popup', minutes: 30 } // 30 minutes before
                    ]
                }
            };

            const response = await calendar.events.insert({
                calendarId: 'primary',
                resource: event
            });

            return response.data;
        } catch (error) {
            console.error('Calendar event creation error:', error);
            throw error;
        }
    },

    // Create interview reminder
    async createInterviewReminder(tokens, jobTitle, company, interviewDate) {
        const eventData = {
            title: `Interview: ${jobTitle} at ${company}`,
            description: `Prepare for your ${jobTitle} interview at ${company}. Review your resume, research the company, and practice common interview questions.`,
            startTime: new Date(interviewDate).toISOString(),
            endTime: new Date(new Date(interviewDate).getTime() + 60 * 60 * 1000).toISOString() // 1 hour duration
        };

        return this.createCalendarEvent(tokens, eventData);
    },

    // Create job application reminder
    async createApplicationReminder(tokens, jobTitle, company, applicationDeadline) {
        const reminderDate = new Date(applicationDeadline);
        reminderDate.setDate(reminderDate.getDate() - 1); // 1 day before deadline

        const eventData = {
            title: `Apply: ${jobTitle} at ${company}`,
            description: `Reminder to apply for ${jobTitle} position at ${company}. Deadline: ${new Date(applicationDeadline).toLocaleDateString()}`,
            startTime: reminderDate.toISOString(),
            endTime: new Date(reminderDate.getTime() + 30 * 60 * 1000).toISOString() // 30 minutes duration
        };

        return this.createCalendarEvent(tokens, eventData);
    }
};