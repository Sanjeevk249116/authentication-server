class ApiError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.success = false;
    this.timestamp = new Date().toISOString();
  }
}

module.exports = { ApiError };