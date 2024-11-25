const express = require("express");
const { authenticateUser } = require('../../../jwtStrategy/JwtStrategy');
const { error } = require("../../../helper/api-response");
const {validateAreaType} = require("../../../validator/maintenance/masters/area-type-validator")
const AreaTypeModel = require("../../../model/maintenance/masters/area-model")
const { addArea, updateArea, deleteArea, getAllAreaLists, getAreaById } = require("../../../controller/maintenance/masters/area-controller")


const AreaRouter = new express.Router();

AreaRouter.param("id", async function (req, res, next) {
    const { id } = req.params;  
    const Area = await AreaTypeModel.findOne({  where: {id: id }});
    if (Area) {
      req.area = Area;
      next();
    } else {
      return res.status(404).json(error("No Area found", res.statusCode));
    }
  });


AreaRouter.post('/add',validateAreaType, addArea)
AreaRouter.put('/update/:id',validateAreaType, updateArea)
AreaRouter.delete('/:id', deleteArea)
AreaRouter.post('/list', getAllAreaLists)
AreaRouter.get('/:id', getAreaById)
module.exports = AreaRouter