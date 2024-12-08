const { Router } = require("express");
const product = Router();
const ProductItem = require("../controller/product-controller");
const { authenticateUser } = require("../jwtStrategy/JwtStrategy");
product.use(authenticateUser);

//  get all suppliers
product.get("/");

// create a product
product.post("/");

// get a specific product
product.get("/:id");

// update a product
product.patch("/:id", ProductItem.updateProductItem);

// delete a product
product.delete("/:id");

module.exports = product;
