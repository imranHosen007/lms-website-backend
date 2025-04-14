import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import NotifactionModel from "../models/notifaction.model";
import cron from "node-cron";
// -----get-All-Notifaction------

export const getAllNotifaction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const notifaction = await NotifactionModel.find().sort({
      createdAt: -1,
    });
    res.status(200).json({
      success: true,
      notifaction,
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
};

// ----Update-Notifaction------

export const updateNotifaction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const notifaction = await NotifactionModel.findById(req.params.id);

    if (notifaction) {
      notifaction.status = "read";
    }
    await notifaction?.save();
    res.status(200).json({
      success: true,
      notifaction,
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
};

// ----Delete-Notifaction-cron------

cron.schedule("0 0 0 * * * *", async () => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  await NotifactionModel.deleteMany({
    status: "read",
    createdAt: { $lt: thirtyDaysAgo },
  });
  console.log("deleted Read Notifaction");
});
