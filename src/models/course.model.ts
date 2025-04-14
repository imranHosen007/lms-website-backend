import mongoose, { Document, Model } from "mongoose";
import { IUser } from "./user.model";

interface IComment extends Document {
  user: IUser;
  question: string;
  questionReplies?: IComment[];
}
interface IReview extends Document {
  user: object;
  rating: number;
  review: string;
  commentReplies: IComment[];
}

interface ILink extends Document {
  title: string;
  url: string;
}

interface ICourseData extends Document {
  title: string;
  description: string;
  videoUrl: string;
  videoSection: string;
  videoLength: number;
  videoPlayer: string;
  links: ILink[];
  suggestion: string;
  question: IComment[];
}

interface ICourse extends Document {
  name: string;
  description: string;
  price: number;
  estimatePrice?: number;
  thumbnail: object;
  tags: string;
  category: string;
  level: string;
  demoUrl: string;
  benefits: { title: string }[];
  prerequisite: { title: string }[];
  review: IReview[];
  courseData: ICourseData[];
  ratings?: number;
  purchase?: number;
}

const ReviewSchema = new mongoose.Schema<IReview>(
  {
    user: Object,
    rating: {
      type: Number,
      default: 0,
    },
    review: String,
    commentReplies: [Object],
  },
  { timestamps: true }
);

const LinkSchema = new mongoose.Schema<ILink>({
  title: String,
  url: String,
});

const CommentSchema = new mongoose.Schema<IComment>(
  {
    user: Object,
    question: String,
    questionReplies: [Object],
  },
  { timestamps: true }
);

const CourseDataSchema = new mongoose.Schema<ICourseData>({
  videoUrl: String,

  title: String,
  description: String,
  videoSection: String,
  videoLength: Number,
  videoPlayer: String,
  suggestion: String,
  links: [LinkSchema],
  question: [CommentSchema],
});

const CourseSchema = new mongoose.Schema<ICourse>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    estimatePrice: Number,
    thumbnail: {
      public_id: {
        type: String,
      },
      url: { type: String },
    },
    tags: {
      type: String,
      required: true,
    },
    level: { type: String, required: true },
    demoUrl: { type: String, required: true },
    benefits: [{ title: String }],
    prerequisite: [{ title: String }],
    review: [ReviewSchema],
    courseData: [CourseDataSchema],
    ratings: {
      type: Number,
      default: 0,
    },
    purchase: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const CourseModel: Model<ICourse> = mongoose.model(`Course`, CourseSchema);

export default CourseModel;
