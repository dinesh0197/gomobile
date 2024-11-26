const nodemailer = require("nodemailer");

exports.sendEmail = async (toAddress, data, subject) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "perumal.tradezap@gmail.com", // Your Gmail address
      pass: "oscs tngb wpcl sbcw", // Your Gmail password or application-specific password
    },
  });
  const mailOptions = {
    from: "m.chithirai3597@gmail.com", // Sender address
    to: toAddress, // List of recipients
    subject: subject, // Subject line
    text: data, // Plain text body
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
};

exports.sendWelcomeEmail = async (user, token) => {
  const emailName =
    user.firstName.charAt(0).toUpperCase() + user.firstName.slice(1);
  const subject = "Request is Approved!";
  let isFlag = "NEW";
  let body;
  if (user.role === "PMU" || user.role === "PMH" || user.role === "AMU") {
    body = `Please use this temporary password to Login.\nYour Password is  ${token} `;
  } else {
    body = `Please use this ${process.env.FRONTEND_URL}/${token} to set your password`;
  }
  return this.sendEmail([user.email], body, subject);
};

exports.passwordUpdated = async (user) => {
  const emailName = user.legal_name;
  const subject = "Password is Updated";
  const body = `Your password has been updated successfully`;
  return this.sendEmail([user.email], body, subject);
};

exports.sendVisitorWelcomeEmail = async (user, token) => {
  const fullName = user.legal_name;
  const emailUsername = user.email;
  const subject = "Visitor Request is Approved!";
  let body = `Hello ${fullName},\n\nPlease use this temporary password to login.\n\nYour username is ${emailUsername}\nYour Password is ${token}.`;

  return this.sendEmail([user.email], body, subject);
};

exports.sendForgotPasswordEmail = async (user, token) => {
  const fullName = user.legal_name;
  const emailUsername = user.email;
  const subject = "Forgot Password Request is Updated!";
  let body = `Hello ${fullName},\n\nPlease use this temporary password to login.\nYour Password is ${token}.\n\nYour username is ${emailUsername}`;

  return this.sendEmail([user.email], body, subject);
};

exports.NewOrderCreatedNotification = async (email, order) => {
  const subject = `New Order Created: ${order.internalOrderId}`;
  let body = `A new order has been created.\n\nOrder Details:\nID: ${order.internalOrderId}\nCustomer Order Number: ${order.customerOrderNumber}\nOrder Total: ${order.orderTotal}\nStatus: ${order.status}\n\nPlease log in to the system for more details.`;

  return this.sendEmail([email], body, subject);
};

exports.OrderAssignedNotification = (email, order, action) => {
  const subject = `Order Assigned: ${order.internalOrderId}`;
  const body = `A new order has been assigned to your franchise.\n\nOrder Details:\nID: ${order.internalOrderId}\nCustomer Order Number: ${order.customerOrderNumber}\nOrder Total: ${order.orderTotal}\nStatus: ${order.status}\n\nPlease log in to the system for more details.`;
  return this.sendEmail([email], body, subject);
};

exports.OrderCancelledNotification = (emails, order, action, recipientType) => {
  let subject = `Order Cancelled: ${order.internalOrderId}`;
  let body = "";

  if (recipientType === "admin") {
    body = `
      Dear Admin,

      The following order has been cancelled.

      Order Details:
      - Order ID: ${order.internalOrderId}
      - Customer Order Number: ${order.customerOrderNumber}
      - Order Total: ${order.orderTotal}
      - Status: ${order.status}

      Please check the system for more details.

      Best regards,
      [Your Company Name]
    `;
  } else if (recipientType === "user") {
    body = `
      Dear Customer,

      We regret to inform you that your order has been cancelled.

      Order Details:
      - Order ID: ${order.internalOrderId}
      - Customer Order Number: ${order.customerOrderNumber}
      - Order Total: ${order.orderTotal}
      - Status: ${order.status}

      If you believe this cancellation was made in error, please contact our support team.

      Thank you for your understanding.

      Best regards,
      [Your Company Name]
    `;
  }

  // Send email to the given emails
  emails.forEach((email) => {
    this.sendEmail(email, body, subject);
  });
};

exports.UploadShippingLabelNotification = (email, order, filename) => {
  const subject = `Shipping Label Updated: ${order.internalOrderId}`;
  const body = `The shipping label for your order has been updated.\n\nOrder Details:\n
      ID: ${order.internalOrderId}\n
      Customer Order Number: ${order.customerOrderNumber}\n
      Order Total: ${order.orderTotal}\n
      Status: ${order.status}\n\n
      Shipping Label:\n
      filename: ${filename}\n\n
      Please log in to the system to view or download the shipping label.`;

  return this.sendEmail(email, body, subject);
};

exports.RequestShippingLabelNotification = (emails, order) => {
  const subject = `Request for Shipping Label: ${order.internalOrderId}`;

  // Admin email body
  const adminBody = `
    Hello,

    A request for a shipping label has been made for the following order:

    Order ID: ${order.internalOrderId}
    Customer Order Number: ${order.customerOrderNumber}
    Order Total: ${order.orderTotal}
    Status: ${order.status}

    Please review the request and take necessary action to generate or provide the shipping label.

    Best regards,
    [Your Company Name]
  `;
};
