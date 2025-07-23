// src/screens/Album/GrowthAlbumCategoryView.jsx

import React, { useState, useEffect } from 'react'; // useEffect 임포트 추가
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native'; // ActivityIndicator, Alert 임포트 추가

// 공통 스타일 및 컴포넌트 임포트
import { Colors } from '../../styles/color';
import { FontSizes, FontWeights } from '../../styles/Fonts';

// API 서비스 임포트
import { getGrowthAlbumCategory, getCategories } from '../../services/taskApi'; // getCategories도 필요

const GrowthAlbumCategoryView = ({ isPremiumUser }) => { // isPremiumUser prop 받기
  const [categories, setCategories] = useState([]); // 카테고리 목록
  const [photosByCategory, setPhotosByCategory] = useState({}); // 카테고리별 사진 데이터
  const [isLoading, setIsLoading] = useState(false);

  // 데이터 로드
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const fetchedCategories = await getCategories(); // 카테고리 목록 조회
      setCategories(fetchedCategories);

      const allCategoryPhotos = {};
      for (const category of fetchedCategories) {
        const data = await getGrowthAlbumCategory(category.id); // 카테고리별 사진 조회
        allCategoryPhotos[category.name] = data; // 카테고리 이름으로 저장
      }
      setPhotosByCategory(allCategoryPhotos);

    } catch (error) {
      console.error("Failed to fetch growth album category data:", error.response ? error.response.data : error.message);
      Alert.alert('오류', '앨범 데이터를 불러오는데 실패했습니다.');
      setCategories([]);
      setPhotosByCategory({});
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchData();
  }, []);


  const renderPhotoThumbnail = ({ item }) => (
    <TouchableOpacity style={styles.photoThumbnailContainer}>
      <Image source={{ uri: item.photoUrl }} style={styles.photoThumbnail} /> {/* API 응답에 photoUrl 필드가 있다고 가정 */}
      <Text style={styles.photoMemo}>{item.memo}</Text>
    </TouchableOpacity>
  );

  const renderCategorySection = ({ item: category }) => (
    <View style={styles.categorySection}>
      <View style={[styles.categoryHeader, { backgroundColor: category.color || Colors.secondaryBrown }]}>
        <Text style={styles.categoryTitle}>{category.name}</Text>
      </View>
      {photosByCategory[category.name] && photosByCategory[category.name].length > 0 ? (
        <FlatList
          data={photosByCategory[category.name]}
          renderItem={renderPhotoThumbnail}
          keyExtractor={photo => photo.id}
          numColumns={3}
          contentContainerStyle={styles.photoGrid}
          scrollEnabled={false}
        />
      ) : (
        <Text style={styles.noPhotoText}>이 카테고리에 사진이 없습니다.</Text>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {isLoading && ( // 로딩 스피너 표시
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.accentApricot} />
        </View>
      )}
      <FlatList
        data={categories}
        renderItem={renderCategorySection}
        keyExtractor={item => item.id || item.name} // 카테고리 ID가 없다면 이름으로 key
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.categoryListContent}
        scrollEnabled={false}
      />
    </ScrollView>
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
  categoryListContent: {
    paddingBottom: 20,
  },
  categorySection: {
    marginBottom: 20,
    backgroundColor: Colors.textLight,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginHorizontal: 10,
  },
  categoryHeader: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primaryBeige,
  },
  categoryTitle: {
    fontSize: FontSizes.large,
    fontWeight: FontWeights.bold,
    color: Colors.textLight,
  },
  photoGrid: {
    justifyContent: 'center',
    width: '100%',
    padding: 10,
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
    paddingVertical: 30,
  },
});

export default GrowthAlbumCategoryView;
