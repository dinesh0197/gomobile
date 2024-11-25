const {body} = require("express-validator")
const validate = require('../validate')

module.exports.validateMaintenance = validate([
    body('type').optional().notEmpty().withMessage('Maintenance type cannot be empty'),
    body('job_type_id').optional().notEmpty().withMessage('Job type id cannot be empty'),
    body('area_type_id').optional().notEmpty().withMessage('Area id cannot be empty'),
    body('issue').optional().notEmpty().withMessage('unit id cannot be empty'),
    body('timings').optional().notEmpty().withMessage('expense type id cannot be empty'),
    body('status').optional().notEmpty().withMessage('Description cannot be empty'),
    body('priority').optional().notEmpty().withMessage('Responsibility cannot be empty'),
    body('no_of_people').optional().notEmpty().withMessage('Amount cannot be empty'),
    body('assign_to').optional().notEmpty().withMessage('Amount cannot be empty'),
])
