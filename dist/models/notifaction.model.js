"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const NotifactionSchema = new mongoose_1.default.Schema({
    title: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
        default: "unread",
    },
}, {
    timestamps: true,
});
const NotifactionModel = mongoose_1.default.model("Notifaction", NotifactionSchema);
exports.default = NotifactionModel;
