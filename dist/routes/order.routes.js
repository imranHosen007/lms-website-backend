"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Auth_1 = require("../middleware/Auth");
const order_controller_1 = require("../controllers/order.controller");
const router = express_1.default.Router();
router.post(`/`, Auth_1.isAuthenticated, order_controller_1.createNewOrder);
router.get(`/`, Auth_1.isAuthenticated, (0, Auth_1.authorizationRole)("admin"), order_controller_1.getAllOrder);
router.get(`/payment/publish-key`, order_controller_1.sendStripePaymentPusblishKey);
router.post(`/payment`, Auth_1.isAuthenticated, order_controller_1.newPayment);
exports.default = router;
