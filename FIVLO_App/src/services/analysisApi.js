// src/services/analysisApi.js

import apiClient from './apiClient';

// 6-1. 일간 분석 (GET /api/analytics/daily?date=YYYY-MM-DD)
export const getDailyAnalysis = async (date) => {
  const response = await apiClient.get(`/analytics/daily?date=${date}`);
  return response.data; // 백엔드 라우터가 직접 분석 객체를 반환하므로 .data.data 제거
};

// 6-2. 주간 분석 (GET /api/analytics/weekly?week=YYYY-WNN)
export const getWeeklyAnalysis = async (week) => {
  const response = await apiClient.get(`/analytics/weekly?week=${week}`);
  return response.data; // 백엔드 라우터가 직접 분석 객체를 반환하므로 .data.data 제거
};

// 6-3. 월간 분석 (GET /api/analytics/monthly?year=YYYY&month=MM)
export const getMonthlyAnalysis = async (year, month) => {
  const response = await apiClient.get(`/analytics/monthly?year=${year}&month=${month}`);
  return response.data; // 백엔드 라우터가 직접 분석 객체를 반환하므로 .data.data 제거
};

// 6-4. D-Day 목표 분석 (GET /api/analytics/dday?goalId=GOAL_ID) - Premium 전용
export const getDDayAnalysis = async (goalId) => {
  const response = await apiClient.get(`/analytics/dday?goalId=${goalId}`);
  return response.data.goals || []; // <-- 백엔드 라우터가 { goals: [...] }를 반환하므로 .data.goals
};

// 6-5. 세션 로그 조회 (GET /api/analytics/sessions?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD)
export const getSessionLogs = async (startDate, endDate) => {
  const response = await apiClient.get(`/analytics/sessions?startDate=${startDate}&endDate=${endDate}`);
  return response.data.sessions || []; // <-- 백엔드 라우터가 { sessions: [...] }를 반환하므로 .data.sessions
};

// 6-6. AI 루틴 제안 (GET /api/analytics/insights)
export const getAIInsights = async () => {
  const response = await apiClient.get('/analytics/insights');
  return response.data; // 백엔드 라우터가 { aiRecommendation: {...}, insights: [...] }를 반환하므로 .data 전체
};
