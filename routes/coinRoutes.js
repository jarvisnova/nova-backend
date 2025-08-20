import express from 'express';
import { deductCoins } from '../controllers/coinController.js';

const router = express.Router();

router.post('/deduct', deductCoins);

export default router;

