const catchAsync = require("../helper/catch-async");
const ProductItem = require("../model/product-item-model");

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

  const updatedProductItem = await ProductItem.findByPk(id, { raw: true });
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

