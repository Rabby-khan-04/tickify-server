export const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  path: "/",
};

export const AllowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://tickify-client-next.vercel.app",
];
