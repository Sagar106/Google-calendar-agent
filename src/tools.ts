import { tool } from "@langchain/core/tools";
import { google } from "googleapis";
import z from "zod";
import dotenv from "dotenv";
import tokens from "./tokens.json" with { type: "json" };
import { createEventSchema, EventData, getEventsSchema, Params } from "./types.js";

dotenv.config();

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URL
);

oauth2Client.setCredentials(tokens)

const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

export const getEvents = tool(
    async (params: Params) => {
        const { q, timeMin, timeMax } = params;

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
                    organizer: event.organizer?.email,
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
        schema: getEventsSchema,
    },
);

export const createEvent = tool(
    async (eventData: EventData) => {
        console.log("Event Data: ", eventData)

        const { summary, start, end, attendees } = eventData

        const response = await calendar.events.insert({
            calendarId: "primary",
            sendUpdates: "all",
            conferenceDataVersion: 1,
            requestBody: {
                start,
                end,
                summary,
                attendees,
                conferenceData: {
                    createRequest: {
                        requestId: crypto.randomUUID(),
                        conferenceSolutionKey: {
                            type: "hangoutsMeet"
                        }
                    }
                }
            },
        })

        if (response.statusText === "OK") {
            return "The meeting has been created successfully."
        }

        return "Failed to create the meeting.";
    },
    {
        name: "create-calendar-event",
        description: "Call to create a new calendar event.",
        schema: createEventSchema,
    },
);