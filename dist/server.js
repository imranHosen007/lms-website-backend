"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const database_1 = require("./database/database");
const cloudinary_1 = require("cloudinary");
const PORT = process.env.PORT || 6000;
const http_1 = __importDefault(require("http"));
const SocketServer_1 = require("./SocketServer");
const server = http_1.default.createServer(_1.app);
// ------Database-Connection------
(0, database_1.DbConncect)();
// ------cloudinary-Config--------
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_API_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
// -----Sokcet-io-------
(0, SocketServer_1.initSocketServer)(server);
server.listen(PORT, () => {
    console.log(`Server Is Running ${PORT}`);
});
