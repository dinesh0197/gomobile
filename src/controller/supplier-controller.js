const { success } = require("../helper/api-response");
const catchAsync = require("../helper/catch-async");
const Supplier = require("../model/supplier-management");

exports.getAllSupplier = catchAsync(async (req, res) => {
  const supplier = await Supplier.findAll();

  return res
    .status(200)
    .json(success("All Supplier List", { data: supplier }, res.statusCode));
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
  const supplier = await Supplier.findByPk(id);

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
  const payload = req.body;
  const supplier = await Supplier.create(payload);

  return res
    .status(200)
    .json(
      success(
        "Supplier Created Successfully",
        { data: supplier },
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
