// src/services/reminderApi.js

import apiClient from './apiClient';

// 5-1. 알림 목록 조회 (GET /api/reminders)
export const getReminders = async () => {
  const response = await apiClient.get('/reminders');
  return response.data; // [{ id, title, time, location, days, checklist, ... }] 형태를 예상
};

// 5-2, 5-3. 알림 생성 (POST /api/reminders)
// Postman 가이드에 따라 시간만 있는 알림과 장소 포함 알림을 통합
export const createReminder = async (reminderData) => {
  const response = await apiClient.post('/reminders', reminderData);
  return response.data; // { id, title, ... } 형태를 예상
};

// 5-4. 알림 수정 (PATCH /api/reminders/REMINDER_ID)
export const updateReminder = async (reminderId, updateData) => {
  const response = await apiClient.patch(`/reminders/${reminderId}`, updateData);
  return response.data; // { message, reminder } 형태를 예상
};

// 5-5. 알림 체크 (완료 처리) (PUT /api/reminders/REMINDER_ID/check)
export const checkReminder = async (reminderId) => {
  const response = await apiClient.put(`/reminders/${reminderId}/check`);
  return response.data; // { message, reminder } 형태를 예상
};

// 5-6. 알림 삭제 (DELETE /api/reminders/REMINDER_ID)
export const deleteReminder = async (reminderId) => {
  const response = await apiClient.delete(`/reminders/${reminderId}`);
  return response.data; // { message } 형태를 예상
};

// 5-7. 알림 통계 (GET /api/reminders/stats)
export const getReminderStats = async () => {
  const response = await apiClient.get('/reminders/stats');
  return response.data; // 통계 데이터 형태를 예상
};
