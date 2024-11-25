
const express = require("express");
const { authenticateUser } = require('../../jwtStrategy/JwtStrategy');
const { error } = require("../../helper/api-response");
const {validateMaintenance} = require("../../validator/maintenance/maintenance-validator")
const MaintenanceModel = require("../../model/maintenance/maintenance-model")
const { addMaintenance, updateMaintenance, deleteExpense, getAllMaintenanceLists, getMaintenanceById, getAllVisitorWeekLists, } = require("../../controller/maintenance/maintenance-controller")
const AreaRouter = require("../maintenance-routes/masters/area-route")
const JobTypeRouter = require("../maintenance-routes/masters/job-type-route")

const MaintenanceRouter = new express.Router();
MaintenanceRouter.use(authenticateUser);

MaintenanceRouter.param("id", async function (req, res, next) {
    const { id } = req.params;  
    const Maintenance = await MaintenanceModel.findOne({  where: {id: id }});
    if (Maintenance) {
      req.maintenance = Maintenance;
      next();
    } else {
      return res.status(404).json(error("No Maintenance Request found", res.statusCode));
    }
  });


MaintenanceRouter.post('/add',validateMaintenance, addMaintenance)
MaintenanceRouter.put('/update/:id',validateMaintenance, updateMaintenance)
MaintenanceRouter.delete('/:id', deleteExpense)
MaintenanceRouter.post('/list', getAllMaintenanceLists)
MaintenanceRouter.get('/:id', getMaintenanceById)
MaintenanceRouter.post('/weekList', getAllVisitorWeekLists)


MaintenanceRouter.use("/area-type",AreaRouter)
MaintenanceRouter.use("/job-type",JobTypeRouter)


module.exports = MaintenanceRouter