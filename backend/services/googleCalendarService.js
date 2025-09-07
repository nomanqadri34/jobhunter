import { google } from 'googleapis';

class GoogleCalendarService {
    constructor() {
        this.calendar = google.calendar('v3');
    }

    async createInterviewReminder(accessToken, eventData) {
        try {
            const auth = new google.auth.OAuth2();
            auth.setCredentials({ access_token: accessToken });

            const { jobTitle, company, interviewDate, notes = '' } = eventData;

            const event = {
                summary: `Interview: ${jobTitle} at ${company}`,
                description: `Interview for ${jobTitle} position at ${company}\n\n${notes}`,
                start: {
                    dateTime: interviewDate,
                    timeZone: 'America/New_York', // Default timezone
                },
                end: {
                    dateTime: new Date(new Date(interviewDate).getTime() + 60 * 60 * 1000).toISOString(), // 1 hour duration
                    timeZone: 'America/New_York',
                },
                reminders: {
                    useDefault: false,
                    overrides: [
                        { method: 'email', minutes: 24 * 60 }, // 1 day before
                        { method: 'popup', minutes: 60 }, // 1 hour before
                        { method: 'popup', minutes: 15 }, // 15 minutes before
                    ],
                },
                attendees: [],
                location: 'TBD - Check with recruiter',
            };

            // Create preparation reminder 3 days before
            const prepDate = new Date(interviewDate);
            prepDate.setDate(prepDate.getDate() - 3);

            const prepEvent = {
                summary: `Interview Prep: ${jobTitle} at ${company}`,
                description: `Start preparing for your ${jobTitle} interview at ${company}\n\nPreparation tasks:\n- Research the company\n- Review job description\n- Practice common interview questions\n- Prepare questions to ask\n- Plan your outfit and route`,
                start: {
                    dateTime: prepDate.toISOString(),
                    timeZone: 'America/New_York',
                },
                end: {
                    dateTime: new Date(prepDate.getTime() + 30 * 60 * 1000).toISOString(), // 30 minutes
                    timeZone: 'America/New_York',
                },
                reminders: {
                    useDefault: false,
                    overrides: [
                        { method: 'popup', minutes: 0 },
                    ],
                },
            };

            // Create both events
            const interviewEvent = await this.calendar.events.insert({
                auth,
                calendarId: 'primary',
                resource: event,
            });

            const preparationEvent = await this.calendar.events.insert({
                auth,
                calendarId: 'primary',
                resource: prepEvent,
            });

            return {
                success: true,
                interviewEvent: interviewEvent.data,
                preparationEvent: preparationEvent.data,
                message: 'Interview and preparation reminders created successfully'
            };
        } catch (error) {
            console.error('Google Calendar error:', error);
            throw new Error('Failed to create calendar event: ' + error.message);
        }
    }

    async createApplicationDeadlineReminder(accessToken, eventData) {
        try {
            const auth = new google.auth.OAuth2();
            auth.setCredentials({ access_token: accessToken });

            const { jobTitle, company, deadline, applicationUrl = '' } = eventData;

            const event = {
                summary: `Application Deadline: ${jobTitle} at ${company}`,
                description: `Don't forget to apply for ${jobTitle} at ${company}\n\nApplication URL: ${applicationUrl}\n\nRemember to:\n- Tailor your resume\n- Write a compelling cover letter\n- Double-check all requirements`,
                start: {
                    dateTime: deadline,
                    timeZone: 'America/New_York',
                },
                end: {
                    dateTime: new Date(new Date(deadline).getTime() + 30 * 60 * 1000).toISOString(),
                    timeZone: 'America/New_York',
                },
                reminders: {
                    useDefault: false,
                    overrides: [
                        { method: 'email', minutes: 24 * 60 }, // 1 day before
                        { method: 'popup', minutes: 60 }, // 1 hour before
                    ],
                },
            };

            const result = await this.calendar.events.insert({
                auth,
                calendarId: 'primary',
                resource: event,
            });

            return {
                success: true,
                event: result.data,
                message: 'Application deadline reminder created successfully'
            };
        } catch (error) {
            console.error('Google Calendar error:', error);
            throw new Error('Failed to create application reminder: ' + error.message);
        }
    }

    async listUpcomingInterviews(accessToken, maxResults = 10) {
        try {
            const auth = new google.auth.OAuth2();
            auth.setCredentials({ access_token: accessToken });

            const now = new Date().toISOString();
            const response = await this.calendar.events.list({
                auth,
                calendarId: 'primary',
                timeMin: now,
                maxResults: maxResults,
                singleEvents: true,
                orderBy: 'startTime',
                q: 'Interview',
            });

            return {
                success: true,
                events: response.data.items || [],
                message: 'Upcoming interviews retrieved successfully'
            };
        } catch (error) {
            console.error('Google Calendar error:', error);
            throw new Error('Failed to retrieve calendar events: ' + error.message);
        }
    }
}

export default new GoogleCalendarService();