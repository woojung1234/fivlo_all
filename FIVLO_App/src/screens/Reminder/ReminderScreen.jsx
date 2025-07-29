// src/screens/Reminder/ReminderScreen.jsx

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { format } from 'date-fns';

// 공통 스타일 및 컴포넌트 임포트
import { GlobalStyles } from '../../styles/GlobalStyles';
import { Colors } from '../../styles/color';
import { FontSizes, FontWeights } from '../../styles/Fonts';
import Header from '../../components/common/Header';

// API 서비스 임포트
import { getReminders } from '../../services/reminder';

const ReminderScreen = ({ isPremiumUser }) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();

  const [reminders, setReminders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 알림 목록 로드
  const fetchReminders = async () => {
    setIsLoading(true);
    try {
      const data = await getReminders();
      setReminders(data);
    } catch (error) {
      console.error("Failed to fetch reminders:", error.response ? error.response.data : error.message);
      Alert.alert('오류', '알림 목록을 불러오는데 실패했습니다.');
      setReminders([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 화면 포커스 시 알림 목록 다시 로드
  useEffect(() => {
    if (isFocused) {
      fetchReminders();
    }
  }, [isFocused]);

  // 알림 항목 클릭 시 수정 페이지로 이동
  const handleEditReminder = (reminder) => {
    navigation.navigate('ReminderAddEdit', { reminder: reminder });
  };

  // "+" 버튼 클릭 시 새 알림 추가 페이지로 이동
  const handleAddReminder = () => {
    navigation.navigate('ReminderAddEdit', { reminder: null });
  };

  const renderReminderItem = ({ item }) => (
    <TouchableOpacity style={styles.reminderItem} onPress={() => handleEditReminder(item)} disabled={isLoading}>
      <View style={styles.reminderContent}>
        <Text style={styles.reminderTitle}>{item.title}</Text>
        <Text style={styles.reminderTime}>{item.time.hour.toString().padStart(2, '0')}:{item.time.minute.toString().padStart(2, '0')}</Text>
      </View>
      <View style={styles.reminderLocation}>
        <Text style={styles.reminderLocationText}>
          {item.location && item.location.name ? item.location.name : '장소 설정 안 함'}
        </Text>
        {item.location && !isPremiumUser && (
          <FontAwesome5 name="lock" size={16} color={Colors.secondaryBrown} style={styles.lockIcon} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.screenContainer, { paddingTop: insets.top + 20 }]}>
      <Header title="망각방지 알림" showBackButton={true} />

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.accentApricot} />
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollViewContentContainer}>
        {reminders.length > 0 ? (
          <FlatList
            data={reminders}
            renderItem={renderReminderItem}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.reminderListContent}
            scrollEnabled={false}
          />
        ) : (
          !isLoading && <Text style={styles.noRemindersText}>아직 설정된 알림이 없습니다.</Text>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.addButton} onPress={handleAddReminder} disabled={isLoading}>
        <FontAwesome5 name="plus" size={24} color={Colors.textLight} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: Colors.primaryBeige,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    zIndex: 10,
  },
  scrollViewContentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 80,
    paddingTop: 10,
  },
  reminderListContent: {
    flexGrow: 1,
  },
  reminderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.textLight,
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reminderContent: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: FontSizes.large,
    fontWeight: FontWeights.bold,
    color: Colors.textDark,
    marginBottom: 5,
  },
  reminderTime: {
    fontSize: FontSizes.medium,
    color: Colors.secondaryBrown,
  },
  reminderLocation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reminderLocationText: {
    fontSize: FontSizes.medium,
    color: Colors.secondaryBrown,
    marginRight: 5,
  },
  lockIcon: {
    marginLeft: 5,
  },
  noRemindersText: {
    fontSize: FontSizes.medium,
    color: Colors.secondaryBrown,
    textAlign: 'center',
    marginTop: 50,
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: Colors.accentApricot,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
});

export default ReminderScreen;
