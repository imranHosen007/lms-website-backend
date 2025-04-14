"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizationRole = exports.isAuthenticated = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const redis_1 = require("../database/redis");
const isAuthenticated = async (req, res, next) => {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
        return next(new ErrorHandler_1.default(`Please Login to Access This Token`, 400));
    }
    const decoded = (await jsonwebtoken_1.default.verify(accessToken, process.env.ACCESS_TOKEN_SECRET));
    if (!decoded) {
        return next(new ErrorHandler_1.default(`Access Token Is Not Valid`, 400));
    }
    const user = await redis_1.redis.get(decoded.id);
    if (!user) {
        return next(new ErrorHandler_1.default(`User Not Found`, 400));
    }
    req.user = JSON.parse(user);
    next();
};
exports.isAuthenticated = isAuthenticated;
// -------User-Role-----
const authorizationRole = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req?.user?.role || "")) {
            return next(new ErrorHandler_1.default(`Role ${req?.user?.role} is not allowed to access`, 400));
        }
        next();
    };
};
exports.authorizationRole = authorizationRole;
