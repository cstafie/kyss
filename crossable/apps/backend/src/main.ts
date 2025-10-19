import * as dotenv from "dotenv";
dotenv.config();

import express from "express";
import { Server } from "socket.io";
import * as http from "http";
import cookieParser from "cookie-parser";

import {
  FeedbackInfo,
  ServerToClientEvents,
  ClientToServerEvents,
} from "shared";

import serverManager from "./controllers/server/server_manager";
import sendEmail from "./api/feedback/send_email";

const app = express();

const httpServer = http.createServer(app);
const io = new Server<ServerToClientEvents, ClientToServerEvents>(httpServer, {
  cors: {
    // TODO: double check once everything is dockerized
    origin: ["http://localhost:5173", "http://localhost:5173/"], // frontend origin
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["content-type"],
  },
});

app.use(cookieParser());
app.use(express.json());

// https://github.com/nodejs/help/issues/705#issuecomment-757578500
httpServer.on("clientError", console.error);
httpServer.on("error", console.error);

// TODO: double check this works with docker setup
app.post("/api/feedback", async (req, res) => {
  const { email, content } = req.body as FeedbackInfo;
  const { id, name } = req.cookies;

  console.log("Received feedback:", { email, content, id, name });
  if (!content || content.trim().length === 0) {
    res.status(400).send("Content is required");
    return;
  }

  await sendEmail({
    subject: `${name} - Crossable Feedback!`,
    textBody: `${id || "no id"}
    ${email || "--No email provided--"}
    ${content || "--No content provided--"}`,
  });

  res.send("Success!");
});

io.on("connection", serverManager.onSocketConnect.bind(serverManager));

const port = process.env.port || 3333;

httpServer.listen(port, () => {
  console.log("Listening at http://localhost:" + port + "...");
});

httpServer.on("error", console.error);
httpServer.on("clientError", console.error);
