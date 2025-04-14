"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const UserSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: [true, "Please Enter Your Name"],
    },
    email: {
        type: String,
        required: [true, "Please Enter Your Password"],
        unique: true,
    },
    password: {
        type: String,
        minlength: [6, `Password Must Be 6 character`],
        select: false,
    },
    avatar: {
        public_id: String,
        url: String,
    },
    role: {
        type: String,
        default: "user",
    },
    isVerifed: {
        type: Boolean,
        default: false,
    },
    course: [
        {
            courseId: String,
        },
    ],
}, {
    timestamps: true,
});
// ---Hash-Password----
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }
    this.password = await bcryptjs_1.default.hash(this.password, 10);
    next();
});
// ---SignAceessToken------
UserSchema.methods.signAccessToken = async function () {
    return await jsonwebtoken_1.default.sign({ id: this._id }, process.env.ACCESS_TOKEN_SECRET || "", {
        expiresIn: "30m",
    });
};
// ---SignRefresh-Token------
UserSchema.methods.signRefreshToken = async function () {
    return await jsonwebtoken_1.default.sign({ id: this._id }, process.env.REFRESH_TOKEN_SECRET || "", {
        expiresIn: "30d",
    });
};
// ---Compare-Password---
UserSchema.methods.comparePassword = async function (entredPassword) {
    return await bcryptjs_1.default.compare(entredPassword, this.password);
};
const UserModel = mongoose_1.default.model("User", UserSchema);
exports.default = UserModel;
