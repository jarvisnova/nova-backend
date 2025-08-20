import express from "express";
import { handleWebhook } from "../controllers/paymentController.js";

const router = express.Router();

router.post(
  "/razorpay/webhook",
  express.raw({ type: "application/json" }),
  handleWebhook
);

export default router;

