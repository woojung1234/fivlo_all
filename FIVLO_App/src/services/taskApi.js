// src/services/taskApi.js

import apiClient from './apiClient';

// --- Task API ---

// 4-1. Task 목록 조회 (날짜별)
// GET /api/tasks?date=YYYY-MM-DD
export const getTasksByDate = async (date) => {
  const response = await apiClient.get(`/tasks?date=${date}`);
  return response.data.data.tasks || []; // <-- 응답 구조에 맞춰 수정: data.data.tasks
};

// 4-2. Task 생성 (POST /api/tasks)
export const createTask = async (taskData) => {
  const response = await apiClient.post('/tasks', taskData);
  return response.data.data.task; // <-- 응답 구조에 맞춰 수정: data.data.task
};

// 4-3. Task 수정 (PATCH /api/tasks/TASK_ID)
export const updateTask = async (taskId, taskData) => {
  const response = await apiClient.patch(`/tasks/${taskId}`, taskData);
  return response.data.data.task; // <-- 응답 구조에 맞춰 수정: data.data.task
};

// 4-4. Task 완료 처리 (PUT /api/tasks/TASK_ID/complete)
export const completeTask = async (taskId) => {
  const response = await apiClient.put(`/tasks/${taskId}/complete`);
  return response.data.data; // <-- 응답 구조에 맞춰 수정: data.data (allTasksCompleted, coinReward 등 포함)
};

// 4-5. Task 삭제 (DELETE /api/tasks/TASK_ID)
export const deleteTask = async (taskId, deleteAll = false) => {
  const response = await apiClient.delete(`/tasks/${taskId}`, { params: { deleteAll: deleteAll } }); // deleteAll 쿼리 파라미터로 전달
  return response.data.data; // <-- 응답 구조에 맞춰 수정: data.data (deletedCount 등 포함)
};

// --- 카테고리 API ---

// 4-6. 카테고리 목록 조회 (GET /api/categories)
export const getCategories = async () => {
  const response = await apiClient.get('/categories');
  return response.data.data.categories || []; // <-- 응답 구조에 맞춰 수정: data.data.categories
};

// 4-7. 카테고리 생성 (POST /api/categories)
export const createCategory = async (categoryData) => {
  const response = await apiClient.post('/categories', categoryData);
  return response.data.data.category; // <-- 응답 구조에 맞춰 수정: data.data.category
};

// 4-x. 카테고리 수정 (PATCH /api/categories/{id}) - Postman 가이드에는 없으나, 백엔드에 구현되어 있다면
export const updateCategory = async (categoryId, categoryData) => {
  const response = await apiClient.patch(`/categories/${categoryId}`, categoryData);
  return response.data.data.category;
};

// --- 성장앨범 API ---

// 4-8. 성장앨범 사진 업로드 (POST /api/tasks/albums)
export const uploadGrowthAlbumPhoto = async (taskId, photoFile, memo) => {
  const formData = new FormData();
  formData.append('taskId', taskId);
  formData.append('photo', photoFile); // photoFile은 { uri: '...', name: '...', type: 'image/jpeg' } 형태여야 함
  formData.append('memo', memo);

  const response = await apiClient.post('/tasks/albums', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.data.growthAlbum; // <-- 응답 구조에 맞춰 수정: data.data.growthAlbum
};

// 4-9. 성장앨범 조회 (캘린더형) (GET /api/tasks/albums?view=calendar&year=YYYY&month=MM)
export const getGrowthAlbumCalendar = async (year, month) => {
  const response = await apiClient.get(`/tasks/albums?view=calendar&year=${year}&month=${month}`);
  return response.data.data.albums || []; // <-- 응답 구조에 맞춰 수정: data.data.albums
};

// 4-10. 성장앨범 조회 (카테고리별) (GET /api/tasks/albums?view=category&categoryId=CATEGORY_ID)
export const getGrowthAlbumCategory = async (categoryId) => {
  const response = await apiClient.get(`/tasks/albums?view=category&categoryId=${categoryId}`);
  return response.data.data.albums || []; // <-- 응답 구조에 맞춰 수정: data.data.albums
};

// 4-x. 성장앨범 목록 조회 - 카테고리별 전체 (GET /api/albums?view=category)
export const getGrowthAlbumsByAllCategories = async () => {
  const response = await apiClient.get('/albums?view=category'); // Postman 가이드에 따라 /api/albums
  return response.data.data.albums || [];
};

// 4-x. 전체 성장앨범 조회 (GET /api/albums)
export const getAllGrowthAlbums = async (limit = 50) => {
  const response = await apiClient.get(`/albums?limit=${limit}`); // Postman 가이드에 따라 /api/albums
  return response.data.data.albums || [];
};
