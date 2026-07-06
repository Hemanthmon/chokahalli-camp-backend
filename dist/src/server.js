"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const http_1 = require("http");
const app_1 = __importDefault(require("./app"));
const db_1 = require("./db");
const seedAdmin_1 = require("./common/seedAdmin");
const socketServer_1 = require("./socket/socketServer");
const PORT = Number(process.env.PORT) || 5000;
const httpServer = (0, http_1.createServer)(app_1.default);
(0, socketServer_1.initSocket)(httpServer);
httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
db_1.pool
    .connect()
    .then(async (client) => {
    client.release();
    await (0, seedAdmin_1.seedAdmin)();
})
    .catch(() => {
    // connection errors are already logged in ./db
});
