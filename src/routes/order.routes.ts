import express from "express";
import { authorizationRole, isAuthenticated } from "../middleware/Auth";
import {
  createNewOrder,
  getAllOrder,
  newPayment,
  sendStripePaymentPusblishKey,
} from "../controllers/order.controller";

const router = express.Router();

router.post(`/`, isAuthenticated, createNewOrder);
router.get(`/`, isAuthenticated, authorizationRole("admin"), getAllOrder);
router.get(`/payment/publish-key`, sendStripePaymentPusblishKey);
router.post(`/payment`, isAuthenticated, newPayment);

export default router;
