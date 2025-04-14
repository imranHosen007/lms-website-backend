"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const ReviewSchema = new mongoose_1.default.Schema({
    user: Object,
    rating: {
        type: Number,
        default: 0,
    },
    review: String,
    commentReplies: [Object],
}, { timestamps: true });
const LinkSchema = new mongoose_1.default.Schema({
    title: String,
    url: String,
});
const CommentSchema = new mongoose_1.default.Schema({
    user: Object,
    question: String,
    questionReplies: [Object],
}, { timestamps: true });
const CourseDataSchema = new mongoose_1.default.Schema({
    videoUrl: String,
    title: String,
    description: String,
    videoSection: String,
    videoLength: Number,
    videoPlayer: String,
    suggestion: String,
    links: [LinkSchema],
    question: [CommentSchema],
});
const CourseSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    estimatePrice: Number,
    thumbnail: {
        public_id: {
            type: String,
        },
        url: { type: String },
    },
    tags: {
        type: String,
        required: true,
    },
    level: { type: String, required: true },
    demoUrl: { type: String, required: true },
    benefits: [{ title: String }],
    prerequisite: [{ title: String }],
    review: [ReviewSchema],
    courseData: [CourseDataSchema],
    ratings: {
        type: Number,
        default: 0,
    },
    purchase: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});
const CourseModel = mongoose_1.default.model(`Course`, CourseSchema);
exports.default = CourseModel;
