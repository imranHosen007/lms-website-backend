import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import { generateLast12MonthData } from "../utils/Analytics";
import UserModel from "../models/user.model";
import CourseModel from "../models/course.model";
import OrderModel from "../models/order.model";

// ---Get-User-analytics

export const getUserAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await generateLast12MonthData(UserModel);

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
};
// ---Get-Course-analytics

export const getCourseAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const courses = await generateLast12MonthData(CourseModel);

    res.status(200).json({
      success: true,
      courses,
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
};
// ---Get-Order-analytics

export const getOrderAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orders = await generateLast12MonthData(OrderModel);

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
};
