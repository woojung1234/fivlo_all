// src/navigation/AppNavigator.js

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';

// 화면 컴포넌트들을 임포트 (파일 구조에 맞춰 경로 수정!)
import OnboardingScreen from '../screens/OnboardingScreen';
import AuthChoiceScreen from '../screens/Auth/AuthChoiceScreen';
import EmailSignUpScreen from '../screens/Auth/EmailSignUpScreen';
import EmailLoginScreen from '../screens/Auth/EmailLoginScreen';
import PurposeSelectionScreen from '../screens/PurposeSelectionScreen';
import HomeScreen from '../screens/HomeScreen';
import RoutineSettingScreen from '../screens/RoutineSettingScreen';
import FeaturesScreen from '../screens/FeaturesScreen';
import SettingsScreen from '../screens/SettingsScreen';

// Task 관련 화면 임포트 (경로 유지)
import TaskCalendarScreen from '../screens/Task/TaskCalendarScreen';
import TaskDetailModal from '../screens/Task/TaskDetailModal';
import TaskCompleteCoinModal from '../screens/Task/TaskCompleteCoinModal';
import TaskEditModal from '../screens/Task/TaskEditModal';
import TaskDeleteConfirmModal from '../screens/Task/TaskDeleteConfirmModal';
import CategorySettingModal from '../screens/Task/CategorySettingModal';
import CategoryEditModal from '../screens/Task/CategoryEditModal';

// 포모도로 관련 화면 임포트 (경로 유지)
import PomodoroScreen from '../screens/Pomodoro/PomodoroScreen';
import PomodoroGoalCreationScreen from '../screens/Pomodoro/PomodoroGoalCreationScreen';
import PomodoroGoalSelectionScreen from '../screens/Pomodoro/PomodoroGoalSelectionScreen';
import PomodoroTimerScreen from '../screens/Pomodoro/PomodoroTimerScreen';
import PomodoroPauseScreen from '../screens/Pomodoro/PomodoroPauseScreen';
import PomodoroResetConfirmModal from '../screens/Pomodoro/PomodoroResetConfirmModal';
import PomodoroBreakChoiceScreen from '../screens/Pomodoro/PomodoroBreakChoiceScreen';
import PomodoroCycleCompleteScreen from '../screens/Pomodoro/PomodoroCycleCompleteScreen';
import PomodoroFinishScreen from '../screens/Pomodoro/PomodoroFinishScreen';
import PomodoroStopScreen from '../screens/Pomodoro/PomodoroStopScreen';

// 타임어택 관련 화면 임포트 (경로 유지)
import TimeAttackScreen from '../screens/TimeAttack/TimeAttackScreen';
import TimeAttackGoalSettingScreen from '../screens/TimeAttack/TimeAttackGoalSettingScreen';
import TimeAttackTimeInputModal from '../screens/TimeAttack/TimeAttackTimeInputModal';
import TimeAttackAISubdivisionScreen from '../screens/TimeAttack/TimeAttackAISubdivisionScreen';
import TimeAttackInProgressScreen from '../screens/TimeAttack/TimeAttackInProgressScreen';
import TimeAttackCompleteScreen from '../screens/TimeAttack/TimeAttackCompleteScreen';

// 성장 앨범 관련 화면 임포트 (경로 유지)
import GrowthAlbumScreen from '../screens/Album/GrowthAlbumScreen';
import PhotoUploadModal from '../screens/Album/PhotoUploadModal';
import GrowthAlbumCalendarView from '../screens/Album/GrowthAlbumCalendarView';
import GrowthAlbumCategoryView from '../screens/Album/GrowthAlbumCategoryView';

// 망각방지 알림 관련 화면 임포트 (경로 유지)
import ReminderScreen from '../screens/Reminder/ReminderScreen';
import ReminderAddEditScreen from '../screens/Reminder/ReminderAddEditScreen';
import ReminderTimeSettingModal from '../screens/Reminder/ReminderTimeSettingModal';
import ReminderLocationSettingScreen from '../screens/Reminder/ReminderLocationSettingScreen';
import ReminderChecklistScreen from '../screens/Reminder/ReminderChecklistScreen';
import ReminderLocationAlertModal from '../screens/Reminder/ReminderLocationAlertModal';
import ReminderCompleteCoinModal from '../screens/Reminder/ReminderCompleteCoinModal';

