import { Router } from "express";
import {
  createQuiz,
  getQuizById,
  getSampleQuestion,
  listQuizzes,
} from "../controllers/quizz.controller";

const router = Router();

router.get("/", listQuizzes);
router.post("/", createQuiz);
router.get("/sample-question", getSampleQuestion);
router.get("/:id", getQuizById);

export default router;
