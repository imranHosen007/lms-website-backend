import exrpess from "express";
import { authorizationRole, isAuthenticated } from "../middleware/Auth";
import {
  getAllNotifaction,
  updateNotifaction,
} from "../controllers/notifaction.controller";

const router = exrpess.Router();

router.get(`/`, isAuthenticated, authorizationRole("admin"), getAllNotifaction);
router.put(
  `/update/:id`,
  isAuthenticated,
  authorizationRole("admin"),
  updateNotifaction
);
export default router;
