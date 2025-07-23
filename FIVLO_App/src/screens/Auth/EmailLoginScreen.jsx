// src/screens/Auth/EmailLoginScreen.jsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { GlobalStyles } from '../../styles/GlobalStyles';
import { Colors } from '../../styles/color';
import { FontSizes, FontWeights } from '../../styles/Fonts';
import Header from '../../components/common/Header';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { login } from '../../services/authApi'; // authApi 임포트
import AsyncStorage from '@react-native-async-storage/async-storage'; // AsyncStorage 임포트

const EmailLoginScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('로그인 오류', '이메일과 비밀번호를 입력해주세요.');
      return;
    }

    try {
      const response = await login(email, password); // 실제 백엔드 API 호출
      console.log('로그인 성공:', response);
      // 로그인 성공 시, App.js의 초기화 로직이 다시 실행되어 isPremiumUser 상태를 업데이트하고 Main으로 이동합니다.
      Alert.alert('성공', '로그인 되었습니다.');
      navigation.navigate('Main'); // 메인 화면으로 이동
    } catch (error) {
      console.error('로그인 실패:', error.response ? error.response.data : error.message);
      Alert.alert('로그인 실패', error.response?.data?.message || '이메일 또는 비밀번호가 올바르지 않습니다.');
    }
  };

  return (
    <View style={[GlobalStyles.container, { paddingTop: insets.top }]}>
      <Header title="로그인하기" showBackButton={true} />
      <ScrollView contentContainerStyle={styles.formContainer}>
        <Input
          placeholder="이메일"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <Input
          placeholder="비밀번호"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Button
          title="로그인하기"
          onPress={handleLogin}
          style={styles.loginButton}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    flexGrow: 1,
    width: '80%',
    alignItems: 'center',
    marginTop: 50,
    paddingBottom: 40,
  },
  loginButton: {
    marginTop: 30,
  },
});

export default EmailLoginScreen;
