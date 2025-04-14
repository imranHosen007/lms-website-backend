import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import OrderModel, { IOrder } from "../models/order.model";
import UserModel from "../models/user.model";
import CourseModel from "../models/course.model";
import { OrderConfirmationMail } from "../utils/Mailer";
import NotifactionModel from "../models/notifaction.model";
import Stripe from "stripe";
import { redis } from "../database/redis";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export const createNewOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { courseId, payment_info } = req.body as IOrder;
    const user = await UserModel.findById(req.user?._id);
    const course = await CourseModel.findById(courseId);
    const isCourseExits = user?.course.find((cou) => cou.courseId == courseId);

    if (payment_info) {
      if ("id" in payment_info) {
        const paymentIntentsId = payment_info.id;
        const paymentIntents = await stripe.paymentIntents.retrieve(
          paymentIntentsId as any
        );
        if (paymentIntents.status !== "succeeded") {
          return next(new ErrorHandler("Payment Not Valid", 400));
        }
      }
    }
    if (isCourseExits) {
      return next(
        new ErrorHandler("You Are Already Purchase This Course", 400)
      );
    }
    if (!course) {
      return next(new ErrorHandler("Course Not Found", 400));
    }
    const data: any = {
      courseId: course?._id,
      userId: user?._id,
      payment_info,
    };

    const order = await OrderModel.create(data);

    const mailData = {
      order: {
        _id: course?._id,
        name: course?.name,
        price: course?.price,
        date: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      },
    };
    try {
      OrderConfirmationMail({
        email: user?.email as string,
        subject: "Order Confirmation",
        id: course?._id,
        name: course?.name as string,
        price: course?.price as number,
        date: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }

    const addCourseId = course?._id as string;

    user?.course?.push({ courseId: addCourseId });
    await redis.set(req.user?._id as any, JSON.stringify(user));
    await user?.save();

    course.purchase += 1 as any;

    course?.save();
    await redis.set(courseId, JSON.stringify(course), "EX", 604800);
    await redis.del(`allCourses`);

    await NotifactionModel.create({
      title: "New Order",
      message: `You Have New Order From ${course?.name}`,
      userId: user?._id,
    });

    res.status(201).json({
      success: true,
      course,
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
};

// ----get-all-Order---

export const getAllOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const order = await OrderModel.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      order,
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
};

// ------Send-Stripe-Payment-------

export const sendStripePaymentPusblishKey = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.status(200).json({
    puslishKey: process.env.STRIPE_PUBLISH_KEY,
  });
};

// ------CreateNewPayment------

export const newPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const newPayment = await stripe.paymentIntents.create({
      amount: req.body.amount,
      currency: "usd",
      metadata: {
        company: "imranhossain",
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });
    res.send({
      client_secret: newPayment.client_secret,
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
};
