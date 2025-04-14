import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import cloudinary from "cloudinary";
import LayoutModel from "../models/layout.model";
// ---Create-Layout-----

export const createLayout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { type } = req.body;

    const isExtisType = await LayoutModel.findOne({ type });

    if (isExtisType) {
      return next(new ErrorHandler(`${type} Already Extis`, 400));
    }

    if (type == "banner") {
      const { image, title, subtitle } = req.body;
      console.log(title, subtitle);
      const myUpload = await cloudinary.v2.uploader.upload(image, {
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
      const bannerData = await LayoutModel.create({
        banner,
        type,
      });
      console.log(bannerData);
    }

    if (type == "faq") {
      const { faq } = req.body;

      const faqItems = await Promise.all(
        faq.map(async (item: any) => {
          return {
            question: item.question,
            answar: item.answar,
          };
        })
      );

      await await LayoutModel.create({ faq: faqItems, type });
    }

    if (type == "category") {
      const { category } = req.body;

      const categoryItems = await Promise.all(
        category.map(async (item: any) => {
          return {
            title: item.title,
          };
        })
      );

      await await LayoutModel.create({ category: categoryItems, type });
    }

    res.status(200).json({
      success: true,
      message: "Layout Create SuccessFull",
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
};

// -----Edit-Layout----

export const editLayout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { type } = req.body;

    if (type == "banner") {
      const { image, title, subtitle } = req.body;
      const banner: any = await LayoutModel.findOne({ type: "banner" });
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
      } else {
        console.log(`imgage not https`);

        if (image && image.startsWith("https")) {
          await cloudinary.v2.uploader.destroy(banner?.image.public_id);
        }

        const myUpload = await cloudinary.v2.uploader.upload(image, {
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

      const data = await LayoutModel.findByIdAndUpdate(banner._id, {
        banner: bannerData,
      });
      console.log("scuccesFull", data);
    }

    if (type == "faq") {
      const { faq } = req.body;
      const faqItem: any = await LayoutModel.findOne({ type: "faq" });
      const faqItems = await Promise.all(
        faq.map(async (item: any) => {
          return {
            question: item.question,
            answar: item.answar,
          };
        })
      );

      await await LayoutModel.findByIdAndUpdate(faqItem._id, { faq: faqItems });
    }

    if (type == "category") {
      const { category } = req.body;
      const categoryItem = await LayoutModel.findOne({ type: "category" });
      const categoryItems = await Promise.all(
        category.map(async (item: any) => {
          return {
            title: item.title,
          };
        })
      );

      await await LayoutModel.findByIdAndUpdate(categoryItem?._id, {
        category: categoryItems,
      });
    }

    res.status(200).json({
      success: true,
      message: "Layout Updated SuccessFull",
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
};

// ----Get-Layout-Types----

export const getLayoutByTypes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const layout = await LayoutModel.findOne({ type: req.params.type });
    res.status(200).json({
      success: true,
      layout,
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
};
