"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLayoutByTypes = exports.editLayout = exports.createLayout = void 0;
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const cloudinary_1 = __importDefault(require("cloudinary"));
const layout_model_1 = __importDefault(require("../models/layout.model"));
// ---Create-Layout-----
const createLayout = async (req, res, next) => {
    try {
        const { type } = req.body;
        const isExtisType = await layout_model_1.default.findOne({ type });
        if (isExtisType) {
            return next(new ErrorHandler_1.default(`${type} Already Extis`, 400));
        }
        if (type == "banner") {
            const { image, title, subtitle } = req.body;
            console.log(title, subtitle);
            const myUpload = await cloudinary_1.default.v2.uploader.upload(image, {
                folder: "banner",
            });
            const banner = {
                type,
                title,
                subtitle,
                image: {
                    public_id: myUpload.public_id,
                    url: myUpload.secure_url,
                },
            };
            const bannerData = await layout_model_1.default.create({
                banner,
                type,
            });
            console.log(bannerData);
        }
        if (type == "faq") {
            const { faq } = req.body;
            const faqItems = await Promise.all(faq.map(async (item) => {
                return {
                    question: item.question,
                    answar: item.answar,
                };
            }));
            await await layout_model_1.default.create({ faq: faqItems, type });
        }
        if (type == "category") {
            const { category } = req.body;
            const categoryItems = await Promise.all(category.map(async (item) => {
                return {
                    title: item.title,
                };
            }));
            await await layout_model_1.default.create({ category: categoryItems, type });
        }
        res.status(200).json({
            success: true,
            message: "Layout Create SuccessFull",
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
};
exports.createLayout = createLayout;
// -----Edit-Layout----
const editLayout = async (req, res, next) => {
    try {
        const { type } = req.body;
        if (type == "banner") {
            const { image, title, subtitle } = req.body;
            const banner = await layout_model_1.default.findOne({ type: "banner" });
            console.log(banner);
            let bannerData;
            if (image && image.startsWith("https")) {
                console.log(`imgage with https`);
                bannerData = {
                    type,
                    title,
                    subtitle,
                    image: {
                        public_id: banner.image?.public_id,
                        url: banner.image?.url,
                    },
                };
            }
            else {
                console.log(`imgage not https`);
                if (image && image.startsWith("https")) {
                    await cloudinary_1.default.v2.uploader.destroy(banner?.image.public_id);
                }
                const myUpload = await cloudinary_1.default.v2.uploader.upload(image, {
                    folder: "banner",
                });
                bannerData = {
                    type,
                    title,
                    subtitle,
                    image: {
                        public_id: myUpload?.public_id,
                        url: myUpload?.secure_url,
                    },
                };
            }
            const data = await layout_model_1.default.findByIdAndUpdate(banner._id, {
                banner: bannerData,
            });
            console.log("scuccesFull", data);
        }
        if (type == "faq") {
            const { faq } = req.body;
            const faqItem = await layout_model_1.default.findOne({ type: "faq" });
            const faqItems = await Promise.all(faq.map(async (item) => {
                return {
                    question: item.question,
                    answar: item.answar,
                };
            }));
            await await layout_model_1.default.findByIdAndUpdate(faqItem._id, { faq: faqItems });
        }
        if (type == "category") {
            const { category } = req.body;
            const categoryItem = await layout_model_1.default.findOne({ type: "category" });
            const categoryItems = await Promise.all(category.map(async (item) => {
                return {
                    title: item.title,
                };
            }));
            await await layout_model_1.default.findByIdAndUpdate(categoryItem?._id, {
                category: categoryItems,
            });
        }
        res.status(200).json({
            success: true,
            message: "Layout Updated SuccessFull",
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
};
exports.editLayout = editLayout;
// ----Get-Layout-Types----
const getLayoutByTypes = async (req, res, next) => {
    try {
        const layout = await layout_model_1.default.findOne({ type: req.params.type });
        res.status(200).json({
            success: true,
            layout,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
};
exports.getLayoutByTypes = getLayoutByTypes;
