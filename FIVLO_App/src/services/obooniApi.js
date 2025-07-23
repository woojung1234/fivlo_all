// src/services/obooniApi.js

import apiClient from './apiClient';

// 8-1. 상점 아이템 목록 (GET /api/shop/items)
export const getShopItems = async () => {
  const response = await apiClient.get('/shop/items'); // Postman 가이드에 따르면 /api/shop/items
  return response.data.items || []; // <-- 응답 구조에 맞춰 수정: response.data.items
};

// 8-2. 아이템 구매 (POST /api/customization/purchase)
export const purchaseItem = async (itemId) => { // quantity는 백엔드 명세에 없으므로 제거
  const response = await apiClient.post('/customization/purchase', { itemId }); // Postman 가이드에 따르면 /api/customization/purchase
  return response.data.data; // <-- 응답 구조에 맞춰 수정: response.data.data
};

// 8-3. 보유 아이템 조회 (GET /api/customization/inventory)
export const getOwnedItems = async () => {
  const response = await apiClient.get('/customization/inventory');
  return response.data.data.inventory.items || []; // <-- 응답 구조에 맞춰 수정: response.data.data.inventory.items
};

// 8-4. 아이템 착용 (POST /api/customization/equip)
export const equipItem = async (itemId) => {
  const response = await apiClient.post('/customization/equip', { itemId });
  return response.data.data; // <-- 응답 구조에 맞춰 수정: response.data.data
};

// 8-5. 아이템 착용 해제 (POST /api/customization/unequip)
export const unequipItem = async (category) => { // category를 받음
  const response = await apiClient.post('/customization/unequip', { category });
  return response.data.data; // <-- 응답 구조에 맞춰 수정: response.data.data
};

// 8-6. 현재 오분이 모습 조회 (GET /api/avatar) - Postman 가이드에는 /api/avatar
export const getObooniAvatar = async () => {
  const response = await apiClient.get('/avatar'); // Postman 가이드에 따르면 /api/avatar
  return response.data.avatar; // <-- 응답 구조에 맞춰 수정: response.data.avatar
};
