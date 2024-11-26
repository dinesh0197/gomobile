const User = require("../model/user-model");
const OtpVerification = require("../model/otp-verifications-model");
const Jwt = require("../model/jwt-model");
const catchAsync = require("../helper/catch-async");
const { success, error } = require("../helper/api-response");
const {
  generateRandomAlphanumeric,
  generateRandomNumber,
} = require("../helper/constants");
const {
  sendWelcomeEmail,
  passwordUpdated,
  sendForgotPasswordEmail,
  sendVisitorWelcomeEmail,
} = require("../helper/send-email");
const jsonWebToken = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const moment = require("moment/moment");
const { Op } = require("sequelize"); // Import Sequelize operators
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

exports.getLoginRequest = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json(error("User not found.", res.statusCode));
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json(error("Invalid email or password.", res.statusCode));
    }

    const token = jwt.sign(
      { id: user.id, role: "User" },
      process.env.JWT_SECRET,
      { expiresIn: "11h" } // Token expiration time
    );

    return res.status(200).json(
      success(
        "Login successful.",
        {
          // firstName: user.firstName,
          // lastName: user.lastName,
          legal_name: user.legal_name,
          email: user.email,
          token: token,
          role: user.role,
        },
        res.statusCode
      )
    );
  } catch (err) {
    console.error("Error details:", err);
    return res.status(500).json(error("Internal server error", res.statusCode));
  }
});

exports.getUserById = catchAsync(async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findOne({ where: { id } });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        error: true,
        code: 404,
      });
    }

    return res
      .status(200)
      .json(
        success("User retrieved successfully", { data: user }, res.statusCode)
      );
  } catch (e) {
    return res.status(400).json(error(e, res.statusCode));
  }
});

exports.getAllUsers = catchAsync(async (req, res) => {
  try {
    const { search, pageNo = 1, perPage = 10 } = req.query;

    // Convert pageNo and perPage to integers
    const limit = parseInt(perPage, 10) || 10;
    const offset = (parseInt(pageNo, 10) - 1) * limit;

    let users;
    let totalCount;

    if (search) {
      // Fetch total count for the search criteria
      totalCount = await User.count({
        where: {
          [Op.or]: [
            { franchise_code: { [Op.like]: `%${search}%` } },
            { operating_name: { [Op.like]: `%${search}%` } },
            { legal_name: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } },
          ],
        },
      });

      // Fetch paginated users
      users = await User.findAll({
        where: {
          [Op.or]: [
            { franchise_code: { [Op.like]: `%${search}%` } },
            { operating_name: { [Op.like]: `%${search}%` } },
            { legal_name: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } },
          ],
        },
        limit,
        offset,
      });
    } else {
      // Fetch total count for all users
      totalCount = await User.count();

      // Fetch paginated users
      users = await User.findAll({
        limit,
        offset,
      });
    }

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / limit);

    return res.status(200).json(
      success(
        "Users retrieved successfully",
        {
          data: users,
          totalCount,
          perPage: limit,
          pageNo: parseInt(pageNo, 10),
          totalPages,
        },
        res.statusCode
      )
    );
  } catch (e) {
    return res.status(400).json(error(e.message, res.statusCode));
  }
});

exports.getUserProfile = catchAsync(async (req, res) => {
  const { id } = req.userInfo;
  try {
    const user = await User.findOne({ where: { id } });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        error: true,
        code: 404,
      });
    }

    return res.status(200).json(
      success(
        "User retrieved successfully",
        {
          data: {
            id: user.id,
            legal_name: user.legal_name,
            email: user.email,
            token: token,
            role: user.role,
          },
        },
        res.statusCode
      )
    );
  } catch (e) {
    return res.status(400).json(error(e, res.statusCode));
  }
});

