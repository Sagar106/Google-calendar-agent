import z from "zod"

export const getEventsSchema = z.object({
    q: z.string().describe("The query to be used to get google calendar events. It can be one of these values: summary, description, location, attendees email, organiser's name, organiser's email"),
    timeMin: z.string().describe("The from datetime in UTC format for the event."),
    timeMax: z.string().describe("The to datetime in UTC format for the event."),
})

export type Params = z.infer<typeof getEventsSchema>

export const createEventSchema = z.object({
    summary: z.string().describe("The summary of the event."),
    start: z.object({
        dateTime: z.string().describe("The start datetime of the event in UTC format."),
        timeZone: z.string().describe("The timezone of the event."),
    }).describe("The start datetime and timezone of the event."),
    end: z.object({
        dateTime: z.string().describe("The end datetime of the event in UTC format."),
        timeZone: z.string().describe("The timezone of the event."),
    }).describe("The end datetime and timezone of the event."),
    attendees: z.array(z.object({
        email: z.string().describe("The email of the attendee."),
        displayName: z.string().describe("The display name of the attendee."),
    })).describe("The list of attendees for the event."),
})

export type EventData = z.infer<typeof createEventSchema>