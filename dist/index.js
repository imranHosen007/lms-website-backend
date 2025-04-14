"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = require("dotenv");
exports.app = (0, express_1.default)();
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const body_parser_1 = __importDefault(require("body-parser"));
const ErrorMiddleware_1 = __importDefault(require("./middleware/ErrorMiddleware"));
(0, dotenv_1.config)({
    path: "./.env",
});
// ----Using-Middleware------
const corsOptions = {
    origin: [`http://localhost:3000`],
    credentials: true,
};
exports.app.use(express_1.default.json({ limit: "50mb" }));
exports.app.use((0, cookie_parser_1.default)());
exports.app.use(body_parser_1.default.urlencoded({ limit: "50mb", extended: true }));
exports.app.use((0, cors_1.default)(corsOptions));
// ------Import-Routing------
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const course_routes_1 = __importDefault(require("./routes/course.routes"));
const order_routes_1 = __importDefault(require("./routes/order.routes"));
const notifaction_routes_1 = __importDefault(require("./routes/notifaction.routes"));
const analytics_routes_1 = __importDefault(require("./routes/analytics.routes"));
const layout_routes_1 = __importDefault(require("./routes/layout.routes"));
exports.app.use(`/api/v1/user`, user_routes_1.default);
exports.app.use(`/api/v1/course`, course_routes_1.default);
exports.app.use(`/api/v1/order`, order_routes_1.default);
exports.app.use(`/api/v1/notifaction`, notifaction_routes_1.default);
exports.app.use(`/api/v1/analytics`, analytics_routes_1.default);
exports.app.use(`/api/v1/layout`, layout_routes_1.default);
// --Test-Route---
exports.app.get(`/test`, (req, res) => {
    res.status(200).json({
        success: true,
        message: "Test Route",
    });
});
// --unknown-Route---
exports.app.all(`/*`, (req, res, next) => {
    const err = new Error(`Route ${req.originalUrl} Not Found`);
    err.statusCode = 404;
    next(err);
});
// // it's for ErrorHandling
exports.app.use(ErrorMiddleware_1.default);
