import React from 'react';

const RechargeModal = () => {
  const handleRecharge = () => {
    const options = {
      key: 'rzp_test_4PDGCrtvdeXlYQ', // 🧪 Razorpay Test Key
      amount: 5000, // ₹50 in paise
      currency: 'INR',
      name: 'NOVA AI',
      description: 'Recharge Wallet',
      handler: function (response) {
        // ✅ Recharge success: call backend to add coins
        fetch('https://api.jarvishai.com/api/wallet/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: '123', // 👈 Update with real user ID from frontend context
            amount: 100,   // 👈 100 coins
            reason: 'Recharge ₹50',
          }),
        })
          .then(res => res.json())
          .then(data => {
            alert('Recharge successful! Coins added.');
          })
          .catch(err => {
            console.error(err);
            alert('Recharge done but failed to update wallet.');
          });
      },
      prefill: {
        name: 'Demo User',
        email: 'demo@example.com',
        contact: '9999999999',
      },
      theme: {
        color: '#3399cc

