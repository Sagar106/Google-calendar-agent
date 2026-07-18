import { tool } from "@langchain/core/tools";
import { google } from "googleapis";
import z from "zod";
import dotenv from "dotenv";
import tokens from "./tokens.json" with { type: "json" };

dotenv.config();

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URL
);

oauth2Client.setCredentials(tokens)

const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

type Params = {
    q: string;
    timeMin: string;
    timeMax: string;
}

export const getEvents = tool(
    async (params) => {
        const { q, timeMin, timeMax } = params as Params;

        try {
            const response = await calendar.events.list({
                calendarId: "primary",
                q: q,
                timeMin,
                timeMax,
            })

            console.log("Events: ", response.data.items)

            const result = response.data.items?.map((event) => {
                return {
                    id: event.id,
                    summary: event.summary,
                    status: event.status,
                    orgnizer: event.organizer?.email,
                    start: event.start,
                    end: event.end,
                    attendees: event.attendees?.map((attendee) => attendee.email),
                    meetingLink: event.hangoutLink,
                    eventType: event.eventType,
                }
            })

            return JSON.stringify(result)
        } catch (error) {
            console.log("Error fetching events: ", error);
        }

        return "Failed to connect to the Calendar."
    },
    {
        name: "get-calendar-events",
        description: "Call to get the calendar events.",
        schema: z.object({
            q: z.string().describe("The query to be used to get google calendar events. It can be one of these values: summary, description, location, attendees email, organiser's name, organiser's email"),
            timeMin: z.string().describe("The from datetime in UTC format for the event."),
            timeMax: z.string().describe("The to datetime in UTC format for the event."),
        }),
    },
);

export const createEvent = tool(
    async () => {
        // Google calendar logic goes here
        return "The meeting has been created successfully.";
    },
    {
        name: "create-calendar-event",
        description: "Call to create a new calendar event.",
        schema: z.object({
            query: z.string().describe("The query to be used to create google calendar event."),
        }),
    },
);