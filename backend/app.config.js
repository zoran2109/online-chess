export const portNumber =
  process.env.NODE_ENV === "production" ? process.env.PORT : 8080;

export const frontendUrl =
  process.env.NODE_ENV === "production"
    ? process.env.FRONTEND_URL
    : "http://localhost:3000";
