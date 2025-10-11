"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const express = __importStar(require("express"));
const socket_io_1 = require("socket.io");
const http = __importStar(require("http"));
const cookieParser = __importStar(require("cookie-parser"));
const server_manager_1 = __importDefault(require("./controllers/server_manager/server_manager"));
const send_email_1 = __importDefault(require("./api/feedback/send_email"));
// TODO: should i separate express and socket servers into separate apps?
const app = express();
const httpServer = http.createServer(app);
const io = new socket_io_1.Server(httpServer);
io.listen(4444);
app.use(cookieParser());
app.use(express.json());
// https://github.com/nodejs/help/issues/705#issuecomment-757578500
httpServer.on("clientError", console.error);
httpServer.on("error", console.error);
app.post("/api/feedback", async (req, res) => {
    const { email, content } = req.body;
    const { id, name } = req.cookies;
    await (0, send_email_1.default)({
        subject: `${name} - Crossable Feedback!`,
        textBody: `${id || "no id"}
    ${email || "--No email provided--"}
    ${content || "--No content provided--"}`,
    });
    res.send("Success!");
});
io.on("connection", server_manager_1.default.onSocketConnect.bind(server_manager_1.default));
const port = process.env.port || 3333;
const server = app.listen(port, () => {
    console.log("Listening at http://localhost:" + port + "/api");
});
server.on("error", console.error);
server.on("clientError", console.error);
