import jwt from "jsonwebtoken";

export const generateToken = (name, email, phone, id, role) => {
  return jwt.sign({ name, email, phone, id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};
