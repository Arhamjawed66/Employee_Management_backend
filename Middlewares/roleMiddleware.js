
import ErrorResponse from "../Utils/errorResponse.js";

const authorize = (...roles) => {
  return (req, res, next) => {
    if (req.user.role !== 'Admin' && (!req.user.category || !roles.includes(req.user.category))) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};

export { authorize };
