// src/services/pomodoroApi.js

import apiClient from './apiClient';

// 3-1. 포모도로 세션 생성 (POST /api/pomodoro/sessions)
export const createPomodoroSession = async (title, color, description = "") => {
  const response = await apiClient.post('/pomodoro/sessions', {
    goal: title, // <-- 백엔드 goal 필드에 프론트엔드 title 전달
    color,
    description,
  });
  // 백엔드 라우터 응답: { success, message, session: { id, goal, color, ... } }
  // 프론트엔드에서 title로 사용하기 위해 goal을 title로 매핑하여 반환
  return {
    id: response.data.session.id,
    title: response.data.session.goal, // <-- goal을 title로 매핑
    color: response.data.session.color,
    // 필요한 다른 필드들도 여기에 포함
  };
};

// 3-2. 포모도로 세션 시작/일시정지 (PUT /api/pomodoro/sessions/SESSION_ID/start 또는 /pause)
export const updatePomodoroSessionStatus = async (sessionId, action) => { // action: "start" 또는 "pause"
  const response = await apiClient.put(`/pomodoro/sessions/${sessionId}/${action}`, {});
  // 백엔드 라우터 응답: { success, message, session: { id, status, ... } }
  return response.data.session;
};

// 3-3. 포모도로 세션 완료 (PUT /api/pomodoro/sessions/SESSION_ID/complete)
export const completePomodoroSession = async (sessionId) => {
  const response = await apiClient.put(`/pomodoro/sessions/${sessionId}/complete`);
  // 백엔드 라우터 응답: { success, message, coinEarned, cycleCompleted, totalFocusTime, session: { ... } }
  return response.data; // <-- response.data 전체를 반환 (coinEarned, cycleCompleted 등 포함)
};

// 3-4. 포모도로 통계 조회 (GET /api/pomodoro/stats)
export const getPomodoroStats = async (period = 'weekly', date = null) => {
  const response = await apiClient.get('/pomodoro/stats', { params: { period, date } });
  // 백엔드 라우터 응답: { success, period, date, stats: { ... } }
  return response.data.stats; // <-- response.data.stats만 반환
};

// 포모도로 목표(세션) 목록 조회 API (GET /api/pomodoro/sessions)
export const getPomodoroGoals = async () => {
  const response = await apiClient.get('/pomodoro/sessions');
  // 백엔드 라우터 응답: { sessions: [{ id, goal, color, ... }] }
  // 프론트엔드에서 title로 사용하기 위해 goal을 title로 매핑하여 반환
  return (response.data.sessions || []).map(session => ({
    id: session.id,
    title: session.goal, // <-- goal을 title로 매핑
    color: session.color,
    // 필요한 다른 필드들도 여기에 포함
  }));
};
