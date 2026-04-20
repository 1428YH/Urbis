import { Router } from "express";
import { moderation } from "../controllers/moderation.controller.js";

const router = Router()

router.post("/", moderation)

export default router