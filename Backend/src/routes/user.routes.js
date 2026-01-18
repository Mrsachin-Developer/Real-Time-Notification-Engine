import { Router } from "express";

import { signUp, login } from "../controllers/user.controllers.js";

const router = Router();

// Public routes
router.post("/signup", signUp);
router.post("/login", login);

export default router;
