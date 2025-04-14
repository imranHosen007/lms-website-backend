import { app } from ".";
import { DbConncect } from "./database/database";
import { v2 as cloudinary } from "cloudinary";
const PORT = process.env.PORT || 6000;

import http from "http";
import { initSocketServer } from "./SocketServer";
const server = http.createServer(app);

// ------Database-Connection------
DbConncect();
// ------cloudinary-Config--------
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_API_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
// -----Sokcet-io-------
initSocketServer(server);
server.listen(PORT, () => {
  console.log(`Server Is Running ${PORT}`);
});
