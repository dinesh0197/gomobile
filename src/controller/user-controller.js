const { success, error } = require("../helper/api-response");
const catchAsync = require("../helper/catch-async");
const User = require("../model/user-model");
const { Op, Sequelize } = require("sequelize");
const {
  getCommonValuesFromObject,
  generateRandomAlphanumeric,
} = require("../helper/constants");
const { uploadSingleFile } = require("../helper/file-upload");
const { passwordUpdated } = require("../helper/send-email");
const Order = require("../model/order-model");
const moment = require("moment");

exports.getViewUser = catchAsync(async (req, res) => {
  return res
    .status(200)
    .json(success("Success", { data: req.user }, res.statusCode));
});

exports.getAllUSerLists = catchAsync(async (req, res) => {
  const search = req.body.searchString ? req.body.searchString.trim() : "";
  const page = parseInt(req.body.page) || 1;
  const limit = parseInt(req.body.limit) || 1000;
  const skip = (page - 1) * limit;
  const role = req.body.role ?? "user";
  const { propertyId, unitId } = req.body;
  let query = {};

  if (propertyId) {
    query.propertyId = propertyId;
  }

  if (unitId) {
    query.unitId = unitId;
  }

  const user = await User.findAndCountAll({
    where: {
      [Op.or]: [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
      ],
      role: {
        [Op.or]: [role],
      },
      parentId: {
        [Op.or]: req.user.role === "FBA" ? [] : [req.user.parentId],
      },
      ...query,
    },
    include: [
      {
        model: PropertyModel,
        as: "property",
        attributes: ["property_type", "property_name", "id"],
      },
      {
        model: UnitModel,
        as: "unit",
        attributes: ["id", "unit_name"],
      },
    ],
    offset: skip, // Number of records to skip
    limit: limit, // Maximum number of records to return
  });
  // if (category.count > 0) {
  return res
    .status(200)
    .json(
      success(
        "Success",
        { totalCount: user.count, data: user.rows },
        res.statusCode
      )
    );
  //  return res.status(404).json(error("No records found", res.statusCode));
});

exports.deleteUser = catchAsync(async (req, res) => {
  const { id } = req.params;

  const user = await User.destroy({
    where: {
      id: id,
    },
  });
  if (user) {
    return res
      .status(204)
      .json(
        success(
          "User has been deleted successfully",
          { data: "" },
          res.statusCode
        )
      );
  }
  return res
    .status(400)
    .json(error("User has not been deleted", res.statusCode));
});

exports.updateUser = catchAsync(async (req, res) => {
  const formData = req.body;
  const values = [
    "phoneNumber",
    "lastName",
    "email",
    "firstName",
    "propertyId",
    "leaseStartDate",
    "leaseEndDate",
    "leaseReminderDays",
    "unitId",
    "age",
    "familyMember",
    "job",
    "general_rent",
    "security_deposit",
    "late_fee",
    "incident_receipt",
  ];
  const updateData = getCommonValuesFromObject(formData, values);
  const { id } = req.params;

  if (req.files && req.files.length > 0) {
    const profilePictureResponse = await uploadSingleFile(
      "./uploads/userProfile",
      req.files[0]
    );
    if (profilePictureResponse.error) {
      return res.status(404).json(profilePictureResponse);
    }

    if (profilePictureResponse && profilePictureResponse.code === 200) {
      updateData.profilePicture = profilePictureResponse.results;
    }
  }

  const userUpdated = await User.update(updateData, {
    where: {
      id: id, // Specify the condition to update the user with the given ID
    },
  });
  if (userUpdated)
    return res
      .status(200)
      .json(
        success(
          "User has been updated successfully",
          { data: userUpdated },
          res.statusCode
        )
      );

  return res
    .status(400)
    .json(error("User has not updated. Please try again.", res.statusCode));
});

exports.getRoleBasedUserLists = catchAsync(async (req, res) => {
  const page = parseInt(req.body.page) || 1;
  const limit = parseInt(req.body.limit) || 1000;
  const skip = (page - 1) * limit;
  const role = req.body.role;
  if (role) {
    const user = await User.findAndCountAll({
      where: {
        role: role,
      },
      offset: skip, // Number of records to skip
      limit: limit, // Maximum number of records to return
    });
    // if (category.count > 0) {
    return res
      .status(200)
      .json(
        success(
          "Success",
          { totalCount: user.count, data: user.rows },
          res.statusCode
        )
      );
  }
  return res
    .status(200)
    .json(success("Success", { message: "Role is missing" }, res.statusCode));
});

