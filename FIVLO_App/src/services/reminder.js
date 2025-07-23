// src/services/reminderApi.js

import apiClient from './apiClient';

// 5-1. 알림 목록 조회 (GET /api/reminders)
export const getReminders = async () => {
  const response = await apiClient.get('/reminders');
  return response.data.reminders || []; // <-- 응답 구조에 맞춰 수정: response.data.reminders
};

// 5-2, 5-3. 알림 생성 (POST /api/reminders)
export const createReminder = async (reminderData) => {
  const response = await apiClient.post('/reminders', reminderData);
  return response.data; // { id, title, ... } 형태를 예상 (백엔드 라우터가 직접 객체를 반환)
};

// 5-4. 알림 수정 (PATCH /api/reminders/REMINDER_ID)
export const updateReminder = async (reminderId, updateData) => {
  const response = await apiClient.patch(`/reminders/${reminderId}`, updateData);
  return response.data; // { id, title, ... } 형태를 예상 (백엔드 라우터가 직접 객체를 반환)
};

// 5-5. 알림 체크 (완료 처리) (PUT /api/reminders/REMINDER_ID/check)
export const checkReminder = async (reminderId) => {
  const response = await apiClient.put(`/reminders/${reminderId}/check`);
  return response.data; // { checked, allRemindersChecked, coinEarned } 형태를 예상
};

// 5-6. 알림 삭제 (DELETE /api/reminders/REMINDER_ID)
export const deleteReminder = async (reminderId) => {
  const response = await apiClient.delete(`/reminders/${reminderId}`);
  return response.data; // { message } 형태를 예상
};

// 5-7. 알림 통계 (GET /api/reminders/stats)
export const getReminderStats = async () => {
  const response = await apiClient.get('/reminders/stats');
  return response.data; // 통계 데이터 형태를 예상 (백엔드 라우터가 직접 객체를 반환)
};
