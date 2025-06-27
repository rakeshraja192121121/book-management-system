const errorHandler = (error, req, res, next) => {
  if (error) {
    if (error.message) {
      res.status(400).json({
        msg: "failed",
        error: error.message,
      });
    } else {
      res.status(400).json({
        msg: "failed",
        error: error,
      });
    }
  } else {
    next();
  }
};

module.exports = errorHandler;
