import Coin from '../models/coinModel.js';

export const deductCoins = async (req, res) => {
  try {
    const { userId, amount } = req.body;

    if (!userId || !amount) {
      return res.status(400).json({ success: false, message: "Missing userId or amount" });
    }

    const userWallet = await Coin.findOne({ userId });

    if (!userWallet || userWallet.coins < amount) {
      return res.status(400).json({ success: false, message: "Insufficient coins" });
    }

    userWallet.coins -= amount;
    await userWallet.save();

    return res.status(200).json({
      success: true,
      message: `Coins deducted: ${amount}`,
      remainingCoins: userWallet.coins,
    });
  } catch (err) {
    console.error("Deduction error:", err);
    res.status(500).json({ success: false, message: "Server error during deduction" });
  }
};

