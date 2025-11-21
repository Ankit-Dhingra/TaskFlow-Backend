const JWT = require("jsonwebtoken");
const UserModel = require("../../Schema/User");

const userAuth = async (req, res, next) => {
  try {
    console.log("Inside Auth Middleware")
    const cookies = req.cookies;
    const { AuthToken } = cookies;
    console.log("test : " ,AuthToken)

    if (!AuthToken) {
      res.status(401).json({
        success: false,
        message: "User not authorized",
      });
    }

    const decode = JWT.verify(AuthToken, process.env.JWT_SECRET);
    console.log("check : " , decode)

    const user = await UserModel.findById({ _id: decode.id });
    if (!user) {
      throw new Error("User not found");
    }

    console.log("test middleware", user);

    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error in auth middleware",
    });
  }
};

module.exports = { userAuth };
