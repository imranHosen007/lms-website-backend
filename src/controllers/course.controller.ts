import { NextFunction, Request, Response } from "express";
import cloudinary from "cloudinary";
import ErrorHandler from "../utils/ErrorHandler";
import CourseModel from "../models/course.model";
import { redis } from "../database/redis";
import NotifactionModel from "../models/notifaction.model";
import axios from "axios";
// -----Create-Course------

export const createNewCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = req.body;

    const thumbnail = data.thumbnail;
    if (thumbnail) {
      const myUpload = await cloudinary.v2.uploader.upload(thumbnail, {
        folder: "courses",
      });
      data.thumbnail = {
        public_id: myUpload.public_id,
        url: myUpload.secure_url,
      };
    }

    const course = await CourseModel.create(data);

    await redis.del(`allCourses`);
    res.status(201).json({
      success: true,
      course,
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
};

// ------Edit--Course-----

export const editCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = req.body;
    const courseId = req.params.id;
    const thumbnail = data.thumbnail;
    const courseData: any = await CourseModel.findById(courseId);
    if (thumbnail && !thumbnail.startsWith("https")) {
      await cloudinary.v2.uploader.destroy(thumbnail.public_id);
      const myUpload = await cloudinary.v2.uploader.upload(thumbnail, {
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

    const course = await CourseModel.findByIdAndUpdate(
      courseId,
      {
        $set: data,
      },
      {
        new: true,
      }
    );
    await redis.set(`allCourses`, JSON.stringify(course));
    res.status(201).json({
      success: true,
      message: "Course Updated SuccesFull",
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
};

// ------get-Single-Course-Without-Purchase------

export const getSingleCourseWihoutPurchase = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const courseId = req.params.id;

    const isRedisExits = await redis.get(courseId);

    if (isRedisExits) {
      const course = JSON.parse(isRedisExits);

      res.status(200).json({
        success: true,
        course,
      });
    } else {
      const course = await CourseModel.findById(courseId).select(
        "-courseData.videoUrl -courseData.suggestion -courseData.question -courseData.links"
      );

      await redis.set(courseId, JSON.stringify(course), "EX", 604800);
      res.status(200).json({
        success: true,
        course,
      });
    }
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
};
// ------get-All-Course-Without-Purchase------

export const getAllCourseWihoutPurchase = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log(`run`);
    const isRedisExits = await redis.get(`allCourses`);
    if (isRedisExits) {
      const course = JSON.parse(isRedisExits);

      res.status(200).json({
        success: true,
        course,
      });
    } else {
      const course = await CourseModel.find({}).select(
        "-courseData.videoUrl -courseData.suggestion -courseData.question -courseData.links"
      );
      await redis.set(`allCourses`, JSON.stringify(course));

      res.status(200).json({
        success: true,
        course,
      });
    }
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
};

// --------get-Single-CourseBy-purchase-User--------

export const getSingleCoursePurchaseUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userCourseList = req?.user?.course;

    const courseId = req?.params?.id;
    const isCourseExits = userCourseList?.find((course: any) => {
      return course.courseId == courseId;
    });

    if (req?.user?.role != "admin") {
      if (!isCourseExits) {
        return next(
          new ErrorHandler(`You Are Not Eligible For Access This Course`, 400)
        );
      }
    }
    const course = await CourseModel.findById(courseId);
    const content = course?.courseData;
    res.status(200).json({
      success: true,
      content,
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
};

// ----Add-question-----
interface IQuestionBody {
  courseId: string;
  question: string;
  contentId: string;
}

export const addQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { question, courseId, contentId }: IQuestionBody = req.body;
    const course = await CourseModel.findById(courseId);

    const courseContent = course?.courseData.find((item: any) => {
      return item._id == contentId;
    });

    if (!courseContent) {
      return next(new ErrorHandler("Invalid Course Id", 400));
    }
    const newQuestion: any = {
      user: req.user,
      question,
      questionReplies: [],
    };
    courseContent.question.push(newQuestion);

    await course?.save();
    await NotifactionModel.create({
      userId: req.user?._id,
      title: "New Question Recived",
      message: `You Have a New Question in ${courseContent?.title} `,
    });
    res.status(200).json({
      success: true,
      course,
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
};

// ------Add-Question_Answar-------

interface IAddAnswarBody {
  courseId: string;
  answar: string;
  contentId: string;
  questionId: string;
}

export const addAnswar = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { answar, courseId, contentId, questionId }: IAddAnswarBody =
      req.body;

    const course = await CourseModel.findById(courseId);

    const courseContent = course?.courseData.find((item: any) => {
      return item._id == contentId;
    });

    if (!courseContent) {
      return next(new ErrorHandler("Invalid Course Id", 400));
    }

    const question = courseContent.question.find((item: any) => {
      return item._id == questionId;
    });

    if (!question) {
      return next(new ErrorHandler("Invalid Question Id", 400));
    }
    const newAnswar: any = {
      answar,
      user: req.user,
    };
    question?.questionReplies?.push(newAnswar);

    course?.save();

    if (req?.user?._id === question.user._id) {
      await NotifactionModel.create({
        userId: req.user?._id,
        title: "New Question Replay Recived",
        message: `You Have a New Replay Question in ${courseContent?.title} `,
      });
    } else {
    }

    res.status(200).json({
      success: true,
      course,
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
};

// ----Add-Review-Course-----
interface IReviewBody {
  rating: number;
  review: string;
}
export const addReview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { review, rating }: IReviewBody = req.body;
    const userCourseList = await req.user?.course;
    const courseId = req.params.id;
    const course = await CourseModel.findById(courseId);
    const isCourseExits = userCourseList?.some(
      (item: any) => item.courseId.toString() == courseId.toString()
    );

    if (!isCourseExits) {
      return next(
        new ErrorHandler(
          "You Are Not eligible to Access This Course Review",
          404
        )
      );
    }

    const reviewData: any = {
      user: req.user,
      review,
      rating,
    };
    console.log(reviewData);
    course?.review.push(reviewData);
    await redis.set(courseId, JSON.stringify(course), "EX", 604800);
    course?.save();
    let avg = 0;

    course?.review?.forEach((rev) => {
      return (avg += rev.rating);
    });

    if (course) {
      course.ratings = avg / course?.review?.length;
    }

    await redis.set(courseId, JSON.stringify(course), "EX", 604800);
    await redis.del(`allCourses`);
    course?.save();

    await NotifactionModel.create({
      userId: req.user?._id,

      title: "New Review Recived",
      message: `${req.user?.name} Has Gived Review in ${course?.name}`,
    });

    res.status(200).json({
      success: true,
      course,
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
};

// -----Add-Repley-In-Review----
interface IReplayBody {
  comment: string;
  courseId: string;
  reviewId: string;
}
export const replayToReview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { comment, courseId, reviewId }: IReplayBody = req.body;

    const course = await CourseModel.findById(courseId);

    if (!course) {
      return next(new ErrorHandler(`Course Not found`, 400));
    }
    const review = course.review.find((rev) => {
      return rev._id == reviewId;
    });

    if (!review) {
      return next(new ErrorHandler(`Review Not found`, 400));
    }

    const replayData: any = {
      user: req.user,
      comment: comment,
    };
    if (!review.commentReplies) {
      review.commentReplies = [];
    }

    review?.commentReplies?.push(replayData);

    await redis.set(courseId, JSON.stringify(course), "EX", 604800);
    await redis.del(`allCourses`);
    await course?.save();
    res.status(200).json({
      success: true,
      course,
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
};

// ----get-all-Course---

export const getAllCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const course = await CourseModel.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      course,
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
};

// -----Delete-User----

export const deleteCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const course = await CourseModel.findByIdAndDelete(req.params.id);
    if (!course) {
      return next(new ErrorHandler(`Course Not Found`, 404));
    }
    await redis.del(req.params.id);
    await redis.del(`allCourses`);

    res.status(200).json({
      success: true,
      message: "Course Delete SuccessFull",
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
};

export const generateVideoUrl = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log(`run the function`);
    const { videoUrl } = req.body;
    console.log(`this is video ${videoUrl}`);

    const response = axios.post(
      `https://dev.vdocipher.com/api/videos/${videoUrl}/otp`,
      { ttl: 300 },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Apisecret ${process.env.VIDEOCIPER_API_SECRET}`,
        },
      }
    );
    res.json((await response).data);
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
};
