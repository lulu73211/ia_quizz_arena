import { Router } from "express";
import healthRoutes from "./health.routes";
import quizzRoutes from "./quizz.routes";
import userRoutes from "./users.routes";

const router = Router();

// Mount routes
router.use("/", healthRoutes);
router.use("/quizz", quizzRoutes);
router.use("/users", userRoutes);

export default router;
