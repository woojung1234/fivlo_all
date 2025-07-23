// src/services/apiClient.js

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native'; // Alert 임포트

// 백엔드 Base URL 설정 (Postman 가이드 기반)
// !!! 중요 !!! 로컬 개발 환경에서 실제 기기 테스트 시 'localhost' 대신 컴퓨터의 실제 IP 주소로 변경하세요.
// 예: const API_BASE_URL = 'http://192.168.0.10:5000/api';
const API_BASE_URL = 'http://172.30.1.26:5000/api'; 

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10초 타임아웃
});

// 요청 인터셉터: 모든 요청에 인증 토큰 추가 (로그인 후)
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('userToken'); // 로컬 스토리지에서 토큰 가져오기
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error getting token from AsyncStorage:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 에러 처리
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error("API Response Error:", error.response || error.message);
    // 401 Unauthorized 에러 시 로그아웃 처리
    if (error.response && error.response.status === 401) {
      await AsyncStorage.removeItem('userToken'); // 토큰 제거
      Alert.alert('세션 만료', '로그인 세션이 만료되었습니다. 다시 로그인해주세요.');
      // !!! 중요 !!! 여기에 로그인 화면으로 리디렉션하는 로직 추가 필요
      // 예: navigationService.navigate('AuthChoice') 또는 앱의 초기화 로직을 다시 트리거
      // 현재는 Alert만 띄우고 앱이 멈출 수 있습니다.
    }
    return Promise.reject(error);
  }
);

export default apiClient;
