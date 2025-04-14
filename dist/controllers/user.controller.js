"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUserRole = exports.getAllUser = exports.updateProfilePicture = exports.changeUserPassword = exports.updateUserInformation = exports.createUserSocial = exports.getUserInfo = exports.updateAccesssToken = exports.logoutUser = exports.loginUser = exports.activateUser = exports.createNewUser = exports.creationActivationToken = void 0;
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const user_model_1 = __importDefault(require("../models/user.model"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const cloudinary_1 = __importDefault(require("cloudinary"));
const JwtToken_1 = require("../utils/JwtToken");
const redis_1 = require("../database/redis");
const Mailer_1 = require("../utils/Mailer");
const creationActivationToken = (user) => {
    const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
    const token = jsonwebtoken_1.default.sign({ user, activationCode }, process.env.ACTIVATION_TOKEN_SECRET, {
        expiresIn: "10m",
    });
    return { token, activationCode };
};
exports.creationActivationToken = creationActivationToken;
const createNewUser = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        const isExitsEmail = await user_model_1.default.findOne({ email });
        if (isExitsEmail) {
            return next(new ErrorHandler_1.default(`User Already Exits`, 400));
        }
        const newUser = {
            name,
            email,
            password,
        };
        const activeationToken = (0, exports.creationActivationToken)(newUser);
        const activationCode = activeationToken.activationCode;
        try {
            (0, Mailer_1.ActivateSendMail)({
                name: newUser.name,
                email: newUser.email,
                subject: "Actiavtion Your Account",
                activationCode,
            });
            res.status(200).json({
                success: true,
                message: `Please Check Your Email ${newUser.email} to Activate Your Account`,
                activeationToken: activeationToken.token,
            });
        }
        catch (error) {
            return next(new ErrorHandler_1.default(error.message, 400));
        }
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
};
exports.createNewUser = createNewUser;
const activateUser = async (req, res, next) => {
    try {
        const { activation_token, activation_code } = req.body;
        const newUser = jsonwebtoken_1.default.verify(activation_token, process.env.ACTIVATION_TOKEN_SECRET);
        const { name, email, password } = newUser.user;
        if (newUser.activationCode !== activation_code) {
            return next(new ErrorHandler_1.default(`Invalid Activation Code`, 400));
        }
        const exitsingUser = await user_model_1.default.findOne({ email });
        if (exitsingUser) {
            return next(new ErrorHandler_1.default(`User Already Exits`, 400));
        }
        const user = await user_model_1.default.create({
            name,
            email,
            password,
        });
        res.status(200).json({
            success: true,
            message: "User Activation SuccesFull",
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
};
exports.activateUser = activateUser;
const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return next(new ErrorHandler_1.default(`Please Provide Email And Passowrd`, 400));
        }
        const user = await user_model_1.default.findOne({ email }).select("+password");
        if (!user) {
            return next(new ErrorHandler_1.default(`Invalid Email Or Password `, 400));
        }
        const isPasswordMatched = await user.comparePassword(password);
        if (!isPasswordMatched) {
            return next(new ErrorHandler_1.default(`Please provide the correct Password`, 400));
        }
        (0, JwtToken_1.SendToken)(user, 200, res);
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
};
exports.loginUser = loginUser;
// ----Logout--User------
const logoutUser = async (req, res, next) => {
    try {
        res.cookie("accessToken", "", { maxAge: 1 });
        res.cookie("refreshToken", "", { maxAge: 1 });
        await redis_1.redis.del(req.user?._id);
        res.status(200).json({
            success: true,
            message: "Log Out SuccessFull",
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
};
exports.logoutUser = logoutUser;
// -----Update-Access-Token-----
const updateAccesssToken = async (req, res, next) => {
    try {
        const refresh_Token = req.cookies.refreshToken;
        if (!refresh_Token) {
            return next(new ErrorHandler_1.default(`Please Login to Access This Token`, 400));
        }
        const decoded = jsonwebtoken_1.default.verify(refresh_Token, process.env.REFRESH_TOKEN_SECRET);
        if (!decoded) {
            return next(new ErrorHandler_1.default(`
        Could Not Refresh Token`, 400));
        }
        const session = await redis_1.redis.get(decoded.id);
        if (!session) {
            return next(new ErrorHandler_1.default(`
        Could Not Refresh Token`, 400));
        }
        const user = JSON.parse(session);
        const accessToken = jsonwebtoken_1.default.sign({
            id: user?._id,
        }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "30m",
        });
        const refreshToken = jsonwebtoken_1.default.sign({
            id: user?._id,
        }, process.env.REFRESH_TOKEN_SECRET, {
            expiresIn: "30d",
        });
        req.user = user;
        res.cookie("accessToken", accessToken, JwtToken_1.accessTokenOptions);
        res.cookie("refreshToken", refreshToken, JwtToken_1.refreshTokenOptions);
        await redis_1.redis.set(user?._id, JSON.stringify(user), "EX", 604800);
        next();
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
};
exports.updateAccesssToken = updateAccesssToken;
// ----get-User-Info---
const getUserInfo = async (req, res, next) => {
    try {
        const userJson = await redis_1.redis.get(req.user?._id);
        if (userJson) {
            const user = JSON.parse(userJson);
            res.status(200).json({
                success: true,
                user,
            });
        }
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
};
exports.getUserInfo = getUserInfo;
const createUserSocial = async (req, res, next) => {
    try {
        const { name, email, avatar } = req.body;
        console.log(`SocailAuth Run`);
        const isExitsUser = await user_model_1.default.findOne({ email });
        if (!isExitsUser) {
            const newUser = await user_model_1.default.create({
                email,
                name,
                avatar: {
                    url: avatar,
                },
            });
            await (0, JwtToken_1.SendToken)(newUser, 200, res);
        }
        else {
            console.log(isExitsUser);
            await (0, JwtToken_1.SendToken)(isExitsUser, 200, res);
        }
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
};
exports.createUserSocial = createUserSocial;
const updateUserInformation = async (req, res, next) => {
    try {
        const { name } = req.body;
        const userId = req?.user?._id;
        const user = await user_model_1.default.findById(userId);
        if (name && user) {
            user.name = name;
        }
        await user?.save();
        redis_1.redis.set(userId, JSON.stringify(user));
        res.status(200).json({
            success: true,
            user,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
};
exports.updateUserInformation = updateUserInformation;
const changeUserPassword = async (req, res, next) => {
    try {
        const { newPassword, oldPassword } = req.body;
        const user = await user_model_1.default.findById(req?.user?._id).select("+password");
        if (user?.password == undefined) {
            return next(new ErrorHandler_1.default("Invalid User", 400));
        }
        const isPasswordMatched = await user?.comparePassword(oldPassword);
        if (!isPasswordMatched) {
            return next(new ErrorHandler_1.default("Old password is incorrect!", 400));
        }
        user.password = newPassword;
        await user?.save();
        redis_1.redis.set(user._id, JSON.stringify(user));
        res.status(200).json({
            success: true,
            user,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
};
exports.changeUserPassword = changeUserPassword;
const updateProfilePicture = async (req, res, next) => {
    try {
        const { avatar } = req.body;
        const user = await user_model_1.default.findById(req.user?._id);
        if (avatar && user) {
            if (user?.avatar?.public_id) {
                await cloudinary_1.default.v2.uploader.destroy(user?.avatar?.public_id);
                const myUpload = await cloudinary_1.default.v2.uploader.upload(avatar, {
                    folder: "avatars",
                });
                user.avatar = {
                    public_id: myUpload.public_id,
                    url: myUpload.secure_url,
                };
            }
            else {
                const myUpload = await cloudinary_1.default.v2.uploader.upload(avatar, {
                    folder: "avatars",
                });
                user.avatar = {
                    public_id: myUpload.public_id,
                    url: myUpload.secure_url,
                };
            }
        }
        const updateUser = await user?.save();
        await redis_1.redis.set(req.user?._id, JSON.stringify(user));
        res.status(200).json({
            success: true,
            user,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
};
exports.updateProfilePicture = updateProfilePicture;
// ----get-all-User---
const getAllUser = async (req, res, next) => {
    try {
        const user = await user_model_1.default.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            user,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
};
exports.getAllUser = getAllUser;
// -------Update-User-Role-----
const updateUserRole = async (req, res, next) => {
    try {
        const { email, role } = req.body;
        const user = await user_model_1.default.findOneAndUpdate({ email }, { role }, { new: true });
        res.status(200).json({
            success: true,
            // user,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
};
exports.updateUserRole = updateUserRole;
// -----Delete-User----
const deleteUser = async (req, res, next) => {
    try {
        const user = await user_model_1.default.findByIdAndDelete(req.params.id);
        if (!user) {
            return next(new ErrorHandler_1.default(`User Not Found`, 404));
        }
        await redis_1.redis.del(req.params.id);
        res.status(200).json({
            success: true,
            message: "Course Delete SuccessFull",
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
};
exports.deleteUser = deleteUser;
