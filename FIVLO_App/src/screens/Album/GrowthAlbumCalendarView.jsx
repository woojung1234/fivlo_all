// src/screens/Album/GrowthAlbumCalendarView.jsx

import React, { useState, useEffect } from 'react'; // useEffect 임포트 추가
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native'; // ActivityIndicator, Alert 임포트 추가
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { format, isSameDay } from 'date-fns';
import { ko } from 'date-fns/locale';

// 공통 스타일 및 컴포넌트 임포트
import { Colors } from '../../styles/color';
import { FontSizes, FontWeights } from '../../styles/Fonts';

// API 서비스 임포트
import { getGrowthAlbumCalendar } from '../../services/taskApi';

// 캘린더 한국어 설정 (TaskCalendarScreen과 동일)
LocaleConfig.locales['ko'] = {
  monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  dayNames: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
  today: '오늘',
};
LocaleConfig.defaultLocale = 'ko';

const GrowthAlbumCalendarView = ({ isPremiumUser }) => { // isPremiumUser prop 받기
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [photosByDate, setPhotosByDate] = useState({}); // 날짜별 사진 데이터
  const [isLoading, setIsLoading] = useState(false);
  const [markedDates, setMarkedDates] = useState({}); // 캘린더에 표시될 날짜들

  // 앨범 데이터 로드
  const fetchAlbumData = async (year, month) => {
    setIsLoading(true);
    try {
      const data = await getGrowthAlbumCalendar(year, month); // API 호출
      const newPhotosByDate = data.reduce((acc, photo) => {
        const dateString = format(new Date(photo.date), 'yyyy-MM-dd'); // API 응답에 date 필드가 있다고 가정
        if (!acc[dateString]) {
          acc[dateString] = [];
        }
        acc[dateString].push(photo);
        return acc;
      }, {});
      setPhotosByDate(newPhotosByDate);

      // markedDates 업데이트
      const newMarkedDates = {};
      Object.keys(newPhotosByDate).forEach(dateStr => {
        newMarkedDates[dateStr] = {
          dots: newPhotosByDate[dateStr].map(photo => ({
            key: photo.id,
            color: Colors.accentApricot, // 사진이 있는 날은 점 표시
            selectedDotColor: Colors.textLight,
          })),
        };
      });
      setMarkedDates(newMarkedDates);

    } catch (error) {
      console.error("Failed to fetch growth album calendar data:", error.response ? error.response.data : error.message);
      Alert.alert('오류', '앨범 데이터를 불러오는데 실패했습니다.');
      setPhotosByDate({});
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 현재 월의 데이터 로드
  useEffect(() => {
    const today = new Date();
    fetchAlbumData(today.getFullYear(), today.getMonth() + 1);
  }, []);

  // 캘린더 월 변경 시 데이터 로드
  const onMonthChange = (month) => {
    fetchAlbumData(month.year, month.month);
  };

  const onDayPress = (day) => {
    setSelectedDate(day.dateString);
  };

  const photosForSelectedDate = photosByDate[selectedDate] || [];

  const renderPhotoItem = ({ item }) => (
    <TouchableOpacity style={styles.photoThumbnailContainer}>
      <Image source={{ uri: item.photoUrl }} style={styles.photoThumbnail} /> {/* API 응답에 photoUrl 필드가 있다고 가정 */}
      <Text style={styles.photoMemo}>{item.memo}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {isLoading && ( // 로딩 스피너 표시
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.accentApricot} />
        </View>
      )}
      <Calendar
        onDayPress={onDayPress}
        onMonthChange={onMonthChange} // 월 변경 시 이벤트
        markedDates={markedDates}
        markingType={'dots'}
        theme={{
          backgroundColor: Colors.primaryBeige,
          calendarBackground: Colors.primaryBeige,
          textSectionTitleColor: Colors.secondaryBrown,
          selectedDayBackgroundColor: Colors.accentApricot,
          selectedDayTextColor: Colors.textLight,
          todayTextColor: Colors.accentApricot,
          dayTextColor: Colors.textDark,
          textDisabledColor: '#d9e1e8',
          dotColor: Colors.accentApricot,
          selectedDotColor: Colors.textLight,
          arrowColor: Colors.secondaryBrown,
          monthTextColor: Colors.textDark,
          textMonthFontWeight: FontWeights.bold,
          textMonthFontSize: FontSizes.large,
          textDayHeaderFontWeight: FontWeights.medium,
          textDayFontSize: FontSizes.medium,
          textDayFontWeight: FontWeights.regular,
        }}
        style={styles.calendar}
      />
      
      <Text style={styles.selectedDateTitle}>{format(new Date(selectedDate), 'yyyy년 MM월 dd일')}</Text>
      {photosForSelectedDate.length > 0 ? (
        <FlatList
          data={photosForSelectedDate}
          renderItem={renderPhotoItem}
          keyExtractor={item => item.id}
          numColumns={3}
          contentContainerStyle={styles.photoGrid}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <Text style={styles.noPhotoText}>선택된 날짜에 사진이 없습니다.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: Colors.primaryBeige,
  },
  loadingOverlay: { // 로딩 스피너 오버레이
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
  calendar: {
    width: '100%',
    aspectRatio: 1,
    padding: 10,
    borderRadius: 15,
    backgroundColor: Colors.textLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  selectedDateTitle: {
    fontSize: FontSizes.large,
    fontWeight: FontWeights.bold,
    color: Colors.textDark,
    marginBottom: 15,
  },
  photoGrid: {
    justifyContent: 'center',
    width: '100%',
    paddingBottom: 20,
  },
  photoThumbnailContainer: {
    width: '30%',
    aspectRatio: 1,
    margin: '1.5%',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.secondaryBrown,
  },
  photoThumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoMemo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    color: Colors.textLight,
    fontSize: FontSizes.small - 2,
    paddingVertical: 3,
    textAlign: 'center',
  },
  noPhotoText: {
    fontSize: FontSizes.medium,
    color: Colors.secondaryBrown,
    textAlign: 'center',
    marginTop: 30,
  },
});

export default GrowthAlbumCalendarView;
