// src/services/pomodoroApi.js

import apiClient from './apiClient';

// 3-1. 포모도로 세션 생성 (POST /api/pomodoro/sessions)
export const createPomodoroSession = async (title, color, description = "") => {
  const response = await apiClient.post('/pomodoro/sessions', {
    goal: title,
    color,
    description,
  });
  return {
    id: response.data.session.id,
    title: response.data.session.goal,
    color: response.data.session.color,
  };
};

// 3-2. 포모도로 세션 시작/일시정지 (PUT /api/pomodoro/sessions/SESSION_ID/start 또는 /pause)
export const updatePomodoroSessionStatus = async (sessionId, action) => {
  const response = await apiClient.put(`/pomodoro/sessions/${sessionId}/${action}`, {});
  return response.data.session;
};

// 3-3. 포모도로 세션 완료 (PUT /api/pomodoro/sessions/SESSION_ID/complete)
export const completePomodoroSession = async (sessionId, actualDuration = null) => { // <-- actualDuration 파라미터 추가
  const response = await apiClient.put(`/pomodoro/sessions/${sessionId}/complete`, { actualDuration }); // <-- actualDuration 전달
  return response.data;
};

// 3-4. 포모도로 통계 조회 (GET /api/pomodoro/stats)
export const getPomodoroStats = async (period = 'weekly', date = null) => {
  const response = await apiClient.get('/pomodoro/stats', { params: { period, date } });
  return response.data.stats;
};

// 포모도로 목표(세션) 목록 조회 API (GET /api/pomodoro/sessions)
export const getPomodoroGoals = async () => {
  try {
    const response = await apiClient.get('/pomodoro/sessions');
    return (response.data.sessions || []).map(session => ({
      id: session.id,
      title: session.goal,
      color: session.color,
    }));
  } catch (error) {
    console.error("GET /api/pomodoro/sessions API 호출 실패 (404 예상):", error.response?.status, error.message);
    // 백엔드에 해당 GET 엔드포인트가 없으므로 임시 Mock 데이터 반환
    return [
      { id: 'mock_goal_study', title: '샘플 목표: 공부하기', color: '#FFD1DC' },
      { id: 'mock_goal_exercise', title: '샘플 목표: 운동하기', color: '#FFABAB' },
      { id: 'mock_goal_read', title: '샘플 목표: 독서하기', color: '#FFC3A0' },
    ];
  }
};
