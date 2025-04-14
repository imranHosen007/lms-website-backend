import express from "express";
import { authorizationRole, isAuthenticated } from "../middleware/Auth";
import {
  addAnswar,
  addQuestion,
  addReview,
  createNewCourse,
  deleteCourse,
  editCourse,
  generateVideoUrl,
  getAllCourse,
  getAllCourseWihoutPurchase,
  getSingleCoursePurchaseUser,
  getSingleCourseWihoutPurchase,
  replayToReview,
} from "../controllers/course.controller";
import { updateAccesssToken } from "../controllers/user.controller";

const router = express.Router();

router.post(
  `/`,
  updateAccesssToken,
  isAuthenticated,
  authorizationRole("admin"),
  createNewCourse
);
router.post(`/videourl`, generateVideoUrl);
router.put(
  `/edit/:id`,
  isAuthenticated,
  authorizationRole("admin"),
  editCourse
);
router.put(
  `/add-replay`,
  isAuthenticated,
  authorizationRole("admin"),
  replayToReview
);
router.put(`/add-question`, isAuthenticated, addQuestion);
router.put(`/add-answar`, isAuthenticated, addAnswar);
router.put(`/add-review/:id`, isAuthenticated, addReview);
router.get(`/without-purchase`, getAllCourseWihoutPurchase);
router.get(`/without-purchase/:id`, getSingleCourseWihoutPurchase);
router.get(`/purchase/:id`, isAuthenticated, getSingleCoursePurchaseUser);
router.get(`/`, isAuthenticated, authorizationRole("admin"), getAllCourse);
router.delete(
  `/:id`,
  isAuthenticated,
  authorizationRole("admin"),
  deleteCourse
);
export default router;
