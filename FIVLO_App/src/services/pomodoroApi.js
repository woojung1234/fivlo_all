// src/services/pomodoroApi.js

import apiClient from './apiClient';

// 3-1. 포모도로 세션 생성 (POST /api/pomodoro/sessions)
export const createPomodoroSession = async (title, color, description = "") => {
  const response = await apiClient.post('/pomodoro/sessions', {
    title,
    color,
    description,
  });
  return response.data; // { id, title, ... } 형태를 예상
};

// 3-2. 포मो도로 세션 시작/일시정지 (PUT /api/pomodoro/sessions/SESSION_ID/start)
export const updatePomodoroSessionStatus = async (sessionId, action) => { // action: "start" 또는 "pause"
  const response = await apiClient.put(`/pomodoro/sessions/${sessionId}/start`, { action });
  return response.data; // { message, session } 형태를 예상
};

// 3-3. 포모도로 세션 완료 (PUT /api/pomodoro/sessions/SESSION_ID/complete)
export const completePomodoroSession = async (sessionId) => {
  const response = await apiClient.put(`/pomodoro/sessions/${sessionId}/complete`);
  return response.data; // { message, session } 형태를 예상
};

// 3-4. 포모도로 통계 조회 (GET /api/pomodoro/stats)
export const getPomodoroStats = async () => {
  const response = await apiClient.get('/pomodoro/stats');
  return response.data; // 통계 데이터 형태를 예상
};

// --- 새로 추가: 포모도로 목표(세션) 목록 조회 API ---
// Postman 가이드에 직접적인 목록 조회 API가 없으므로,
// 백엔드에서 /api/pomodoro/goals 또는 /api/pomodoro/sessions/list 와 같은 엔드포인트를 제공한다고 가정합니다.
// 여기서는 /api/pomodoro/sessions 엔드포인트에 GET 요청을 보내는 것으로 가정합니다.
export const getPomodoroGoals = async () => {
  const response = await apiClient.get('/pomodoro/sessions'); // 또는 '/pomodoro/goals'
  return response.data; // [{ id, title, color, ... }] 형태를 예상
};
