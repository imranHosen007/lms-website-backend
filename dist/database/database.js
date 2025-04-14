"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbConncect = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dbUri = process.env.DB_URI || "";
const DbConncect = () => {
    mongoose_1.default
        .connect(dbUri)
        .then((data) => console.log(`MongoDb Connect SuccesFull  `))
        .catch((error) => console.log(`MongoDb Connect ${error}`));
};
exports.DbConncect = DbConncect;
