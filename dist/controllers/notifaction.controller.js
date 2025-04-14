"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateNotifaction = exports.getAllNotifaction = void 0;
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const notifaction_model_1 = __importDefault(require("../models/notifaction.model"));
const node_cron_1 = __importDefault(require("node-cron"));
// -----get-All-Notifaction------
const getAllNotifaction = async (req, res, next) => {
    try {
        const notifaction = await notifaction_model_1.default.find().sort({
            createdAt: -1,
        });
        res.status(200).json({
            success: true,
            notifaction,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
};
exports.getAllNotifaction = getAllNotifaction;
// ----Update-Notifaction------
const updateNotifaction = async (req, res, next) => {
    try {
        const notifaction = await notifaction_model_1.default.findById(req.params.id);
        if (notifaction) {
            notifaction.status = "read";
        }
        await notifaction?.save();
        res.status(200).json({
            success: true,
            notifaction,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
};
exports.updateNotifaction = updateNotifaction;
// ----Delete-Notifaction-cron------
node_cron_1.default.schedule("0 0 0 * * * *", async () => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    await notifaction_model_1.default.deleteMany({
        status: "read",
        createdAt: { $lt: thirtyDaysAgo },
    });
    console.log("deleted Read Notifaction");
});
