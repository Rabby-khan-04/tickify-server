export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
};

export const AllowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
];
