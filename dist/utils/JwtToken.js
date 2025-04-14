"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendToken = exports.refreshTokenOptions = exports.accessTokenOptions = void 0;
const redis_1 = require("../database/redis");
const accessTokenExpiry = parseInt(process.env.ACCESS_TOKEN_EXPIRY || "300", 10);
const refreshTokenExpiry = parseInt(process.env.REFRESH_TOKEN_EXPIRY || "300", 10);
exports.accessTokenOptions = {
    expires: new Date(Date.now() + accessTokenExpiry * 60 * 1000),
    maxAge: accessTokenExpiry * 60 * 1000,
    httpOnly: true,
    sameSite: "none",
    secure: true,
};
exports.refreshTokenOptions = {
    expires: new Date(Date.now() + refreshTokenExpiry * 24 * 60 * 60 * 1000),
    maxAge: refreshTokenExpiry * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "none",
    secure: true,
};
const SendToken = async (user, StatusCode, res) => {
    const accessToken = await user.signAccessToken();
    const refreshToken = await user.signRefreshToken();
    //   --Upload-Redis----
    await redis_1.redis.set(user._id, JSON.stringify(user));
    res.cookie("accessToken", accessToken, exports.accessTokenOptions);
    res.cookie("refreshToken", refreshToken, exports.refreshTokenOptions);
    res.status(StatusCode).json({
        success: true,
        user,
        accessToken,
    });
};
exports.SendToken = SendToken;
