import mongoose, { Document, Model } from "mongoose";

export interface IOrder extends Document {
  courseId: string;
  userId: string;
  payment_info: object;
}

const OrderSchema = new mongoose.Schema<IOrder>(
  {
    courseId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      // required: true,
    },
    payment_info: {
      type: Object,
      //     required: true,
    },
  },
  {
    timestamps: true,
  }
);

const OrderModel: Model<IOrder> = mongoose.model("Order", OrderSchema);

export default OrderModel;
