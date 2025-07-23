// App.js

import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, ActivityIndicator } from 'react-native'; // <-- Alert 임포트 제거!
import { Alert } from 'react-native'; // Alert는 메서드이므로, 따로 임포트할 필요 없음 (혹은 Alert.alert로 직접 사용)

import { getSubscriptionStatus } from './src/services/authApi';

// 공통 스타일 및 폰트 임포트 (로딩 화면용)
import { Colors } from './src/styles/color';
import { FontSizes } from './src/styles/Fonts';

export default function App() {
  const [isAppReady, setIsAppReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState('Onboarding');
  const [isPremiumUser, setIsPremiumUser] = useState(false);

  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          const subscriptionInfo = await getSubscriptionStatus();
          if (subscriptionInfo && subscriptionInfo.subscription === 'premium') {
            setIsPremiumUser(true);
          } else {
            setIsPremiumUser(false);
          }
          setInitialRoute('Main');
        } else {
          setInitialRoute('Onboarding');
          setIsPremiumUser(false);
        }
      } catch (error) {
        console.error("Error checking user session or fetching subscription:", error);
        Alert.alert('오류', '세션 확인 중 문제가 발생했습니다. 다시 시도해주세요.');
        await AsyncStorage.removeItem('userToken');
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
