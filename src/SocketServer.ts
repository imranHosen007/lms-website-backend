import { Server as SocketIOServer } from "socket.io";

import http from "http";

export const initSocketServer = (server: http.Server) => {
  const io = new SocketIOServer(server);

  io.on("connection", (socket) => {
    socket.on("notifaction", (data) => {
      io.emit(`newNotifacton`, data);
    });
    socket.on(`disconnect`, () => {});
  });
};
