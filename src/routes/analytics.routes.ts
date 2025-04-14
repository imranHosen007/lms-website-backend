import express from "express";
import { authorizationRole, isAuthenticated } from "../middleware/Auth";
import {
  getCourseAnalytics,
  getOrderAnalytics,
  getUserAnalytics,
} from "../controllers/analytics.controller";

const router = express.Router();
router.get(
  `/get-user`,
  isAuthenticated,
  authorizationRole("admin"),
  getUserAnalytics
);
router.get(
  `/get-course`,
  isAuthenticated,
  authorizationRole("admin"),
  getCourseAnalytics
);
router.get(
  `/get-order`,
  isAuthenticated,
  authorizationRole("admin"),
  getOrderAnalytics
);
export default router;
