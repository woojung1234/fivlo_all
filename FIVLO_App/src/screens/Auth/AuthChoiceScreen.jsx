// src/screens/Auth/AuthChoiceScreen.jsx

import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { GlobalStyles } from '../../styles/GlobalStyles';
import { Colors } from '../../styles/color';
import { FontSizes, FontWeights } from '../../styles/Fonts';
import Button from '../../components/common/Button';
import CharacterImage from '../../components/common/CharacterImage';
import Header from '../../components/common/Header';
import { useNavigation, useRoute } from '@react-navigation/native'; // <-- useRoute 임포트 추가
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AuthChoiceScreen = ({ isPremiumUser }) => {
  const navigation = useNavigation();
  const route = useRoute(); // <-- useRoute 훅 사용
  const insets = useSafeAreaInsets();

  const userType = route.params?.userType; // <-- userType 파라미터 받기

  const handleGoogleSignIn = () => {
    console.log('Google Sign In');
  };

  const handleAppleSignIn = () => {
    console.log('Apple Sign In');
  };

  const handleEmailSignUp = () => {
    navigation.navigate('EmailSignUp', { userType: userType }); // <-- userType 전달!
  };

  const handleLogin = () => {
    navigation.navigate('EmailLogin');
  };

  return (
    <View style={[GlobalStyles.container, { paddingTop: insets.top }]}>
      <Header title="" showBackButton={true} />
      <ScrollView contentContainerStyle={styles.scrollViewContentContainer}>
        <Image
          source={require('../../../assets/images/fivlo_logo.png')}
          style={styles.logo}
        />
        <CharacterImage style={styles.obooniCharacter} />
        <Text style={styles.tagline}>
          짧은 열정이 아닌 꾸준함이 변한다.{"\n"}삶을 바꾸는 집중 루틴 플랫폼
        </Text>

        <View style={styles.buttonContainer}>
          <Button title="Google로 시작하기" onPress={handleGoogleSignIn} />
          <Button title="Apple로 시작하기" onPress={handleAppleSignIn} />
          <Button title="이메일로 시작하기" onPress={handleEmailSignUp} primary={false} />
          <TouchableOpacity onPress={handleLogin} style={styles.loginTextButton}>
            <Text style={styles.loginText}>로그인하기</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollViewContentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  logo: {
    width: 150,
    height: 60,
    resizeMode: 'contain',
    marginTop: 20,
  },
  obooniCharacter: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  tagline: {
    fontSize: FontSizes.medium,
    color: Colors.textDark,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  buttonContainer: {
    width: '80%',
    alignItems: 'center',
  },
  loginTextButton: {
    marginTop: 20,
    padding: 10,
  },
  loginText: {
    color: Colors.secondaryBrown,
    fontSize: FontSizes.medium,
    fontWeight: FontWeights.medium,
    textDecorationLine: 'underline',
  },
});

export default AuthChoiceScreen;
