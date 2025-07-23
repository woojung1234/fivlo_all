// src/screens/Auth/EmailSignUpScreen.jsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { GlobalStyles } from '../../styles/GlobalStyles';
import { Colors } from '../../styles/color';
import { FontSizes, FontWeights } from '../../styles/Fonts';
import Header from '../../components/common/Header';
import Input from '../../components/common/Input';
import Checkbox from '../../components/common/Checkbox';
import Button from '../../components/common/Button';
import { useNavigation, useRoute } from '@react-navigation/native'; // <-- useRoute 임포트 추가
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { register } from '../../services/authApi';

const EmailSignUpScreen = ({ isPremiumUser }) => {
  const navigation = useNavigation();
  const route = useRoute(); // <-- useRoute 훅 사용
  const insets = useSafeAreaInsets();

  const userType = route.params?.userType; // <-- userType 파라미터 받기

  const [profileName, setProfileName] = useState(''); // 'name' 대신 'profileName'으로 변경
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isOver14, setIsOver14] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleSignUp = async () => {
    if (!profileName.trim() || !email.trim() || !password.trim() || !isOver14 || !agreedToTerms) {
      Alert.alert('회원가입 오류', '모든 필수 항목을 입력하고 동의해주세요.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('비밀번호 오류', '비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }
    if (!userType) { // userType이 없는 경우 (온보딩 거치지 않은 경우)
      Alert.alert('오류', '사용자 유형을 알 수 없습니다. 앱을 다시 시작해주세요.');
      return;
    }

    try {
      const response = await register(profileName, email, password, userType); // <-- userType 전달!
      console.log('회원가입 성공:', response);
      Alert.alert('성공', '회원가입이 완료되었습니다. 자동으로 로그인됩니다.');
      navigation.navigate('Main');
    } catch (error) {
      console.error('회원가입 실패:', error.response ? error.response.data : error.message);
      Alert.alert('회원가입 실패', error.response?.data?.message || '알 수 없는 오류가 발생했습니다.');
    }
  };

  return (
    <View style={[GlobalStyles.container, { paddingTop: insets.top }]}>
      <Header title="이메일로 시작하기" showBackButton={true} />
      <ScrollView contentContainerStyle={styles.formContainer}>
        <Input
          placeholder="이름"
          keyboardType="default"
          autoCapitalize="none"
          value={profileName} // <-- 'name' 대신 'profileName' 사용
          onChangeText={setProfileName} // <-- setProfileName 사용
        />
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

        <Checkbox
          label="만 14세 이상입니다."
          isChecked={isOver14}
          onPress={() => setIsOver14(!isOver14)}
        />
        <Checkbox
          label="이메일 혹은 약관 동의"
          isChecked={agreedToTerms}
          onPress={() => setAgreedToTerms(!agreedToTerms)}
        />

        <Button
          title="루틴 관리 시작하기"
          onPress={handleSignUp}
          style={styles.signUpButton}
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
  signUpButton: {
    marginTop: 30,
  },
});

export default EmailSignUpScreen;
