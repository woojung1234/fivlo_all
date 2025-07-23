// src/services/authApi.js

import apiClient from './apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 1-1. 회원가입 (POST /api/auth/register)
// 'name' 대신 'profileName' 사용, 'userType' 파라미터 추가
export const register = async (profileName, email, password, userType) => {
  const response = await apiClient.post('/auth/register', { profileName, email, password, userType });
  if (response.data.token) {
    await AsyncStorage.setItem('userToken', response.data.token);
  }
  return response.data;
};

// 1-2. 로그인 (POST /api/auth/login)
export const login = async (email, password) => {
  const response = await apiClient.post('/auth/login', { email, password });
  if (response.data.token) {
    await AsyncStorage.setItem('userToken', response.data.token);
  }
  return response.data;
};

// 1-3. 구독 정보 조회 (GET /api/users/me/subscription)
export const getSubscriptionStatus = async () => {
  const response = await apiClient.get('/users/me/subscription');
  return response.data;
};

// 1-4. 토큰 갱신 (POST /api/auth/refresh)
export const refreshAuthToken = async () => {
  const token = await AsyncStorage.getItem('userToken'); // 현재 액세스 토큰
  // API 명세에 따르면 refresh endpoint는 리프레시 토큰을 받습니다.
  // 이 API 호출은 액세스 토큰이 만료되었을 때 리프레시 토큰으로 새 토큰 쌍을 받는 데 사용됩니다.
  // 여기서는 편의상 현재 가진 토큰을 보내지만, 실제로는 리프레시 토큰을 따로 관리해야 합니다.
  // (Postman 가이드의 refresh 요청 body를 참고하여 리프레시 토큰을 body에 담아 보내는 것이 더 정확합니다.)
  // await apiClient.post('/auth/refresh', { refreshToken: 'YOUR_REFRESH_TOKEN_HERE' });
  
  // 현재는 Postman 가이드와 프론트 구현이 1:1 매칭되지 않으므로, 이 함수는 사용하지 않도록 권장
  // 또는 백엔드 refresh 엔드포인트가 단순히 'Authorization: Bearer AccessToken'으로 AccessToken 유효성을
  // 검증하고 새 토큰을 준다고 가정 (일반적이지 않음)
  const response = await apiClient.post('/auth/refresh');
  if (response.data.token) {
    await AsyncStorage.setItem('userToken', response.data.token);
  }
  return response.data;
};

// 1-5. 로그아웃 (POST /api/auth/logout)
export const logout = async () => {
  try {
    // API 명세에 따르면 logout endpoint는 refreshToken을 body로 받습니다.
    // await apiClient.post('/auth/logout', { refreshToken: 'YOUR_REFRESH_TOKEN_HERE' });
    await apiClient.post('/auth/logout'); // 현재 프론트엔드에서는 refreshToken을 보내지 않음
  } catch (error) {
    console.warn("Backend logout failed, but clearing local token anyway:", error);
  }
  await AsyncStorage.removeItem('userToken');
};
