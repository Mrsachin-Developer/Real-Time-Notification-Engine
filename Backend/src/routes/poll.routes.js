import { Router } from "express";
import checkPoint from "../middlewares/checkpoint.midddleware.js";
import {
  createPoll,
  getResult,
  votePoll,
} from "../controllers/poll.controller.js";

const router = Router();

router.post("/", checkPoint, createPoll);
router.post("/:pollId/vote", checkPoint, votePoll);
router.get("/:pollId/results", getResult);

export default router;
