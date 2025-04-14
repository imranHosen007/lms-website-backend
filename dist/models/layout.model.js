"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const FaqSchema = new mongoose_1.default.Schema({
    question: String,
    answar: String,
});
const CategorySchema = new mongoose_1.default.Schema({
    title: String,
});
const BannerSchema = new mongoose_1.default.Schema({
    public_id: String,
    url: String,
});
const LayoutSchema = new mongoose_1.default.Schema({
    type: {
        type: String,
        required: true,
    },
    faq: [FaqSchema],
    banner: {
        image: BannerSchema,
        title: String,
        subtitle: String,
    },
    category: [CategorySchema],
});
const LayoutModel = mongoose_1.default.model("Layout", LayoutSchema);
exports.default = LayoutModel;
