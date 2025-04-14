import mongoose, { Document, Schema, Model } from "mongoose";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
export interface IUser extends Document {
  name: string;
  password: string;
  email: string;
  avatar: {
    public_id: string;
    url: string;
  };
  role: string;
  isVerifed: boolean;
  course: Array<{ courseId: string }>;
  signAccessToken: () => string;
  signRefreshToken: () => string;
  comparePassword: (password: string) => Promise<Boolean>;
}

const UserSchema = new mongoose.Schema<IUser>(
  {
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
  },

  {
    timestamps: true,
  }
);

// ---Hash-Password----

UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcryptjs.hash(this.password, 10);
  next();
});

// ---SignAceessToken------
UserSchema.methods.signAccessToken = async function () {
  return await jwt.sign(
    { id: this._id },
    process.env.ACCESS_TOKEN_SECRET || "",
    {
      expiresIn: "30m",
    }
  );
};

// ---SignRefresh-Token------
UserSchema.methods.signRefreshToken = async function () {
  return await jwt.sign(
    { id: this._id },
    process.env.REFRESH_TOKEN_SECRET || "",
    {
      expiresIn: "30d",
    }
  );
};

// ---Compare-Password---

UserSchema.methods.comparePassword = async function (
  entredPassword: string
): Promise<boolean> {
  return await bcryptjs.compare(entredPassword, this.password);
};

const UserModel: Model<IUser> = mongoose.model("User", UserSchema);

export default UserModel;
