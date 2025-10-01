import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Nazwa użytkownika jest wymagana"],
      unique: true,
      trim: true,
      minlength: [3, "Nazwa użytkownika musi mieć co najmniej 3 znaki"],
      maxlength: [50, "Nazwa użytkownika nie może przekraczać 50 znaków"],
    },
    password: {
      type: String,
      required: [true, "Hasło jest wymagane"],
      minlength: [6, "Hasło musi mieć co najmniej 6 znaków"],
    },
    role: {
      type: String,
      enum: ["admin", "manager", "user"],
      default: "user",
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Instance method to check password
UserSchema.methods.comparePassword = async function (candidatePassword) {
  if (!candidatePassword || !this.password) {
    return false;
  }

  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

// Ensure indexes for performance
UserSchema.index({ role: 1 });

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
