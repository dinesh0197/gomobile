const {success , error} = require("../../../helper/api-response")
const catchAsync = require("../../../helper/catch-async");
const { Op, DataTypes } = require("sequelize");
const AreaModel = require("../../../model/maintenance/masters/area-model")
const { isNotEmpty } = require("../../../helper/common");



exports.addArea = catchAsync(async (req,res)=>{
    const {area_name} = req.body

    try{
        const newAreaData = {
            area_name: area_name,
            createdAt:Date.now(),
        }
        const newArea = await AreaModel.create(newAreaData);
        if(newArea){
            return res.status(201).json(success("Area has been created successfully" , {data:newArea},res.statusCode))
        }
    }
    catch(e){
        return res.status(400).json(error(e.message , res.statusCode))
    }
})


exports.updateArea = catchAsync(async(req,res) =>{
    const {area_name} = req.body
    const {id} = req.params
    try{
        const updateData = {
            area_name:area_name,           
            updatedAt:DataTypes.NOW
        }
        const updateArea = await AreaModel.update(updateData,{where: {id:id}})
        if(updateArea){
            return res.status(201).json(success("Area name has been updated successfully",{data:updateArea},res.statusCode))
        }
    }
    catch(e){
        return res
        .status(400)
        .json(error(err.errors.value, res.statusCode));
    }
})


exports.deleteArea = catchAsync(async(req,res)=>{
    const {id} = req.params;
    try{
        let Area = await AreaModel.destroy({ where: { id: id }, paranoid: true });
        if (Area) {
            return res
                .status(201)
                .json(
                    success(
                        "Area has been Deleted successfully",
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

exports.getAllAreaLists = catchAsync(async (req, res) => {
    const search = req.body.searchString ? req.body.searchString.trim() : "";
    const page = parseInt(req.body.page) || 1;
    const limit = parseInt(req.body.limit) || 1000;
    const skip = (page - 1) * limit;
    let query = {}

    try {
        const AreaList = await AreaModel.findAndCountAll({
            where: {
                area_name: {
                    [Op.like]: `%${search}%`, // Search for users with username containing the search term
                },
                ...query
            },
            offset: skip, // Number of records to skip
            limit: limit, // Maximum number of records to return
        });
        if (AreaList.count > 0) {
            return res
                .status(200)
                .json(
                    success(
                        "Success",
                        { totalCount: AreaList.count, data: AreaList.rows },
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

exports.getAreaById = catchAsync(async (req, res) => {
    return res
        .status(200)
        .json(
            success(
            "Area details fetched successfully",
            { data: req.area },
            res.statusCode
            )
        );  
});