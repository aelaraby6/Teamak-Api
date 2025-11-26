import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { corsOptions } from "./config/corsOptions.js";
import globalErrorHandler from "./middlewares/global_error_handler.middleware.js";
import { ApiRouter } from "./routers/index.js";
import { notFoundMiddleware } from "./middlewares/not_found.middleware.js";
import { swaggerUi, swaggerSpec } from "./utils/swagger.js";

const app = express();

// Middlewares
app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to Teamak Api....",
    status: "success",
    version: "1.0.0",
    endpoints: {
      "/": "GET - Welcome message",
    },
  });
});

app.use("/api", ApiRouter);

// 404 Not Found Middleware
app.use(notFoundMiddleware);

// Global Error Handler
app.use(globalErrorHandler);

export default app;
