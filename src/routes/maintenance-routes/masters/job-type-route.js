const express = require("express");
const { authenticateUser } = require('../../../jwtStrategy/JwtStrategy');
const { error } = require("../../../helper/api-response");
const {validateJobType} = require("../../../validator/maintenance/masters/job-type-validator")
const JobTypeModel = require("../../../model/maintenance/masters/job-type-model")
const { addJobType, updateJobType, deleteJobType, getAllJobTypeLists, getJobTypeById } = require("../../../controller/maintenance/masters/job-type-controller")


const JobTypeRouter = new express.Router();

JobTypeRouter.param("id", async function (req, res, next) {
    const { id } = req.params;  
    const jobType = await JobTypeModel.findOne({  where: {id: id }});
    if (jobType) {
      req.jobtype = jobType;
      next();
    } else {
      return res.status(404).json(error("No Job type found", res.statusCode));
    }
  });


JobTypeRouter.post('/add',validateJobType, addJobType)
JobTypeRouter.put('/update/:id',validateJobType, updateJobType)
JobTypeRouter.delete('/:id', deleteJobType)
JobTypeRouter.post('/list', getAllJobTypeLists)
JobTypeRouter.get('/:id', getJobTypeById)
module.exports = JobTypeRouter