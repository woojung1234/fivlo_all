// src/services/timeAttackApi.js

import apiClient from './apiClient';

// 3-5. 타임어택 세션 생성 (POST /api/time-attack/sessions)
export const createTimeAttackSession = async (title, totalDuration, steps) => {
  const response = await apiClient.post('/time-attack/sessions', {
    title,
    totalDuration,
    steps,
  });
  return response.data.session; // <-- 응답 구조에 맞춰 수정: response.data.session
};

// 3-2. 타임어택 세션 시작/일시정지 (PUT /api/time-attack/sessions/SESSION_ID/start 또는 /pause)
export const updateTimeAttackSessionStatus = async (sessionId, action) => { // action: "start" 또는 "pause"
  const response = await apiClient.put(`/time-attack/sessions/${sessionId}/${action}`, {}); // <-- action을 URL 경로로 사용
  return response.data.session; // <-- 응답 구조에 맞춰 수정: response.data.session
};

// 3-3. 타임어택 세션 완료 (PUT /api/time-attack/sessions/SESSION_ID/complete)
export const completeTimeAttackSession = async (sessionId) => {
  const response = await apiClient.put(`/time-attack/sessions/${sessionId}/complete`);
  return response.data; // <-- 응답 구조에 맞춰 수정: response.data (백엔드 라우터가 직접 객체를 반환)
};

// Postman 가이드에 없지만, 타임어택 통계 조회 API도 필요할 수 있음
// export const getTimeAttackStats = async () => {
//   const response = await apiClient.get('/time-attack/stats');
//   return response.data;
// };
