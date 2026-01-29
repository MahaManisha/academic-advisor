// server/src/middlewares/error.middleware.js
const errorMiddleware = (err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || "Server Error",
  });
};

export default errorMiddleware;
