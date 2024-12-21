const { success, error } = require("../helper/api-response");
const catchAsync = require("../helper/catch-async");
const { UpdateProductStatusNotification } = require("../helper/send-email");
const Order = require("../model/order-model");
const ProductItem = require("../model/product-item-model");
const User = require("../model/user-model");

exports.updateProductItem = catchAsync(async (req, res) => {
  const { id } = req.params;
  const payload = req.body;

  const [affectedRows] = await ProductItem.update(payload, {
    where: { id },
  });

  if (affectedRows === 0) {
    return res
      .status(404)
      .json(
        error("ProductItem not found or no changes applied", res.statusCode)
      );
  }

  const updatedProductItem = await ProductItem.findByPk(id, {
    include: [
      {
        model: Order,
        as: "order",
        attributes: [
          "assignedFranchiseId",
          "internalOrderId",
          "customerOrderNumber",
        ],
        include: [
          {
            model: User,
            as: "franchise",
            attributes: ["email"],
          },
        ],
      },
    ],
    raw: true,
    nest: true,
  });

  const allUser = await User.findAll({
    where: {
      role: "Admin",
    },
    attributes: ["email"],
    raw: true,
  });
  const adminEmails = allUser.map((user) => user.email);

  UpdateProductStatusNotification(
    [...adminEmails, updatedProductItem?.order?.franchise?.email],
    updatedProductItem
  );

  if (updatedProductItem?.order) delete updatedProductItem.order;

  return res.status(200).json(
    success(
      "Product Item Updated Successfully",
      {
        data: updatedProductItem,
      },
      res.statusCode
    )
  );
});
