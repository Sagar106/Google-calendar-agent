import { tool } from "@langchain/core/tools";
import z from "zod";

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

export const getEvents = tool(
    async () => {
        // Google calendar logic goes here
        return JSON.stringify([
            { title: "Meeting with Sujoy", time: "2 PM", location: "Google Meet" },
        ]);
    },
    {
        name: "get-calendar-events",
        description: "Call to get the calendar events.",
        schema: z.object({
            query: z.string().describe("The query to be used to get google calendar events."),
        }),
    },
);