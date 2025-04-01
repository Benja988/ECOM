import cors from "cors";

export const corsOptions = cors({
  origin: ["http://localhost:3000", "https://yourdomain.com"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
});