exports.createRequest = catchAsync(async (req, res) => {
  const {
    email,
    franchise_code,
    operating_name,
    legal_name,
    phone,
    address,
    city,
    state,
    country,
    zipcode,
    role,
    status,
  } = req.body;

  // Check if the user already exists
  let userData = await User.findOne({
    where: { email: email },
  });

  if (!userData) {
    // Generate a random password
    const randomPassword = crypto.randomBytes(8).toString("hex");

    // Create a new user
    userData = await User.create({
      email: email,
      password: randomPassword,
      franchise_code: franchise_code,
      operating_name: operating_name,
      legal_name: legal_name,
      phone: phone,
      address: address,
      city: city,
      state: state,
      country: country,
      zipcode: zipcode,
      role: role || "User", // Default role if none provided
      created_by: "system", // Adjust as necessary
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Send an OTP or notification here (integrate your preferred method)
    await sendVisitorWelcomeEmail(userData, randomPassword);
    console.log(`User created with random password: ${randomPassword}`);
  } else {
    // User exists, check if password is set
    if (userData.password) {
      return res
        .status(400)
        .json(
          error(
            "User account request already submitted with this email address.",
            res.statusCode
          )
        );
    }

    console.log("Password not set up. Proceed to send OTP for password setup.");
    // Handle OTP or password setup process here if necessary
  }

  return res
    .status(201)
    .json(
      success(
        "Your user account has been created, and an OTP has been sent successfully.",
        { data: userData },
        res.statusCode
      )
    );
});

exports.updateUser = catchAsync(async (req, res) => {
  const { id } = req.params;
  const {
    operating_name,
    legal_name,
    phone,
    address,
    city,
    state,
    country,
    zipcode,
    role,
    firstName,
    lastName,
    // phone,
    // address,
    // city,
    // state,
    // country,
    // zipcode,
    status,
  } = req.body;

  console.log(">>>>>>>>>>>>", req.body, req.params);

  try {
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json(error("User not found.", res.statusCode));
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (city) user.city = city;
    if (state) user.state = state;
    if (country) user.country = country;
    if (zipcode) user.zipcode = zipcode;
    if (legal_name) user.legal_name = legal_name;
    if (operating_name) user.operating_name = operating_name;
    if (role) user.role = role;

    if (typeof status === "boolean") user.status = status;

    user.updatedAt = new Date();

    await user.save();

    return res
      .status(200)
      .json(
        success("User updated successfully.", { data: user }, res.statusCode)
      );
  } catch (err) {
    console.error("Error details:", err);
    return res
      .status(500)
      .json(
        error("An error occurred while updating the user.", res.statusCode)
      );
  }
});

exports.sendOTPwithToEmail = catchAsync(async (req, res) => {
  const { email } = req.body;
  try {
    // Find the user by email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        message: "No user found with this email.",
        error: true,
        code: 404,
      });
    }

    // Generate OTP and set expiration time
    const otp = generateRandomNumber();
    const expiresAt = moment().clone().add(60, "seconds");

    // Store OTP in the database
    await OtpVerification.create({
      userId: user.id,
      otpCode: otp,
      type: "EMAIL",
      expiresAt: expiresAt,
    });

    // Send OTP to user's email
    await sendForgotPasswordEmail(user, otp); // Use otp instead of undefined variable 'token'

    return res
      .status(200)
      .json(
        success(
          "Otp has been sent successfully. Please check your email for otp",
          { data: { user } },
          res.statusCode
        )
      );
  } catch (e) {
    console.error(e); // Log the error to understand the problem
    return res.status(400).json(error(e.message || e, res.statusCode));
  }
});

exports.verifyOTPwithToEmail = catchAsync(async (req, res) => {
  const { email, otp } = req.body;
  console.log("req.body", req.body);
  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        message: "No user found with this email.",
        error: true,
        code: 404,
      });
    }

    const currentTime = moment();
    const otpData = await OtpVerification.findOne({
      where: {
        userId: user.id,
        otpCode: otp,
        type: "EMAIL",
      },
    });
    console.log({ otpData });

    if (!otpData) {
      return res.status(422).json({
        message: "Invalid OTP",
        error: true,
        code: 422,
      });
    }

    if (otpData.expiresAt < currentTime) {
      return res.status(422).json({
        message: "OTP expired",
        error: true,
        code: 422,
      });
    }

    const tokenExp = process.env.JWT_EXPIRES || "60s";
    const jwtSecret = process.env.JWT_SECRET || "supersecret";
    const expiresAt = moment().clone().add(60, "seconds");
    const token = jsonWebToken.sign(
      {
        email: user.email,
        name: user.firstName,
        id: user.id,
      },
      jwtSecret,
      { expiresIn: tokenExp }
    );

    await Jwt.create({
      userId: user.id,
      token: token,
      expiresAt: expiresAt,
    });

    // Setting the token and additional user data in the headers
    res.setHeader("Authorization", `Bearer ${token}`);
    res.setHeader("User-Id", user.id);
    // res.setHeader("User-Name", user.firstName);
    res.setHeader("Token-Expiry", expiresAt.toISOString());

    return res
      .status(200)
      .json(
        success(
          "Otp has been verified successfully",
          { data: { token } },
          res.statusCode
        )
      );
  } catch (e) {
    return res.status(400).json(error(e, res.statusCode));
  }
});

exports.resetPasswordRequest = catchAsync(async (req, res) => {
  const { email, password, token } = req.body;

  const user = await User.findOne({
    where: { email: email },
    attributes: {
      exclude: [
        "password",
        "createdAt",
        "updatedAt",
        "deletedAt",
        "updatedBy",
        "deletedBy",
      ],
    },
  });
  if (!user) {
    return res.status(400).json(error("Invalid user", res.statusCode));
  }

  const jwtData = await Jwt.findOne({
    where: { userId: user.id, token: token },
  });

  if (!jwtData) {
    return res.status(400).json(error("Invalid token", res.statusCode));
  }

  const currentTime = new Date();
  if (new Date(jwtData.expiresAt) < currentTime) {
    return res.status(400).json(error("Token has expired", res.statusCode));
  }

  user.password = password;
  // user.token = "";
  // user.tokenExpires = "";
  const userUpdated = await user.save();

  const emailSend = passwordUpdated(user);

  return res.status(200).json(
    success(
      "Your account password has been updated.",
      // { data: userUpdated },
      res.statusCode
    )
  );
});
