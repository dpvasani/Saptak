const { body, param, query, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: errors.array()
    });
  }
  next();
};

const validateSearch = [
  query('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters')
    .trim(),
  query('useAI')
    .optional()
    .isBoolean()
    .withMessage('useAI must be a boolean'),
  query('aiProvider')
    .optional()
    .isIn(['openai', 'gemini'])
    .withMessage('aiProvider must be either openai or gemini'),
  handleValidationErrors
];

const validateId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  handleValidationErrors
];

const validateArtistUpdate = [
  body('name.value')
    .optional()
    .isLength({ min: 1, max: 200 })
    .withMessage('Name must be between 1 and 200 characters')
    .trim(),
  body('guru.value')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Guru name must be less than 200 characters')
    .trim(),
  body('gharana.value')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Gharana name must be less than 200 characters')
    .trim(),
  handleValidationErrors
];

const validateRaagUpdate = [
  body('name.value')
    .optional()
    .isLength({ min: 1, max: 200 })
    .withMessage('Name must be between 1 and 200 characters')
    .trim(),
  body('aroha.value')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Aroha must be less than 500 characters')
    .trim(),
  body('avroha.value')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Avroha must be less than 500 characters')
    .trim(),
  handleValidationErrors
];

const validateTaalUpdate = [
  body('name.value')
    .optional()
    .isLength({ min: 1, max: 200 })
    .withMessage('Name must be between 1 and 200 characters')
    .trim(),
  body('numberOfBeats.value')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Number of beats must be between 1 and 100'),
  handleValidationErrors
];

module.exports = {
  validateSearch,
  validateId,
  validateArtistUpdate,
  validateRaagUpdate,
  validateTaalUpdate,
  handleValidationErrors
};