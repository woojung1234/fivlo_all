// src/services/obooniApi.js

import apiClient from './apiClient';

// 8-1. 상점 아이템 목록 (GET /api/shop/items)
export const getShopItems = async () => {
  const response = await apiClient.get('/shop/items');
  return response.data; // [{ id, name, type, image, price }] 형태를 예상
};

// 8-2. 아이템 구매 (POST /api/shop/purchase)
export const purchaseItem = async (itemId, quantity) => {
  const response = await apiClient.post('/shop/purchase', { itemId, quantity });
  return response.data; // { message, newBalance, purchasedItem } 형태를 예상
};

// 8-3. 보유 아이템 조회 (GET /api/customization/inventory)
export const getOwnedItems = async () => {
  const response = await apiClient.get('/customization/inventory');
  // API 명세에 따라 { items: [{ itemId, quantity }] } 형태를 예상하며,
  // 프론트엔드에서 이미지 등을 매핑하기 위해 itemId만 가져옵니다.
  return response.data.items || [];
};

// 8-4. 아이템 착용 (POST /api/inventory/equip)
export const equipItem = async (itemId) => {
  const response = await apiClient.post('/inventory/equip', { itemId });
  return response.data; // { message, equippedItems } 형태를 예상
};

// 8-5. 아이템 착용 해제 (POST /api/inventory/unequip)
export const unequipItem = async (itemType) => { // itemType: "top", "bottom", "accessory"
  const response = await apiClient.post('/inventory/unequip', { itemType });
  return response.data; // { message, equippedItems } 형태를 예상
};

// 8-6. 현재 오분이 모습 조회 (GET /api/avatar) - 현재 착용 아이템 정보
export const getObooniAvatar = async () => {
  const response = await apiClient.get('/avatar');
  return response.data; // { equippedItems: { top, bottom, accessory } } 형태를 예상
};