// 집중도 분석 관련 화면 임포트 (경로 수정!)
import AnalysisGraphScreen from '../screens/AnalysisGraphScreen'; // <-- Analysis 폴더 밖에 있으므로 경로 수정
import DailyAnalysisView from '../screens/Analysis/DailyAnalysisView';
import WeeklyAnalysisView from '../screens/Analysis/WeeklyAnalysisView';
import MonthlyAnalysisView from '../screens/Analysis/MonthlyAnalysisView';
import DDayAnalysisView from '../screens/Analysis/DDayAnalysisView';

// 오분이 커스터마이징 관련 화면 임포트 (경로 수정!)
import ObooniCustomizationScreen from '../screens/Obooni/ObooniCustomizationScreen'; // <-- Obooni 폴더 밖에 있으므로 경로 수정
import ObooniClosetScreen from '../screens/Obooni/ObooniClosetScreen';
import ObooniOwnedItemsScreen from '../screens/Obooni/ObooniOwnedItemsScreen';
import ObooniShopScreen from '../screens/Obooni/ObooniShopScreen';

import { Colors } from '../styles/color';
import { FontSizes, FontWeights } from '../styles/Fonts';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// 메인 탭 내비게이터 (하단 탭바)
const MainTabNavigator = ({ isPremiumUser }) => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'GrowthAlbumTab') {
            iconName = focused ? 'image' : 'image-outline';
          } else if (route.name === 'FeaturesTab') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'SettingsTab') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else {
            iconName = 'help-circle-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.accentApricot,
        tabBarInactiveTintColor: Colors.secondaryBrown,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.primaryBeige,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          position: 'absolute',
          bottom: 0,
          height: 80,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.1,
          shadowRadius: 5,
          elevation: 5,
        },
        tabBarLabelStyle: {
          fontSize: FontSizes.small,
          fontWeight: FontWeights.medium,
          marginTop: -5,
        },
      })}
    >
      <Tab.Screen name="HomeTab" options={{ tabBarLabel: '홈' }}>
        {props => <HomeScreen {...props} isPremiumUser={isPremiumUser} />}
      </Tab.Screen>
      <Tab.Screen name="GrowthAlbumTab" options={{ tabBarLabel: '성장앨범' }}>
        {props => <GrowthAlbumScreen {...props} isPremiumUser={isPremiumUser} />}
      </Tab.Screen>
      <Tab.Screen name="FeaturesTab" options={{ tabBarLabel: '기능' }}>
        {props => <FeaturesScreen {...props} isPremiumUser={isPremiumUser} />}
      </Tab.Screen>
      <Tab.Screen name="SettingsTab" options={{ tabBarLabel: '설정' }}>
        {props => <SettingsScreen {...props} isPremiumUser={isPremiumUser} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

// 앱 전체 스택 내비게이터
const AppNavigator = ({ initialRoute, isPremiumUser }) => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Onboarding" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Onboarding">
          {props => <OnboardingScreen {...props} isPremiumUser={isPremiumUser} />}
        </Stack.Screen>
        <Stack.Screen name="PurposeSelection">
          {props => <PurposeSelectionScreen {...props} isPremiumUser={isPremiumUser} />}
        </Stack.Screen>
        <Stack.Screen name="AuthChoice">
          {props => <AuthChoiceScreen {...props} isPremiumUser={isPremiumUser} />}
        </Stack.Screen>
        <Stack.Screen name="EmailSignUp">
          {props => <EmailSignUpScreen {...props} isPremiumUser={isPremiumUser} />}
        </Stack.Screen>
        <Stack.Screen name="EmailLogin">
          {props => <EmailLoginScreen {...props} isPremiumUser={isPremiumUser} />}
        </Stack.Screen>
        <Stack.Screen name="Main">
          {props => <MainTabNavigator {...props} isPremiumUser={isPremiumUser} />}
        </Stack.Screen>
        <Stack.Screen name="RoutineSetting">
          {props => <RoutineSettingScreen {...props} isPremiumUser={isPremiumUser} />}
        </Stack.Screen>
        {/* Task 관련 화면 */}
        <Stack.Screen name="TaskCalendar">
          {props => <TaskCalendarScreen {...props} isPremiumUser={isPremiumUser} />}
        </Stack.Screen>
        <Stack.Screen name="TaskDetailModal" options={{ presentation: 'modal' }}>
          {props => <TaskDetailModal {...props} isPremiumUser={isPremiumUser} />}
        </Stack.Screen>
        <Stack.Screen name="TaskCompleteCoinModal" options={{ presentation: 'modal' }}>
          {props => <TaskCompleteCoinModal {...props} isPremiumUser={isPremiumUser} />}
        </Stack.Screen>
        <Stack.Screen name="TaskEditModal" options={{ presentation: 'modal' }}>
          {props => <TaskEditModal {...props} isPremiumUser={isPremiumUser} />}
        </Stack.Screen>
        <Stack.Screen name="TaskDeleteConfirmModal" options={{ presentation: 'modal' }}>
          {props => <TaskDeleteConfirmModal {...props} isPremiumUser={isPremiumUser} />}
        </Stack.Screen>
        <Stack.Screen name="CategorySettingModal" options={{ presentation: 'modal' }}>
          {props => <CategorySettingModal {...props} isPremiumUser={isPremiumUser} />}
        </Stack.Screen>
        <Stack.Screen name="CategoryEditModal" options={{ presentation: 'modal' }}>
          {props => <CategoryEditModal {...props} isPremiumUser={isPremiumUser} />}
        </Stack.Screen>
        {/* 포모도로 관련 화면 */}
        <Stack.Screen name="Pomodoro">
          {props => <PomodoroScreen {...props} isPremiumUser={isPremiumUser} />}
        </Stack.Screen>
        <Stack.Screen name="PomodoroGoalCreation">
          {props => <PomodoroGoalCreationScreen {...props} isPremiumUser={isPremiumUser} />}
        </Stack.Screen>
        <Stack.Screen name="PomodoroGoalSelection">
          {props => <PomodoroGoalSelectionScreen {...props} isPremiumUser={isPremiumUser} />}
        </Stack.Screen>
        <Stack.Screen name="PomodoroTimer">
          {props => <PomodoroTimerScreen {...props} isPremiumUser={isPremiumUser} />}
        </Stack.Screen>
        <Stack.Screen name="PomodoroPause">
          {props => <PomodoroPauseScreen {...props} isPremiumUser={isPremiumUser} />}
        </Stack.Screen>
        <Stack.Screen name="PomodoroResetConfirmModal" options={{ presentation: 'modal' }}>
          {props => <PomodoroResetConfirmModal {...props} isPremiumUser={isPremiumUser} />}
        </Stack.Screen>
        <Stack.Screen name="PomodoroBreakChoice">
          {props => <PomodoroBreakChoiceScreen {...props} isPremiumUser={isPremiumUser} />}
        </Stack.Screen>
        <Stack.Screen name="PomodoroCycleComplete">
          {props => <PomodoroCycleCompleteScreen {...props} isPremiumUser={isPremiumUser} />}
        </Stack.Screen>
        <Stack.Screen name="PomodoroFinish">
          {props => <PomodoroFinishScreen {...props} isPremiumUser={isPremiumUser} />}
        </Stack.Screen>
        <Stack.Screen name="PomodoroStop">
          {props => <PomodoroStopScreen {...props} isPremiumUser={isPremiumUser} />}
        </Stack.Screen>
        {/* 타임어택 관련 화면 */}
        <Stack.Screen name="TimeAttack">
          {props => <TimeAttackScreen {...props} isPremiumUser={isPremiumUser} />}
        </Stack.Screen>
        <Stack.Screen name="TimeAttackGoalSetting">
          {props => <TimeAttackGoalSettingScreen {...props} isPremiumUser={isPremiumUser} />}
        </Stack.Screen>
        <Stack.Screen name="TimeAttackTimeInputModal" options={{ presentation: 'modal' }}>
          {props => <TimeAttackTimeInputModal {...props} isPremiumUser={isPremiumUser} />}
        </Stack.Screen>
        <Stack.Screen name="TimeAttackAISubdivision">
          {props => <TimeAttackAISubdivisionScreen {...props} isPremiumUser={isPremiumUser} />}
        </Stack.Screen>
        <Stack.Screen name="TimeAttackInProgress">
          {props => <TimeAttackInProgressScreen {...props} isPremiumUser={isPremiumUser} />}
        </Stack.Screen>
        <Stack.Screen name="TimeAttackComplete">
          {props => <TimeAttackCompleteScreen {...props} isPremiumUser={isPremiumUser} />}
        </Stack.Screen>
        {/* 성장 앨범 관련 화면 */}
        <Stack.Screen name="PhotoUploadModal" options={{ presentation: 'modal' }}>
          {props => <PhotoUploadModal {...props} isPremiumUser={isPremiumUser} />}
        </Stack.Screen>
        <Stack.Screen name="GrowthAlbumCalendarView">
          {props => <GrowthAlbumCalendarView {...props} isPremiumUser={isPremiumUser} />}
        </Stack.Screen>
        <Stack.Screen name="GrowthAlbumCategoryView">
          {props => <GrowthAlbumCategoryView {...props} isPremiumUser={isPremiumUser} />}
        </Stack.Screen>
        {/* 망각방지 알림 관련 화면 */}
        <Stack.Screen name="Reminder">
          {props => <ReminderScreen {...props} isPremiumUser={isPremiumUser} />}
        </Stack.Screen>
        <Stack.Screen name="ReminderAddEdit">
          {props => <ReminderAddEditScreen {...props} isPremiumUser={isPremiumUser} />}
        </Stack.Screen>
        <Stack.Screen name="ReminderTimeSettingModal" options={{ presentation: 'modal' }}>
          {props => <ReminderTimeSettingModal {...props} isPremiumUser={isPremiumUser} />}
        </Stack.Screen>
        <Stack.Screen name="ReminderLocationSetting">
          {props => <ReminderLocationSettingScreen {...props} isPremiumUser={isPremiumUser} />}
        </Stack.Screen>
        <Stack.Screen name="ReminderChecklist">
          {props => <ReminderChecklistScreen {...props} isPremiumUser={isPremiumUser} />}
        </Stack.Screen>
        <Stack.Screen name="ReminderLocationAlertModal" options={{ presentation: 'modal' }}>
          {props => <ReminderLocationAlertModal {...props} isPremiumUser={isPremiumUser} />}
        </Stack.Screen>
        <Stack.Screen name="ReminderCompleteCoinModal" options={{ presentation: 'modal' }}>
          {props => <ReminderCompleteCoinModal {...props} isPremiumUser={isPremiumUser} />}
        </Stack.Screen>
        {/* 집중도 분석 관련 화면 */}
        <Stack.Screen name="AnalysisGraph">
          {props => <AnalysisGraphScreen {...props} isPremiumUser={isPremiumUser} />}
        </Stack.Screen>
        <Stack.Screen name="DailyAnalysisView">
          {props => <DailyAnalysisView {...props} isPremiumUser={isPremiumUser} />}
        </Stack.Screen>
        <Stack.Screen name="WeeklyAnalysisView">
          {props => <WeeklyAnalysisView {...props} isPremiumUser={isPremiumUser} />}
        </Stack.Screen>
        <Stack.Screen name="MonthlyAnalysisView">
          {props => <MonthlyAnalysisView {...props} isPremiumUser={isPremiumUser} />}
        </Stack.Screen>
        <Stack.Screen name="DDayAnalysisView">
          {props => <DDayAnalysisView {...props} isPremiumUser={isPremiumUser} />}
        </Stack.Screen>
        {/* 오분이 커스터마이징 관련 화면 */}
        <Stack.Screen name="ObooniCustomization" options={{ presentation: 'modal' }}>
          {props => <ObooniCustomizationScreen {...props} isPremiumUser={isPremiumUser} />}
        </Stack.Screen>
        <Stack.Screen name="ObooniCloset">
          {props => <ObooniClosetScreen {...props} isPremiumUser={isPremiumUser} />}
        </Stack.Screen>
        <Stack.Screen name="ObooniOwnedItems">
          {props => <ObooniOwnedItemsScreen {...props} isPremiumUser={isPremiumUser} />}
        </Stack.Screen>
        <Stack.Screen name="ObooniShop">
          {props => <ObooniShopScreen {...props} isPremiumUser={isPremiumUser} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
