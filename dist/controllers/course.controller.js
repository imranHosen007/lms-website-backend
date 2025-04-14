"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateVideoUrl = exports.deleteCourse = exports.getAllCourse = exports.replayToReview = exports.addReview = exports.addAnswar = exports.addQuestion = exports.getSingleCoursePurchaseUser = exports.getAllCourseWihoutPurchase = exports.getSingleCourseWihoutPurchase = exports.editCourse = exports.createNewCourse = void 0;
const cloudinary_1 = __importDefault(require("cloudinary"));
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const course_model_1 = __importDefault(require("../models/course.model"));
const redis_1 = require("../database/redis");
const notifaction_model_1 = __importDefault(require("../models/notifaction.model"));
const axios_1 = __importDefault(require("axios"));
// -----Create-Course------
const createNewCourse = async (req, res, next) => {
    try {
        const data = req.body;
        const thumbnail = data.thumbnail;
        if (thumbnail) {
            const myUpload = await cloudinary_1.default.v2.uploader.upload(thumbnail, {
                folder: "courses",
            });
            data.thumbnail = {
                public_id: myUpload.public_id,
                url: myUpload.secure_url,
            };
        }
        const course = await course_model_1.default.create(data);
        await redis_1.redis.del(`allCourses`);
        res.status(201).json({
            success: true,
            course,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
};
exports.createNewCourse = createNewCourse;
// ------Edit--Course-----
const editCourse = async (req, res, next) => {
    try {
        const data = req.body;
        const courseId = req.params.id;
        const thumbnail = data.thumbnail;
        const courseData = await course_model_1.default.findById(courseId);
        if (thumbnail && !thumbnail.startsWith("https")) {
            await cloudinary_1.default.v2.uploader.destroy(thumbnail.public_id);
            const myUpload = await cloudinary_1.default.v2.uploader.upload(thumbnail, {
                folder: "courses",
            });
            data.thumbnail = {
                public_id: myUpload.public_id,
                url: myUpload.secure_url,
            };
        }
        if (thumbnail.startsWith("https")) {
            data.thumbnail = {
                public_id: courseData?.thumbnail.public_id,
                url: courseData?.thumbnail.url,
            };
        }
        const course = await course_model_1.default.findByIdAndUpdate(courseId, {
            $set: data,
        }, {
            new: true,
        });
        await redis_1.redis.set(`allCourses`, JSON.stringify(course));
        res.status(201).json({
            success: true,
            message: "Course Updated SuccesFull",
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
};
exports.editCourse = editCourse;
// ------get-Single-Course-Without-Purchase------
const getSingleCourseWihoutPurchase = async (req, res, next) => {
    try {
        const courseId = req.params.id;
        const isRedisExits = await redis_1.redis.get(courseId);
        if (isRedisExits) {
            const course = JSON.parse(isRedisExits);
            res.status(200).json({
                success: true,
                course,
            });
        }
        else {
            const course = await course_model_1.default.findById(courseId).select("-courseData.videoUrl -courseData.suggestion -courseData.question -courseData.links");
            await redis_1.redis.set(courseId, JSON.stringify(course), "EX", 604800);
            res.status(200).json({
                success: true,
                course,
            });
        }
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
};
exports.getSingleCourseWihoutPurchase = getSingleCourseWihoutPurchase;
// ------get-All-Course-Without-Purchase------
const getAllCourseWihoutPurchase = async (req, res, next) => {
    try {
        console.log(`run`);
        const isRedisExits = await redis_1.redis.get(`allCourses`);
        if (isRedisExits) {
            const course = JSON.parse(isRedisExits);
            res.status(200).json({
                success: true,
                course,
            });
        }
        else {
            const course = await course_model_1.default.find({}).select("-courseData.videoUrl -courseData.suggestion -courseData.question -courseData.links");
            await redis_1.redis.set(`allCourses`, JSON.stringify(course));
            res.status(200).json({
                success: true,
                course,
            });
        }
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
};
exports.getAllCourseWihoutPurchase = getAllCourseWihoutPurchase;
// --------get-Single-CourseBy-purchase-User--------
const getSingleCoursePurchaseUser = async (req, res, next) => {
    try {
        const userCourseList = req?.user?.course;
        const courseId = req?.params?.id;
        const isCourseExits = userCourseList?.find((course) => {
            return course.courseId == courseId;
        });
        if (req?.user?.role != "admin") {
            if (!isCourseExits) {
                return next(new ErrorHandler_1.default(`You Are Not Eligible For Access This Course`, 400));
            }
        }
        const course = await course_model_1.default.findById(courseId);
        const content = course?.courseData;
        res.status(200).json({
            success: true,
            content,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
};
exports.getSingleCoursePurchaseUser = getSingleCoursePurchaseUser;
const addQuestion = async (req, res, next) => {
    try {
        const { question, courseId, contentId } = req.body;
        const course = await course_model_1.default.findById(courseId);
        const courseContent = course?.courseData.find((item) => {
            return item._id == contentId;
        });
        if (!courseContent) {
            return next(new ErrorHandler_1.default("Invalid Course Id", 400));
        }
        const newQuestion = {
            user: req.user,
            question,
            questionReplies: [],
        };
        courseContent.question.push(newQuestion);
        await course?.save();
        await notifaction_model_1.default.create({
            userId: req.user?._id,
            title: "New Question Recived",
            message: `You Have a New Question in ${courseContent?.title} `,
        });
        res.status(200).json({
            success: true,
            course,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
};
exports.addQuestion = addQuestion;
const addAnswar = async (req, res, next) => {
    try {
        const { answar, courseId, contentId, questionId } = req.body;
        const course = await course_model_1.default.findById(courseId);
        const courseContent = course?.courseData.find((item) => {
            return item._id == contentId;
        });
        if (!courseContent) {
            return next(new ErrorHandler_1.default("Invalid Course Id", 400));
        }
        const question = courseContent.question.find((item) => {
            return item._id == questionId;
        });
        if (!question) {
            return next(new ErrorHandler_1.default("Invalid Question Id", 400));
        }
        const newAnswar = {
            answar,
            user: req.user,
        };
        question?.questionReplies?.push(newAnswar);
        course?.save();
        if (req?.user?._id === question.user._id) {
            await notifaction_model_1.default.create({
                userId: req.user?._id,
                title: "New Question Replay Recived",
                message: `You Have a New Replay Question in ${courseContent?.title} `,
            });
        }
        else {
        }
        res.status(200).json({
            success: true,
            course,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
};
exports.addAnswar = addAnswar;
const addReview = async (req, res, next) => {
    try {
        const { review, rating } = req.body;
        const userCourseList = await req.user?.course;
        const courseId = req.params.id;
        const course = await course_model_1.default.findById(courseId);
        const isCourseExits = userCourseList?.some((item) => item.courseId.toString() == courseId.toString());
        if (!isCourseExits) {
            return next(new ErrorHandler_1.default("You Are Not eligible to Access This Course Review", 404));
        }
        const reviewData = {
            user: req.user,
            review,
            rating,
        };
        console.log(reviewData);
        course?.review.push(reviewData);
        await redis_1.redis.set(courseId, JSON.stringify(course), "EX", 604800);
        course?.save();
        let avg = 0;
        course?.review?.forEach((rev) => {
            return (avg += rev.rating);
        });
        if (course) {
            course.ratings = avg / course?.review?.length;
        }
        await redis_1.redis.set(courseId, JSON.stringify(course), "EX", 604800);
        await redis_1.redis.del(`allCourses`);
        course?.save();
        await notifaction_model_1.default.create({
            userId: req.user?._id,
            title: "New Review Recived",
            message: `${req.user?.name} Has Gived Review in ${course?.name}`,
        });
        res.status(200).json({
            success: true,
            course,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
};
exports.addReview = addReview;
const replayToReview = async (req, res, next) => {
    try {
        const { comment, courseId, reviewId } = req.body;
        const course = await course_model_1.default.findById(courseId);
        if (!course) {
            return next(new ErrorHandler_1.default(`Course Not found`, 400));
        }
        const review = course.review.find((rev) => {
            return rev._id == reviewId;
        });
        if (!review) {
            return next(new ErrorHandler_1.default(`Review Not found`, 400));
        }
        const replayData = {
            user: req.user,
            comment: comment,
        };
        if (!review.commentReplies) {
            review.commentReplies = [];
        }
        review?.commentReplies?.push(replayData);
        await redis_1.redis.set(courseId, JSON.stringify(course), "EX", 604800);
        await redis_1.redis.del(`allCourses`);
        await course?.save();
        res.status(200).json({
            success: true,
            course,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
};
exports.replayToReview = replayToReview;
// ----get-all-Course---
const getAllCourse = async (req, res, next) => {
    try {
        const course = await course_model_1.default.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            course,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
};
exports.getAllCourse = getAllCourse;
// -----Delete-User----
const deleteCourse = async (req, res, next) => {
    try {
        const course = await course_model_1.default.findByIdAndDelete(req.params.id);
        if (!course) {
            return next(new ErrorHandler_1.default(`Course Not Found`, 404));
        }
        await redis_1.redis.del(req.params.id);
        await redis_1.redis.del(`allCourses`);
        res.status(200).json({
            success: true,
            message: "Course Delete SuccessFull",
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
};
exports.deleteCourse = deleteCourse;
const generateVideoUrl = async (req, res, next) => {
    try {
        console.log(`run the function`);
        const { videoUrl } = req.body;
        console.log(`this is video ${videoUrl}`);
        const response = axios_1.default.post(`https://dev.vdocipher.com/api/videos/${videoUrl}/otp`, { ttl: 300 }, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Apisecret ${process.env.VIDEOCIPER_API_SECRET}`,
            },
        });
        res.json((await response).data);
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
};
exports.generateVideoUrl = generateVideoUrl;
