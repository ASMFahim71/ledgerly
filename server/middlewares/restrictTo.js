const ErrorStack = require("../helpers/appError")

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ErrorStack('You do not have permission to perform this action', 403));
    }

    next();
  };
};