// App.js

import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, ActivityIndicator, Alert } from 'react-native';
import { getSubscriptionStatus } from './src/services/authApi'; // 구독 정보 API 임포트

// 공통 스타일 및 폰트 임포트 (로딩 화면용)
import { Colors } from './src/styles/color';
import { FontSizes } from './src/styles/Fonts';

export default function App() {
  const [isAppReady, setIsAppReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState('Onboarding');
  const [isPremiumUser, setIsPremiumUser] = useState(false); // 실제 사용자 프리미엄 여부

  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const userToken = await AsyncStorage.getItem('userToken');
        const refreshToken = await AsyncStorage.getItem('refreshToken'); // 리프레시 토큰도 가져옴

        if (userToken && refreshToken) {
          // 토큰이 있다면 백엔드에 구독 정보 요청하여 프리미엄 여부 확인
          try {
            const subscriptionInfo = await getSubscriptionStatus();
            if (subscriptionInfo && subscriptionInfo.subscriptionStatus === 'premium') { // API 응답 필드명 확인: subscriptionStatus
              setIsPremiumUser(true);
            } else {
              setIsPremiumUser(false);
            }
            setInitialRoute('Main'); // 메인 화면으로 설정
          } catch (apiError) {
            // getSubscriptionStatus가 401 에러를 반환하면 apiClient 인터셉터가 갱신 시도
            // 갱신까지 실패하면 이 catch 블록으로 다시 들어올 수 있음
            console.warn("Initial API call failed, attempting refresh or re-login:", apiError);
            Alert.alert('세션 만료', '로그인 세션이 만료되었습니다. 다시 로그인해주세요.');
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('refreshToken');
            setInitialRoute('Onboarding');
            setIsPremiumUser(false);
          }
        } else {
          // 토큰이 없으면 온보딩/로그인 화면으로
          setInitialRoute('Onboarding');
          setIsPremiumUser(false);
        }
      } catch (error) {
        console.error("Error checking user session or fetching subscription:", error);
        Alert.alert('오류', '세션 확인 중 문제가 발생했습니다. 다시 로그인해주세요.');
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('refreshToken');
        setInitialRoute('Onboarding');
        setIsPremiumUser(false);
      } finally {
        setIsAppReady(true);
      }
    };

    checkUserSession();
  }, []);

  if (!isAppReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.primaryBeige }}>
        <ActivityIndicator size="large" color={Colors.secondaryBrown} />
        <Text style={{ fontSize: FontSizes.large, color: Colors.textDark, marginTop: 10 }}>앱 로딩 중...</Text>
      </View>
    );
  }

  return <AppNavigator initialRoute={initialRoute} isPremiumUser={isPremiumUser} />;
}
