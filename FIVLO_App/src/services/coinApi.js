// src/services/coinApi.js

import apiClient from './apiClient';

// 2-1. 코인 잔액 조회 (GET /api/coins)
export const getCoinBalance = async () => {
  const response = await apiClient.get('/coins');
  return response.data; // { balance: number } 형태를 예상
};

// 2-2. 코인 거래 내역 (GET /api/coins/transactions)
export const getCoinTransactions = async () => {
  const response = await apiClient.get('/coins/transactions');
  return response.data; // [{ id, type, amount, source, description, date }] 형태를 예상
};

// 2-3. 코인 적립 (POST /api/coins/earn) - 테스트용
export const earnCoin = async (source, amount, description) => {
  const response = await apiClient.post('/coins/earn', { source, amount, description });
  return response.data; // { message, newBalance } 형태를 예상
};

// 2-4. 코인 사용 (POST /api/coins/spend) - 상점 구매용
export const spendCoin = async (amount, purpose, description) => {
  const response = await apiClient.post('/coins/spend', { amount, purpose, description });
  return response.data; // { message, newBalance } 형태를 예상
};
