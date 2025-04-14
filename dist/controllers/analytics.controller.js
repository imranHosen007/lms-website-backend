"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrderAnalytics = exports.getCourseAnalytics = exports.getUserAnalytics = void 0;
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const Analytics_1 = require("../utils/Analytics");
const user_model_1 = __importDefault(require("../models/user.model"));
const course_model_1 = __importDefault(require("../models/course.model"));
const order_model_1 = __importDefault(require("../models/order.model"));
// ---Get-User-analytics
const getUserAnalytics = async (req, res, next) => {
    try {
        const users = await (0, Analytics_1.generateLast12MonthData)(user_model_1.default);
        res.status(200).json({
            success: true,
            users,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
};
exports.getUserAnalytics = getUserAnalytics;
// ---Get-Course-analytics
const getCourseAnalytics = async (req, res, next) => {
    try {
        const courses = await (0, Analytics_1.generateLast12MonthData)(course_model_1.default);
        res.status(200).json({
            success: true,
            courses,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
};
exports.getCourseAnalytics = getCourseAnalytics;
// ---Get-Order-analytics
const getOrderAnalytics = async (req, res, next) => {
    try {
        const orders = await (0, Analytics_1.generateLast12MonthData)(order_model_1.default);
        res.status(200).json({
            success: true,
            orders,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
};
exports.getOrderAnalytics = getOrderAnalytics;
