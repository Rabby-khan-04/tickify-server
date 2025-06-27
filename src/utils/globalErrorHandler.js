import status from "http-status";

const globalErrorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || status.INTERNAL_SERVER_ERROR;
  const message = err.message || "Internal Server Error";

  console.error(`🔥ERROR: ${err}`);

  res
    .status(statusCode)
    .json({
      status: statusCode,
      success: false,
      message,
      errors: err.errors || [],
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
};

export default globalErrorHandler;
