"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Auth_1 = require("../middleware/Auth");
const analytics_controller_1 = require("../controllers/analytics.controller");
const router = express_1.default.Router();
router.get(`/get-user`, Auth_1.isAuthenticated, (0, Auth_1.authorizationRole)("admin"), analytics_controller_1.getUserAnalytics);
router.get(`/get-course`, Auth_1.isAuthenticated, (0, Auth_1.authorizationRole)("admin"), analytics_controller_1.getCourseAnalytics);
router.get(`/get-order`, Auth_1.isAuthenticated, (0, Auth_1.authorizationRole)("admin"), analytics_controller_1.getOrderAnalytics);
exports.default = router;
