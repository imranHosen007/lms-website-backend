import mongoose, { Document, Model } from "mongoose";

interface IFaqitem extends Document {
  question: string;
  answar: string;
}

interface ICategory extends Document {
  title: string;
}

interface IBanner extends Document {
  public_id: string;
  url: string;
}

interface ILayout extends Document {
  type: string;
  faq: IFaqitem;
  category: ICategory[];
  banner: {
    image: IBanner;
    title: string;
    subtitle: string;
  };
}

const FaqSchema = new mongoose.Schema<IFaqitem>({
  question: String,
  answar: String,
});

const CategorySchema = new mongoose.Schema<ICategory>({
  title: String,
});

const BannerSchema = new mongoose.Schema<IBanner>({
  public_id: String,
  url: String,
});

const LayoutSchema = new mongoose.Schema<ILayout>({
  type: {
    type: String,
    required: true,
  },
  faq: [FaqSchema],
  banner: {
    image: BannerSchema,
    title: String,
    subtitle: String,
  },
  category: [CategorySchema],
});

const LayoutModel = mongoose.model<ILayout>("Layout", LayoutSchema);

export default LayoutModel;
