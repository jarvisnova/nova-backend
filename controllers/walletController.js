import Wallet from '../models/Wallet.js';

// Get wallet info
export const getWallet = async (req, res) => {
  const { userId } = req.params;
  try {
    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = await Wallet.create({ userId, coins: 0 });
    }
    res.status(200).json(wallet);
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
};

// Add coins (e.g. after Razorpay payment)
export const addCoins = async (req, res) => {
  const { userId, amount, reason } = req.body;
  try {
    const wallet = await Wallet.findOneAndUpdate(
      { userId },
      {
        $inc: { coins: amount },
        $push: {
          history: {
            type: 'credit',
            amount,
            reason,
          },
        },
      },
      { upsert: true, new: true }
    );
    res.status(200).json(wallet);
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
};

// Deduct coins
export const deductCoins = async (req, res) => {
  const { userId, amount, reason } = req.body;
  try {
    const wallet = await Wallet.findOne({ userId });
    if (!wallet || wallet.coins < amount) {
      return res.status(400).json({ error: 'Insufficient coins' });
    }

    wallet.coins -= amount;
    wallet.history.push({
      type: 'debit',
      amount,
      reason,
    });

    await wallet.save();
    res.status(200).json(wallet);
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
};

