const {DataTypes} = require("sequelize")
const sequilize = require("../../../config/db-connection")

const job_type = sequilize.define("job_type",{
    id:{
        type:DataTypes.UUID,
        primaryKey:true,
        defaultValue:DataTypes.UUIDV4
    },
    job_type_name:{
        type:DataTypes.STRING,
        allowNull:false
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

module.exports = job_type