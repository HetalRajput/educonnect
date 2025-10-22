const Joi = require('joi');

const registerValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email',
      'any.required': 'Email is required',
      'string.empty': 'Email is required'
    }),
    organizationName: Joi.string().min(2).max(100).required().messages({
      'string.min': 'Organization name must be at least 2 characters long',
      'string.max': 'Organization name cannot exceed 100 characters',
      'any.required': 'Organization name is required',
      'string.empty': 'Organization name is required'
    }),
    type: Joi.string().valid('school', 'college').required().messages({
      'any.only': 'Type must be either school or college',
      'any.required': 'Type is required'
    }),
    session: Joi.string().min(2).max(50).required().messages({
      'string.min': 'Session must be at least 2 characters long',
      'string.max': 'Session cannot exceed 50 characters',
      'any.required': 'Session is required',
      'string.empty': 'Session is required'
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Password must be at least 6 characters long',
      'any.required': 'Password is required',
      'string.empty': 'Password is required'
    })
  });

  return schema.validate(data);
};

module.exports = {
  registerValidation
};