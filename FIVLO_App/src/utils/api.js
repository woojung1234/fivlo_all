// src/services/authApi.js (예시)
import axios from 'axios';

const API_BASE_URL = 'http://YOUR_BACKEND_SERVER_IP:YOUR_BACKEND_PORT'; // 백엔드 개발 서버 IP 주소와 포트로 변경하세요.

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const signUpWithEmail = async (email, password, purpose) => {
  const response = await apiClient.post('/users/signup', { email, password, purpose });
  return response.data;
};

export const loginWithEmail = async (email, password) => {
  const response = await apiClient.post('/users/login', { email, password });
  return response.data;
};

// 사용자 목적 저장 및 조회 (REQ-BE-USER-002)
export const saveUserPurpose = async (userId, purpose) => {
  const response = await apiClient.post(`/users/${userId}/purpose`, { purpose });
  return response.data;
};

export const getUserPurpose = async (userId) => {
  const response = await apiClient.get(`/users/${userId}/purpose`);
  return response.data;
};

// 다른 API들도 여기에 추가...
// 루틴 관리 API (REQ-BE-ROUTINE-001)
export const createRoutine = async (routineData) => {
  const response = await apiClient.post('/routines', routineData);
  return response.data;
};

export const getRoutinesByDate = async (date) => {
  const response = await apiClient.get(`/routines?date=${date}`);
  return response.data;
};

// AI 목표 세분화 API (REQ-BE-AI-001)
export const getAiSuggestions = async (goal) => {
  const response = await apiClient.post('/ai/suggest-plans', { goal });
  return response.data;
};

// ... 등 백엔드 요구사항에 맞춰 API 함수들을 정의합니다.
