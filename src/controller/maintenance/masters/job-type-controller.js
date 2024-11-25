const {success , error} = require("../../../helper/api-response")
const catchAsync = require("../../../helper/catch-async");
const { Op, DataTypes } = require("sequelize");
const JobTypeModel = require("../../../model/maintenance/masters/job-type-model")



exports.addJobType = catchAsync(async (req,res)=>{
    const {job_type_name} = req.body

    try{
        const newJobTypeData = {
            job_type_name: job_type_name,
            createdAt:Date.now(),
        }
        const newJobType = await JobTypeModel.create(newJobTypeData);
        if(newJobType){
            return res.status(201).json(success("Job has been created successfully" , {data:newJobType},res.statusCode))
        }
    }
    catch(e){
        return res.status(400).json(error(e.message , res.statusCode))
    }
})


exports.updateJobType = catchAsync(async(req,res) =>{
    const {job_type_name} = req.body
    const {id} = req.params
    try{
        const updateData = {
            job_type_name:job_type_name,           
            updatedAt:DataTypes.NOW
        }
        const updateJobType = await JobTypeModel.update(updateData,{where: {id:id}})
        if(updateJobType){
            return res.status(201).json(success("Job type name has been updated successfully",{data:updateJobType},res.statusCode))
        }
    }
    catch(e){
        return res
        .status(400)
        .json(error(err.errors.value, res.statusCode));
    }
})


exports.deleteJobType = catchAsync(async(req,res)=>{
    const {id} = req.params;
    try{
        let jobType = await JobTypeModel.destroy({ where: { id: id }, paranoid: true });
        if (jobType) {
            return res
                .status(201)
                .json(
                    success(
                        "Job type has been Deleted successfully",
                        { data: "" },
                        res.statusCode
                    )
                );
        }
    }
    catch(e){
        return res
        .status(400)
        .json(error(e.errors[0].message, res.statusCode));
    }
})

exports.getAllJobTypeLists = catchAsync(async (req, res) => {
    const search = req.body.searchString ? req.body.searchString.trim() : "";
    const page = parseInt(req.body.page) || 1;
    const limit = parseInt(req.body.limit) || 1000;
    const skip = (page - 1) * limit;
    let query = {}

    try {
        const JobTypeList = await JobTypeModel.findAndCountAll({
            where: {
                job_type_name: {
                    [Op.like]: `%${search}%`, // Search for users with username containing the search term
                },
                ...query
            },
            offset: skip, // Number of records to skip
            limit: limit, // Maximum number of records to return
        });
        if (JobTypeList.count > 0) {
            return res
                .status(200)
                .json(
                    success(
                        "Success",
                        { totalCount: JobTypeList.count, data: JobTypeList.rows },
                        res.statusCode
                    )
                );
        }
        return res.status(404).json(error("No records found", res.statusCode));
    } catch (e) {
        return res
            .status(400)
            .json(error(err.errors.value, res.statusCode));
    }
});

exports.getJobTypeById = catchAsync(async (req, res) => {
    return res
        .status(200)
        .json(
            success(
            "Job type detail fetched successfully",
            { data: req.jobtype },
            res.statusCode
            )
        );  
});