import express from "express";
import { authorizationRole, isAuthenticated } from "../middleware/Auth";
import {
  createLayout,
  editLayout,
  getLayoutByTypes,
} from "../controllers/layout.controller";

const router = express.Router();

router.post(`/`, isAuthenticated, authorizationRole("admin"), createLayout);
router.put(`/`, isAuthenticated, authorizationRole("admin"), editLayout);
router.get(`/:type`, getLayoutByTypes);
export default router;
