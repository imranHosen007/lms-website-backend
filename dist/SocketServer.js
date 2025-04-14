"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocketServer = void 0;
const socket_io_1 = require("socket.io");
const initSocketServer = (server) => {
    const io = new socket_io_1.Server(server);
    io.on("connection", (socket) => {
        socket.on("notifaction", (data) => {
            io.emit(`newNotifacton`, data);
        });
        socket.on(`disconnect`, () => { });
    });
};
exports.initSocketServer = initSocketServer;
