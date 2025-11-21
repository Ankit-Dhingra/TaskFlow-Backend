const express = require("express");
const bcrypt = require("bcryptjs");
const UserModel = require("../Schema/User");
const JWT = require("jsonwebtoken");
const authRouter = express.Router();

authRouter.get("/health", async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "API is up",
  });
});

authRouter.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, emailId, password } = req.body;

    if (!firstName || !emailId || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter all required fields",
      });
    }

    const existingUser = await UserModel.findOne({ emailId });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = new UserModel({
      firstName,
      lastName,
      emailId,
      password: hashPassword,
    });
    await newUser.save();

    console.log("Data Saved Successfully");

    const token = JWT.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.cookie("AuthToken", token , {
      expires: new Date(Date.now() + 8 * 3600000),
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        token,
        user: {
          id: newUser._id,
          firstName: newUser.firstName,
          emailId: newUser.emailId,
        },
      },
    });
  } catch (error) {
    console.log("error in signup user", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    if (!emailId || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter all required fields",
      });
    }

    const existingUser = await UserModel.findOne({ emailId });
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User doesn't Exists",
      });
    }

    const passwordMatch = await bcrypt.compare(password, existingUser.password);

    if (!passwordMatch) {
      return res.status(400).json({
        success: false,
        message: "Enter the correct password",
      });
    }

    const token = JWT.sign({ id: existingUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.cookie("AuthToken", token , {
      expires: new Date(Date.now() + 8 * 3600000),
    });

    return res.status(200).json({
      success: true,
      message: "Logged In successfully",
      data: {
        token,
        user: {
          id: existingUser._id,
          firstName: existingUser.firstName,
          lastName: existingUser.lastName,
          emailId: existingUser.emailId,
        },
      },
    });
  } catch (error) {
    console.log("error in login user", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

module.exports = authRouter;
