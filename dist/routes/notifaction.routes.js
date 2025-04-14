"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Auth_1 = require("../middleware/Auth");
const notifaction_controller_1 = require("../controllers/notifaction.controller");
const router = express_1.default.Router();
router.get(`/`, Auth_1.isAuthenticated, (0, Auth_1.authorizationRole)("admin"), notifaction_controller_1.getAllNotifaction);
router.put(`/update/:id`, Auth_1.isAuthenticated, (0, Auth_1.authorizationRole)("admin"), notifaction_controller_1.updateNotifaction);
exports.default = router;
