// src/services/taskApi.js

import apiClient from './apiClient';

// --- Task API ---

// 4-1. Task 목록 조회 (날짜별)
// GET /api/tasks?date=YYYY-MM-DD
export const getTasksByDate = async (date) => {
  const response = await apiClient.get(`/tasks?date=${date}`);
  return response.data;
};

// 4-2. Task 생성 (POST /api/tasks)
export const createTask = async (taskData) => {
  const response = await apiClient.post('/tasks', taskData);
  return response.data;
};

// 4-3. Task 수정 (PATCH /api/tasks/TASK_ID)
export const updateTask = async (taskId, taskData) => {
  const response = await apiClient.patch(`/tasks/${taskId}`, taskData);
  return response.data;
};

// 4-4. Task 완료 처리 (PUT /api/tasks/TASK_ID/complete)
export const completeTask = async (taskId) => {
  const response = await apiClient.put(`/tasks/${taskId}/complete`);
  return response.data;
};

// 4-5. Task 삭제 (DELETE /api/tasks/TASK_ID)
export const deleteTask = async (taskId) => {
  const response = await apiClient.delete(`/tasks/${taskId}`);
  return response.data;
};

// --- 카테고리 API ---

// 4-6. 카테고리 목록 조회 (GET /api/categories)
export const getCategories = async () => {
  const response = await apiClient.get('/categories');
  return response.data;
};

// 4-7. 카테고리 생성 (POST /api/categories)
export const createCategory = async (categoryData) => {
  const response = await apiClient.post('/categories', categoryData);
  return response.data;
};

// --- 성장앨범 API ---

// 4-8. 성장앨범 사진 업로드 (POST /api/tasks/albums)
// Content-Type: multipart/form-data
export const uploadGrowthAlbumPhoto = async (taskId, photoFile, memo) => {
  const formData = new FormData();
  formData.append('taskId', taskId);
  formData.append('photo', photoFile); // photoFile은 { uri: '...', name: '...', type: 'image/jpeg' } 형태여야 함
  formData.append('memo', memo);

  const response = await apiClient.post('/tasks/albums', formData, {
    headers: {
      'Content-Type': 'multipart/form-data', // multipart/form-data 헤더 설정
    },
  });
  return response.data;
};

// 4-9. 성장앨범 조회 (캘린더형) (GET /api/tasks/albums?view=calendar&year=YYYY&month=MM)
export const getGrowthAlbumCalendar = async (year, month) => {
  const response = await apiClient.get(`/tasks/albums?view=calendar&year=${year}&month=${month}`);
  return response.data;
};

// 4-10. 성장앨범 조회 (카테고리별) (GET /api/tasks/albums?view=category&categoryId=CATEGORY_ID)
export const getGrowthAlbumCategory = async (categoryId) => {
  const response = await apiClient.get(`/tasks/albums?view=category&categoryId=${categoryId}`);
  return response.data;
};