exports.dashBoardDetail = catchAsync(async (req, res) => {
  const { role, id } = req.userInfo || {};
  let filter = {};

  if (role === "User") {
    filter.assignedFranchiseId = id;
  }

  const user = await User.count();
  const order = await Order.count({ where: filter });
  const pendingOrders = await Order.count({
    where: {
      ...filter,
      status: "Pending",
    },
  });

  const shippedOrders = await Order.count({
    where: {
      ...filter,
      status: "Shipped",
    },
  });

  const oneYear = Array.from({ length: 12 }, (_, i) => {
    return moment().subtract(i, "months").format("YYYY-MM");
  }).reverse();

  const rawResults = await Order.findAll({
    where: {
      ...filter,
      orderDate: {
        [Sequelize.Op.gte]: moment()
          .subtract(12, "months")
          .startOf("month")
          .toDate(),
      },
    },
    attributes: [
      [
        Sequelize.fn("DATE_FORMAT", Sequelize.col("orderDate"), "%Y-%m"),
        "month",
      ],
      [Sequelize.fn("COUNT", Sequelize.col("id")), "orderCount"],
    ],
    group: [Sequelize.fn("DATE_FORMAT", Sequelize.col("orderDate"), "%Y-%m")],
    raw: true,
  });

  const orderCountMap = Object.fromEntries(
    rawResults.map((result) => [result.month, parseInt(result.orderCount, 10)])
  );

  const ordersCountPerMonth = oneYear.map((month) => ({
    month,
    orderCount: orderCountMap[month] || 0,
  }));

  // console.log({ ordersCountPerMonth });

  let franchisesOrderCount = null;
  if (role !== "User") {
    const threeMonths = Array.from({ length: 3 }, (_, i) => {
      return moment().subtract(i, "months").format("YYYY-MM");
    }).reverse();

    const rawResults = await User.findAll({
      attributes: [
        "id",
        ["legal_name", "name"],
        [
          Sequelize.fn(
            "DATE_FORMAT",
            Sequelize.col("franchiseOrders.orderDate"),
            "%Y-%m"
          ),
          "month",
        ],
        [
          Sequelize.fn("COUNT", Sequelize.col("franchiseOrders.id")),
          "orderCount",
        ],
      ],
      include: [
        {
          model: Order,
          as: "franchiseOrders",
          attributes: [],
          where: {
            orderDate: {
              [Op.gte]: `${threeMonths[0]}-01`,
            },
          },
        },
      ],
      group: [
        "User.id",
        Sequelize.fn(
          "DATE_FORMAT",
          Sequelize.col("franchiseOrders.orderDate"),
          "%Y-%m"
        ),
      ],
      raw: true,
    });

    franchisesOrderCount = rawResults.reduce((acc, record) => {
      const { id, name, month, orderCount } = record;

      // Find existing franchise
      let franchise = acc.find((item) => item.id === id);
      if (!franchise) {
        franchise = { id, name, results: [] };
        acc.push(franchise);
      }

      // Add the record to the results
      franchise.results.push({ month, orderCount });

      return acc;
    }, []);

    franchisesOrderCount.forEach((franchise) => {
      const existingMonths = franchise.results.map((r) => r.month);

      threeMonths.forEach((month) => {
        if (!existingMonths.includes(month)) {
          franchise.results.push({ month, orderCount: 0 });
        }
      });

      // Sort results by month to maintain order
      franchise.results.sort((a, b) => a.month.localeCompare(b.month));
    });

    const monthColors = {
      0: "#0070C0",
      1: "#FF0000",
      2: "#FFC000",
    };

    franchisesOrderCount = franchisesOrderCount.map((item) => {
      if (item.results.length) {
        return {
          ...item,
          results: item.results.map((ele, idx) => ({
            ...ele,
            color: monthColors[idx],
          })),
        };
      }
      return item;
    });

    // console.dir(franchisesOrderCount, { depth: null });
  }

  return res.status(200).json(
    success(
      "Success",
      {
        data: {
          userCount: user,
          orderCount: order,
          pendingOrderCount: pendingOrders,
          shippedOrderCount: shippedOrders,
          franchisesOrderCount,
          ordersCountPerMonth,
        },
      },
      res.statusCode
    )
  );
});

exports.userDetails = catchAsync(async (req, res) => {
  const tenantDocument = await FileManager.findAll({
    where: {
      originId: req.user.id,
      originType: "TenantDocument",
    },
  });

  const user = await User.findOne({
    where: { id: req.user.id },
    include: [
      {
        model: PropertyModel,
        as: "property",
        attributes: ["id", "property_name"],
      },
      {
        model: UnitModel,
        as: "unit",
        required: false,
        attributes: ["id", "unit_name"],
      },
    ],
    attributes: {
      exclude: ["tokenExpires", "token", "password"],
    },
  });

  const tenant = await TenantModel.findOne({
    where: { user_id: req.user.id },
  });

  return res.status(200).json(
    success(
      "Success",
      {
        data: {
          user: user,
          tenant: tenant,
          tenantDocument: tenantDocument,
        },
      },
      res.statusCode
    )
  );
});

exports.userUpdatePassword = catchAsync(async (req, res) => {
  const { password } = req.body;
  const { email, token } = req.user;
  try {
    const user = await User.findOne({ where: { email: email, token: token } });
    if (!user) {
      return res
        .status(400)
        .json(error("Not a valid Email or Password", res.statusCode));
    }
    const newToken = generateRandomAlphanumeric(8);
    user.password = password;
    user.token = newToken;
    user.tokenExpires = Date.now();
    user.isUserVerified = true;
    user.updatedAt = Date.now();
    const userUpdated = await user.save();
    //const emailSend = passwordUpdated(user);

    return res
      .status(200)
      .json(
        success(
          " Your account password has been updated.",
          { data: userUpdated },
          res.statusCode
        )
      );
  } catch (e) {
    return res.status(400).json(error(e.message, res.statusCode));
  }
});

exports.changePasswordRequest = catchAsync(async (req, res) => {
  const { password } = req.body;

  const user = req.user;
  if (!user) {
    return res.status(400).json(error("Not a valid user", res.statusCode));
  }

  user.password = password;
  user.token = "";
  user.tokenExpires = null;
  const userUpdated = await user.save();
  const emailSend = passwordUpdated(user);

  return res
    .status(200)
    .json(
      success(
        " Your account password has  been updated.",
        { data: userUpdated },
        res.statusCode
      )
    );
});
