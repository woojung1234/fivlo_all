// src/services/aiApi.js

import apiClient from './apiClient';

// 7-1. AI 목표 세분화 생성 (POST /api/ai/goals)
export const createAIGoal = async (goal, duration, hasDuration, startDate, endDate) => {
  const response = await apiClient.post('/ai/goals', {
    goal,
    duration,
    hasDuration,
    startDate,
    endDate,
  });
  return response.data;
};

// 7-2. AI 목표 수정 (PATCH /api/ai/goals/GOAL_ID)
export const updateAIGoal = async (goalId, updateData) => {
  const response = await apiClient.patch(`/ai/goals/${goalId}`, updateData);
  return response.data;
};

// 7-3. AI 목표를 Task에 추가 (POST /api/ai/goals/GOAL_ID/commit)
export const commitAIGoalToTask = async (goalId, repeatType, startDate) => {
  const response = await apiClient.post(`/ai/goals/${goalId}/commit`, {
    repeatType,
    startDate,
  });
  return response.data;
};

// 7-4. AI 일일 스케줄 생성 (POST /api/ai/schedule)
export const createAISchedule = async (date, preferences) => {
  const response = await apiClient.post('/ai/schedule', { date, preferences });
  return response.data;
};

// 7-5. AI 루틴 추천 (POST /api/ai/routine) - 경로 재확인!
export const getAIRoutineSuggestions = async (focusArea, timeAvailable, currentLevel) => {
  try {
    const response = await apiClient.post('/ai/routine', { // <-- 이 경로가 '/ai/routine'인지 다시 확인!
      focusArea,
      timeAvailable,
      currentLevel,
    });
    return response.data;
  } catch (error) {
    console.error("POST /api/ai/routine API 호출 실패 (404 예상):", error.response?.status, error.message);
    // 백엔드에 해당 API가 없거나 오류 발생 시 임시 Mock 데이터 반환
    return {
      recommendation: "샘플 루틴: 매일 30분 집중 학습, 주 3회 운동",
      routines: [ // TimeAttackScreen에서 routines 필드를 기대하므로 임시 추가
        { id: 'mock_ai_routine_1', name: '집중 학습', description: '매일 오전 9시 30분', estimatedTime: 30 },
        { id: 'mock_ai_routine_2', name: '가벼운 운동', description: '점심 식사 후 10분', estimatedTime: 10 },
        { id: 'mock_ai_routine_3', name: '독서 시간', description: '잠자기 전 20분', estimatedTime: 20 },
      ]
    };
  }
};

// 7-6. AI 동기부여 메시지 (POST /api/ai/motivation)
export const getAIMotivationMessage = async (context, goal, mood) => {
  const response = await apiClient.post('/ai/motivation', { context, goal, mood });
  return response.data;
};

// 7-7. AI 목표 진행률 분석 (GET /api/ai/goals/GOAL_ID/analysis)
export const getAIGoalAnalysis = async (goalId) => {
  const response = await apiClient.get(`/ai/goals/${goalId}/analysis`);
  return response.data;
};

// 7-8. AI 시스템 상태 확인 (GET /api/ai/health)
export const getAIHealthStatus = async () => {
  const response = await apiClient.get('/ai/health');
  return response.data;
};
