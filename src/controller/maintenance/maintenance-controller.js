const { success, error } = require("../../helper/api-response");
const catchAsync = require("../../helper/catch-async");
const { Op, Sequelize } = require("sequelize");
const MaintenanceModel = require("../../model/maintenance/maintenance-model")
const AreaModel = require("../../model/maintenance/masters/area-model")
const JobTypeModel = require("../../model/maintenance/masters/job-type-model")
const UserModel = require("../../model/user-model")
const { getWeekStartAndEndDate } = require("../../helper/constants");


exports.addMaintenance = catchAsync(async(req,res)=>{
    const {type, job_type_id, area_type_id, issue, date, timings, status, priority,no_of_people,assign_to,recurring_type,start_date,maintenance_remainder} = req.body
    let formatedDate;
    let formatedStartDate;
    if (date) {
        formatedDate  = new Date(date);
    }
    if (start_date) {
        formatedStartDate  = new Date(start_date);
    }
    try{
        const newMaintenance = {
            type: type,
            job_type_id: job_type_id,
            area_type_id: area_type_id,
            issue: issue,
            date: formatedDate,
            timings: timings,
            status: status,
            priority:priority,
            no_of_people:no_of_people,
            assign_to:assign_to,
            recurring_type:recurring_type,
            start_date:formatedStartDate,
            maintenance_remainder:maintenance_remainder,            
            createdAt: Date.now(),
        }
        const newMaintence = await MaintenanceModel.create(newMaintenance);

        if(newMaintence){
            return res.status(201).json(success("Maintenance Request has been created successfully" , {data:newMaintenance},res.statusCode))
        }
    }
    catch(e){
        return res.status(400).json(error(e.message , res.statusCode))
    }
})

exports.updateMaintenance = catchAsync(async(req,res) =>{
    const {type, job_type_id, area_type_id, issue, date, timings, status, priority,no_of_people,assign_to,recurring_type,start_date,maintenance_remainder} = req.body
    const {id} = req.params
    let formatedDate;
    let formatedStartDate;
    if (date) {
        formatedDate  = new Date(date);
    }
    if (start_date) {
        formatedStartDate  = new Date(start_date);
    }
  try{
        const updateData = {
            type: type,
            job_type_id: job_type_id,
            area_type_id: area_type_id,
            issue: issue,
            date: formatedDate,
            timings: timings,
            status: status,
            priority:priority,
            no_of_people:no_of_people,
            assign_to:assign_to,
            recurring_type:recurring_type,
            start_date:formatedStartDate,
            maintenance_remainder:maintenance_remainder,        
            updatedAt: Date.now()
        }
        const updateMaintenance = await MaintenanceModel.update( updateData ,{where: {id: id}})

        if(updateMaintenance){
            return res.status(201).json(success("Maintenance Request has been updated successfully",{data:updateMaintenance},res.statusCode))
        }
    }
    catch(e){
        return res
        .status(400)
        .json(error(e.message, res.statusCode));
    }
})


exports.deleteExpense = catchAsync(async(req,res)=>{
    const {id} = req.params;
    try{
        let maintenance = await MaintenanceModel.destroy({ where: { id: id }, paranoid: true });
        if (maintenance) {
            return res
                .status(201)
                .json(
                    success(
                        "Maintenance Request has been Deleted successfully",
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

exports.getAllMaintenanceLists = catchAsync(async (req, res) => {
    const search = req.body.searchString ? req.body.searchString.trim() : "";
    const page = parseInt(req.body.page) || 1;
    const limit = parseInt(req.body.limit) || 1000;
    const skip = (page - 1) * limit;
    let query = {}    

    try {
        const maintenanceListCount = await MaintenanceModel.count({
            where: {
              ...query,
            }
        });

        const maintenanceList = await MaintenanceModel.findAndCountAll({
            where: {
                ...query
            },
            include:[
                {
                  model: AreaModel,
                  as: 'area',
                  attributes: ['id', 'area_name']
                },
                {
                  model: JobTypeModel,
                  as: 'jobType', 
                  attributes: ['id', 'job_type_name']
                },
                {
                  model: UserModel,
                  as: 'assignTo', 
                  attributes: ['id', 'firstName']
                }
          
            ],
            offset: skip, // Number of records to skip
            limit: limit, // Maximum number of records to return
            order: [['createdAt', 'DESC']]
        });
        if (maintenanceListCount > 0) {
            return res
                .status(200)
                .json(
                    success(
                        "Success",
                        { totalCount: maintenanceListCount, data: maintenanceList.rows },
                        res.statusCode
                    )
                );
        }
        return res.status(404).json(error("No records found", res.statusCode));
    } catch (e) {
        return res
            .status(400)
            .json(error(e.message, res.statusCode));
    }
});

exports.getMaintenanceById = catchAsync(async (req, res) => {
    return res
        .status(200)
        .json(
            success(
            "Maintenance Request detail fetched successfully",
            { data: req.maintenance },
            res.statusCode
            )
        );  
});

exports.getAllVisitorWeekLists = catchAsync(async (req, res) => {
    const { user_id, date } = req.body;
    let query = {}
    
    if (user_id) {
      query.user_id = user_id;
    }
  
    if (date) {
      const inputDate = new Date(date);
      const { startDate, endDate } = getWeekStartAndEndDate(inputDate);
      query.date = { [Op.between]: [startDate, endDate] };
    } else {
      const currentDate = new Date();
      const { startDate, endDate } = getWeekStartAndEndDate(currentDate);
      query.date = { [Op.between]: [startDate, endDate] };
    }
    
    let whereClause = { ...query };  
  
    const totalCount = await MaintenanceModel.count({
      where: query,
    });
  
    const maintenance = await MaintenanceModel.findAndCountAll({
      where: whereClause,
      attributes: [
        'date',      
        [Sequelize.fn('GROUP_CONCAT', Sequelize.fn('DISTINCT', Sequelize.col('timings'))), 'timings'],
        [Sequelize.fn('GROUP_CONCAT', Sequelize.fn('DISTINCT', Sequelize.col('area.area_name'))), 'areas'],
        [Sequelize.literal('COUNT(*)'), 'areaCount']
      ],
      include: [
        {
          model: AreaModel,
          as: 'area',
          required: false,
          attributes: []
        },      
      ],
      group: ['date', 'timings'],
      order: [['timings', 'ASC']],
      raw: true,
    });
  
    return res
      .status(200)
      .json(
        success(
          "Success",
          { totalCount: totalCount, data: maintenance.rows },
          res.statusCode
        )
      );
  });