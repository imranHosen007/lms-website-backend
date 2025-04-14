"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.newPayment = exports.sendStripePaymentPusblishKey = exports.getAllOrder = exports.createNewOrder = void 0;
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const order_model_1 = __importDefault(require("../models/order.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const course_model_1 = __importDefault(require("../models/course.model"));
const Mailer_1 = require("../utils/Mailer");
const notifaction_model_1 = __importDefault(require("../models/notifaction.model"));
const stripe_1 = __importDefault(require("stripe"));
const redis_1 = require("../database/redis");
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || "");
const createNewOrder = async (req, res, next) => {
    try {
        const { courseId, payment_info } = req.body;
        const user = await user_model_1.default.findById(req.user?._id);
        const course = await course_model_1.default.findById(courseId);
        const isCourseExits = user?.course.find((cou) => cou.courseId == courseId);
        if (payment_info) {
            if ("id" in payment_info) {
                const paymentIntentsId = payment_info.id;
                const paymentIntents = await stripe.paymentIntents.retrieve(paymentIntentsId);
                if (paymentIntents.status !== "succeeded") {
                    return next(new ErrorHandler_1.default("Payment Not Valid", 400));
                }
            }
        }
        if (isCourseExits) {
            return next(new ErrorHandler_1.default("You Are Already Purchase This Course", 400));
        }
        if (!course) {
            return next(new ErrorHandler_1.default("Course Not Found", 400));
        }
        const data = {
            courseId: course?._id,
            userId: user?._id,
            payment_info,
        };
        const order = await order_model_1.default.create(data);
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
            (0, Mailer_1.OrderConfirmationMail)({
                email: user?.email,
                subject: "Order Confirmation",
                id: course?._id,
                name: course?.name,
                price: course?.price,
                date: new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                }),
            });
        }
        catch (error) {
            return next(new ErrorHandler_1.default(error.message, 400));
        }
        const addCourseId = course?._id;
        user?.course?.push({ courseId: addCourseId });
        await redis_1.redis.set(req.user?._id, JSON.stringify(user));
        await user?.save();
        course.purchase += 1;
        course?.save();
        await redis_1.redis.set(courseId, JSON.stringify(course), "EX", 604800);
        await redis_1.redis.del(`allCourses`);
        await notifaction_model_1.default.create({
            title: "New Order",
            message: `You Have New Order From ${course?.name}`,
            userId: user?._id,
        });
        res.status(201).json({
            success: true,
            course,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
};
exports.createNewOrder = createNewOrder;
// ----get-all-Order---
const getAllOrder = async (req, res, next) => {
    try {
        const order = await order_model_1.default.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            order,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
};
exports.getAllOrder = getAllOrder;
// ------Send-Stripe-Payment-------
const sendStripePaymentPusblishKey = async (req, res, next) => {
    res.status(200).json({
        puslishKey: process.env.STRIPE_PUBLISH_KEY,
    });
};
exports.sendStripePaymentPusblishKey = sendStripePaymentPusblishKey;
// ------CreateNewPayment------
const newPayment = async (req, res, next) => {
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
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
};
exports.newPayment = newPayment;
