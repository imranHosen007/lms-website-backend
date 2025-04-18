"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const OrderSchema = new mongoose_1.default.Schema({
    courseId: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        // required: true,
    },
    payment_info: {
        type: Object,
        //     required: true,
    },
}, {
    timestamps: true,
});
const OrderModel = mongoose_1.default.model("Order", OrderSchema);
exports.default = OrderModel;
