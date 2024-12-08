const { Router } = require("express");
const supplier = Router();
const SupplierManagement = require("../controller/supplier-controller");
const { authenticateSuppliers } = require("../jwtStrategy/JwtStrategy");
const { getAllUsers } = require("../controller/auth-controller");

supplier.get("/users", authenticateSuppliers, getAllUsers);

//  get all suppliers
supplier.get("/", SupplierManagement.getAllSupplier);

// create a supplier
supplier.post("/", SupplierManagement.createSupplier);

// get a specific supplier
supplier.get("/:id", SupplierManagement.getOneSupplier);

// update a supplier
supplier.patch("/:id", SupplierManagement.updateSupplier);

// delete a supplier
supplier.delete("/:id", SupplierManagement.deleteSupplier);



module.exports = supplier;
