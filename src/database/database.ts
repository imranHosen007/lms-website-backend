import mongoose from "mongoose";

const dbUri: any = process.env.DB_URI || "";

export const DbConncect = () => {
  mongoose
    .connect(dbUri)
    .then((data: any) => console.log(`MongoDb Connect SuccesFull  `))
    .catch((error: any) => console.log(`MongoDb Connect ${error}`));
};
