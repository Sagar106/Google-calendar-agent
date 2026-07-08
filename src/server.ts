import express from "express";
import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

const YOUR_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const YOUR_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const YOUR_REDIRECT_URL = process.env.GOOGLE_REDIRECT_URL;

const app = express();

const oauth2Client = new google.auth.OAuth2(
    YOUR_CLIENT_ID,
    YOUR_CLIENT_SECRET,
    YOUR_REDIRECT_URL
);

app.get("/", (req, res) => {
    res.send("Hello, Welcome to the Google Calendar Agent!");
});

app.get("/auth", (req, res) => {
    // Handle authentication logic here
    const scopes = ["https://www.googleapis.com/auth/calendar"];

    const link = oauth2Client.generateAuthUrl({
        access_type: "offline",
        prompt: "consent",
        scope: scopes
    });

    console.log("Link: ", link)

    res.redirect(link)
});

app.get("/calendar-callback", async (req, res) => {
    // Handle callback logic here
    const code = req.query.code as string;

    // exchange code for access token and refresh token
    const { tokens } = await oauth2Client.getToken(code)

    console.log("Tokens: ", tokens)

    res.send("Connected to Google Calendar");
});

app.listen(8000, () => {
    console.log("Server is running on http://localhost:8000");
});