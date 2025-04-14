import mongoose, { Document, Model } from "mongoose";

interface INotifaction extends Document {
  title: string;
  message: string;
  status: string;
  userId: string;
}

const NotifactionSchema = new mongoose.Schema<INotifaction>(
  {
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: "unread",
    },
  },
  {
    timestamps: true,
  }
);

const NotifactionModel: Model<INotifaction> = mongoose.model(
  "Notifaction",
  NotifactionSchema
);

export default NotifactionModel;
