const { DataTypes } = require("sequelize");
const sequelize = require("../config/db-connection");
const User = require("./user-model");
const {
  NewOrderCreatedNotification,
  OrderAssignedNotification,
  RequestShippingLabelNotification,
  OrderCancelledNotification,
} = require("../helper/send-email");
const Supplier = require("./supplier-management");

const Order = sequelize.define(
  "Order", // Model name
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },

    internalOrderId: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },

    customerOrderNumber: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    orderDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    orderTotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        "Pending",
        "Completed",
        "Shipped",
        "Cancelled",
        "Created",
        "Ordered",
        "OnHold"
      ),
      allowNull: false,
      defaultValue: "Ordered",
    },
    esd: {
      type: DataTypes.STRING(255),
    },
    specialRequest: {
      type: DataTypes.STRING(255),
    },
    requestedShippingLabel: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    customerId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    masterTrackingNumber: {
      type: DataTypes.STRING(255),
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    deletedBy: {
      type: DataTypes.STRING(255),
    },
    deletedAt: {
      type: DataTypes.DATE,
    },
    assignedFranchiseId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    paranoid: true,
    tableName: "orders",
  }
);

// Define associations
Order.belongsTo(User, {
  foreignKey: "assignedFranchiseId",
  as: "franchise",
});

User.hasMany(Order, {
  foreignKey: "assignedFranchiseId",
  as: "franchiseOrders",
});

Order.belongsTo(Supplier, {
  foreignKey: "createdBy",
  as: "supplierManagement",
});

Supplier.hasMany(Order, {
  foreignKey: "createdBy",
  as: "orders",
});

Order.afterCreate(async (order, options) => {
  try {
    const userEmail = await User.findOne({
      where: { id: order.assignedFranchiseId },
    });

    const adminUsers = await User.findAll({ where: { role: "Admin" } });

    if (adminUsers.length > 0) {
      const adminEmails = adminUsers.map((user) => user.email);

      NewOrderCreatedNotification([...adminEmails, userEmail.email], order);
      console.log("Admin notification email sent successfully!");
    }
  } catch (error) {
    console.error("Error sending admin notification email:", error);
  }
});

Order.beforeUpdate(async (order, options) => {
  try {
    // Check if `assignedFranchiseId` is being updated and is different
    if (order.changed("assignedFranchiseId")) {
      const previousFranchiseId = order.previous("assignedFranchiseId");
      const newFranchiseId = order.assignedFranchiseId;

      // Only proceed if the new franchise is different from the current one
      if (newFranchiseId && newFranchiseId !== previousFranchiseId) {
        // Notify the new franchise
        const newFranchise = await User.findOne({
          where: { id: newFranchiseId },
        });
        if (newFranchise && newFranchise.email) {
          OrderAssignedNotification([newFranchise.email], order, "assigned");
          console.log("Notification sent to the new franchise (assigned).");
        }
      }
    }

    if (order.status === "Cancelled") {
      const newFranchise = await User.findOne({
        where: { id: order.assignedFranchiseId },
      });
      const adminUsers = await User.findAll({ where: { role: "Admin" } });

      if (adminUsers.length > 0) {
        const adminEmails = adminUsers.map((user) => user.email);

        // Send email to admin users with 'admin' type
        OrderCancelledNotification(adminEmails, order, "Cancelled", "admin");

        // Send email to the franchise user with 'user' type
        OrderCancelledNotification(
          [newFranchise.email],
          order,
          "Cancelled",
          "user"
        );
      }
    }

    if (order.requestedShippingLabel) {
      const adminUsers = await User.findAll({ where: { role: "Admin" } });

      if (adminUsers.length > 0) {
        const adminEmails = adminUsers.map((user) => user.email);
        // Send email to admin users with 'admin' type
        RequestShippingLabelNotification(
          [...adminEmails, "ajithkumarvs86@gmail.com"],
          order,
          "requestedShippingLabel",
          "admin"
        );
      }
    }
  } catch (error) {
    console.error("Error sending franchise assignment notification:", error);
  }
});

module.exports = Order;
