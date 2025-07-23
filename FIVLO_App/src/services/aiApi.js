// src/services/aiApi.js

import apiClient from './apiClient';

// 7-1. AI 목표 세분화 생성 (POST /api/ai/goals)
export const createAIGoal = async (goal, duration, hasDuration, startDate, endDate) => {
  const response = await apiClient.post('/ai/goals', {
    goal,
    duration, // 예: "3개월"
    hasDuration,
    startDate, // YYYY-MM-DD
    endDate, // YYYY-MM-DD
  });
  return response.data; // { id, goal, duration, weeklyPlans: [{ week, tasks }], ... } 형태를 예상
};

// 7-2. AI 목표 수정 (PATCH /api/ai/goals/GOAL_ID)
export const updateAIGoal = async (goalId, updateData) => {
  const response = await apiClient.patch(`/ai/goals/${goalId}`, updateData);
  return response.data; // { message, goal } 형태를 예상
};

// 7-3. AI 목표를 Task에 추가 (POST /api/ai/goals/GOAL_ID/commit)
export const commitAIGoalToTask = async (goalId, repeatType, startDate) => {
  const response = await apiClient.post(`/ai/goals/${goalId}/commit`, {
    repeatType, // "daily", "weekly", "monthly"
    startDate, // YYYY-MM-DD
  });
  return response.data; // { message, tasksCreatedCount } 형태를 예상
};

// 7-4. AI 일일 스케줄 생성 (POST /api/ai/schedule)
export const createAISchedule = async (date, preferences) => {
  const response = await apiClient.post('/ai/schedule', { date, preferences });
  return response.data;
};

// 7-5. AI 루틴 추천 (POST /api/ai/routine)
export const getAIRoutineSuggestions = async (focusArea, timeAvailable, currentLevel) => {
  const response = await apiClient.post('/ai/ai/routine', {
    focusArea,
    timeAvailable,
    currentLevel,
  });
  return response.data; // { routines: [{ name, description }] } 형태를 예상
};

// 7-6. AI 동기부여 메시지 (POST /api/ai/motivation)
export const getAIMotivationMessage = async (context, goal, mood) => {
  const response = await apiClient.post('/ai/motivation', { context, goal, mood });
  return response.data; // { message: "..." } 형태를 예상
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
