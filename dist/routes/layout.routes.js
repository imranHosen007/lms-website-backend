"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Auth_1 = require("../middleware/Auth");
const layout_controller_1 = require("../controllers/layout.controller");
const router = express_1.default.Router();
router.post(`/`, Auth_1.isAuthenticated, (0, Auth_1.authorizationRole)("admin"), layout_controller_1.createLayout);
router.put(`/`, Auth_1.isAuthenticated, (0, Auth_1.authorizationRole)("admin"), layout_controller_1.editLayout);
router.get(`/:type`, layout_controller_1.getLayoutByTypes);
exports.default = router;
