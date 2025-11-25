import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "PharmaXpress API",
      version: "1.0.0",
      description: "API documentation for PharmaXpress project",
    },
    servers: [
      {
        url: "http://localhost:4000",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./docs/**/*.js"], 

}


const swaggerSpec = swaggerJsdoc(options);

export { swaggerUi, swaggerSpec };
