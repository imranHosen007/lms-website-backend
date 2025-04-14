import express from "express";
import {
  activateUser,
  changeUserPassword,
  createNewUser,
  createUserSocial,
  deleteUser,
  getAllUser,
  getUserInfo,
  loginUser,
  logoutUser,
  updateAccesssToken,
  updateProfilePicture,
  updateUserInformation,
  updateUserRole,
} from "../controllers/user.controller";
import { authorizationRole, isAuthenticated } from "../middleware/Auth";
const router = express.Router();

router.post(`/`, createNewUser);
router.post(`/activate-user`, activateUser);
router.post(`/login`, loginUser);
router.get(`/me`, isAuthenticated, getUserInfo);
router.get(`/logout`, isAuthenticated, logoutUser);
router.get(`/refresh-token`, updateAccesssToken);
router.post(`/social-auth`, createUserSocial);
router.put(`/update-information`, isAuthenticated, updateUserInformation);
router.put(`/change-password`, isAuthenticated, changeUserPassword);
router.put(`/change-avatar`, isAuthenticated, updateProfilePicture);
router.get(`/`, isAuthenticated, authorizationRole("admin"), getAllUser);
router.put(
  `/update-role`,
  isAuthenticated,
  authorizationRole("admin"),
  updateUserRole
);
router.delete(`/:id`, isAuthenticated, authorizationRole("admin"), deleteUser);

export default router;
