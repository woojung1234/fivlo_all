// src/store/authStore.js (예시)
import { create } from 'zustand';

const useAuthStore = create((set) => ({
  userToken: null,
  userPurpose: null,
  setUserToken: (token) => set({ userToken: token }),
  setUserPurpose: (purpose) => set({ userPurpose: purpose }),
  logout: () => set({ userToken: null, userPurpose: null }),
}));

export default useAuthStore;