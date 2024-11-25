const {DataTypes} = require("sequelize")
const sequilize = require("../../config/db-connection")
const AreaModel = require("../../model/maintenance/masters/area-model")
const JobTypeModel = require("../../model/maintenance/masters/job-type-model")
const UserModel = require("../../model/user-model")
const maintenanceModel = sequilize.define("Maintenance",{
    id:{
        type:DataTypes.UUID,
        primaryKey:true,
        defaultValue:DataTypes.UUIDV4
    },
    type:{
        type:DataTypes.ENUM("Corrective","Preventive"),
        allowNull:false
    },
    job_type_id:{
        type: DataTypes.UUID,
        allowNull: false
    },
    area_type_id:{
        type: DataTypes.UUID,
        allowNull: false
    },
    issue:{
        type:DataTypes.STRING,
        allowNull: false
    },
    date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    timings:{
        type:DataTypes.STRING,
        allowNull: false
    },
    status:{
        type:DataTypes.STRING,
        allowNull:false
    },
    priority:{
        type: DataTypes.ENUM("High","Medium","Low"),
        allowNull:false
    },
    no_of_people:{
        type:DataTypes.STRING,
        allowNull:false
    },
    assign_to:{
        type:DataTypes.UUID,
        allowNull: false
    },
    recurring_type:{
        type: DataTypes.ENUM("Cleaning","Plumbing","Electrical","Foods & Beverage"),
        allowNull:true
    },
    start_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      maintenance_remainder:{
        type:DataTypes.STRING,
        allowNull:true
      },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
})

maintenanceModel.belongsTo(JobTypeModel, { foreignKey: 'job_type_id', as: 'jobType' })
maintenanceModel.belongsTo(AreaModel, { foreignKey: 'area_type_id', as: 'area' })
maintenanceModel.belongsTo(UserModel, { foreignKey: 'assign_to', as: 'assignTo' })

module.exports = maintenanceModel