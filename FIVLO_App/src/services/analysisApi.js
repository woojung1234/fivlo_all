// src/services/analysisApi.js

import apiClient from './apiClient';

// 6-1. 일간 분석 (GET /api/analytics/daily?date=YYYY-MM-DD)
export const getDailyAnalysis = async (date) => {
  const response = await apiClient.get(`/analytics/daily?date=${date}`);
  return response.data;
};

// 6-2. 주간 분석 (GET /api/analytics/weekly?week=YYYY-WNN)
// week 파라미터는 'YYYY-WNN' 형식 (예: 2025-W30)
export const getWeeklyAnalysis = async (week) => {
  const response = await apiClient.get(`/analytics/weekly?week=${week}`);
  return response.data;
};

// 6-3. 월간 분석 (GET /api/analytics/monthly?year=YYYY&month=MM)
export const getMonthlyAnalysis = async (year, month) => {
  const response = await apiClient.get(`/analytics/monthly?year=${year}&month=${month}`);
  return response.data;
};

// 6-4. D-Day 목표 분석 (GET /api/analytics/dday?goalId=GOAL_ID) - Premium 전용
export const getDDayAnalysis = async (goalId) => {
  const response = await apiClient.get(`/analytics/dday?goalId=${goalId}`);
  return response.data;
};

// 6-5. 세션 로그 조회 (GET /api/analytics/sessions?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD)
export const getSessionLogs = async (startDate, endDate) => {
  const response = await apiClient.get(`/analytics/sessions?startDate=${startDate}&endDate=${endDate}`);
  return response.data;
};

// 6-6. AI 루틴 제안 (GET /api/analytics/insights)
export const getAIInsights = async () => {
  const response = await apiClient.get('/analytics/insights');
  return response.data;
};
