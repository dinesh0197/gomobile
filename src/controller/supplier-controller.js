const { Op } = require("sequelize");
const { success } = require("../helper/api-response");
const catchAsync = require("../helper/catch-async");
const Supplier = require("../model/supplier-management");

exports.getAllSupplier = catchAsync(async (req, res) => {
  const { search, pageNo = 1, perPage = 10 } = req.query;

  // Convert pageNo and perPage to integers
  const limit = parseInt(perPage, 10) || 10;
  const offset = (parseInt(pageNo, 10) - 1) * limit;

  const whereClause = search
    ? {
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { phone: { [Op.like]: `%${search}%` } },
        ],
      }
    : {};

  const totalCount = await Supplier.count({
    where: whereClause,
  });

  const supplier = await Supplier.findAll(
    { where: whereClause },
    limit,
    offset
  );

  const totalPages = Math.ceil(totalCount / limit);

  return res.status(200).json(
    success(
      "All Supplier List",
      {
        data: supplier,
        totalCount,
        perPage: limit,
        pageNo: parseInt(pageNo, 10),
        totalPages,
      },
      res.statusCode
    )
  );
});

exports.createSupplier = catchAsync(async (req, res) => {
  const payload = req.body;
  const supplier = await Supplier.create(payload);

  return res.status(200).json(
    success(
      "Supplier Created Successfully",
      {
        data: {
          authToken: supplier.id,
          email: supplier.email,
          name: supplier.name,
        },
      },
      res.statusCode
    )
  );
});

exports.getOneSupplier = catchAsync(async (req, res) => {
  const { id } = req.params;
  const supplier = await Supplier.findByPk(id, { raw: true });

  if (!supplier) return res.status(404).json({ message: "Supplier not found" });

  const { id: authToken, ...rest } = supplier;
  return res
    .status(200)
    .json(
      success(
        "Supplier deatils",
        { data: { authToken, ...rest } },
        res.statusCode
      )
    );
});

exports.updateSupplier = catchAsync(async (req, res) => {
  const { id } = req.params;
  const payload = req.body;

  const [affectedRows] = await Supplier.update(payload, {
    where: { id },
  });

  if (affectedRows === 0) {
    return res
      .status(404)
      .json(error("Supplier not found or no changes applied", res.statusCode));
  }

  const updatedSupplier = await Supplier.findByPk(id);
  const { id: authToken, ...rest } = updatedSupplier;
  return res.status(200).json(
    success(
      "Supplier Updated Successfully",
      {
        data: {
          authToken,
          ...rest,
        },
      },
      res.statusCode
    )
  );
});

exports.deleteSupplier = catchAsync(async (req, res) => {
  const { id } = req.params;

  const supplier = await Supplier.destroy({
    where: {
      id: id,
    },
  });

  if (supplier) {
    return res
      .status(200)
      .json(
        success(
          "Supplier has been deleted successfully",
          { data: "" },
          res.statusCode
        )
      );
  }

  return res
    .status(400)
    .json(error("Supplier has not been deleted", res.statusCode));
});
