import mongoose from 'mongoose';
/**
 * Trims input values from user
 * @param {object} objectWithValuesToTrim - request body to trim
 * @returns {object} trimmedValues - trimmed values of the request object
 */
const trimValues = objectWithValuesToTrim => {
  const trimmedValues = objectWithValuesToTrim;
  Object.keys(trimmedValues).forEach(key => {
    trimmedValues[key] = trimmedValues[key].length
      ? trimmedValues[key].trim()
      : trimmedValues[key];
  });
  return trimmedValues;
};

/**
 * Defines the failed message returned when required fields are missing.
 * @param {object} res - Response object
 * @param {string} message - specific error message
 * @returns {res} - Response object
 */
const allFieldsRequired = (res, message) => {
  res.status(400).send({
    success: false,
    message: `Invalid request. '${message}' field is required`
  });
};

/**
 * Defines the failed message returned when required fields are missing.
 * @param {object} requestBody - HTTP request object
 * @returns {string} - Property of the request body object that is empty.
 */
const checkForEmptyFields = requestBody => {
  let result;
  Object.keys(requestBody).forEach(key => {
    if (!requestBody[key].length) result = key;
  });
  return result;
};

/**
 * class representing an handler's validation
 * @class Validate
 * @description Validation for user inputs in all requests
 */
class Validate {
  /**
   * @param {object} req - Request object
   * @param {object} res - Response object
   * @param {callback} next - The callback that passes the request to the next handler
   * @returns {object} res - Response object when query is invalid
   * @memberof Validate
   */
  static validateUserInput(req, res, next) {
    req.body = trimValues(req.body);
    const emptyField = checkForEmptyFields(req.body);
    if (emptyField) return allFieldsRequired(res, emptyField);
    next();
  }


  /**
   * @param {object} req - Request object
   * @param {object} res - Response object
   * @param {callback} next - The callback that passes the request to the next handler
   * @returns {object} res - Response object when query is invalid
   * @memberof Validate
   */
  static validateUserLogin(req, res, next) {
    req.body = trimValues(req.body);
    const { email, password } = req.body;
    if (!email) return allFieldsRequired(res, 'email');
    if (!password) return allFieldsRequired(res, 'password');
    next();
  }
}
export default Validate;

