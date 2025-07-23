// src/screens/Obooni/ObooniOwnedItemsScreen.jsx

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'; // ActivityIndicator 임포트 추가
import { useNavigation, useRoute, useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// 공통 스타일 및 컴포넌트 임포트
import { GlobalStyles } from '../../styles/GlobalStyles';
import { Colors } from '../../styles/color';
import { FontSizes, FontWeights } from '../../styles/Fonts';
import Header from '../../components/common/Header';

// API 서비스 임포트
import { getOwnedItems, getShopItems } from '../../services/obooniApi'; // 오분이 API 임포트 (getShopItems도 필요)

const ObooniOwnedItemsScreen = ({ isPremiumUser }) => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();

  const [ownedItems, setOwnedItems] = useState([]); // 사용자가 소유한 아이템 목록 (실제 아이템 객체)
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태

  // 데이터 로드
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 상점 아이템 전체 목록을 가져와서 이미지 매핑에 사용
      const allShopItems = await getShopItems();
      const allShopItemsMap = new Map(allShopItems.map(item => [item.id, item]));

      // 보유 아이템 목록 조회
      const ownedData = await getOwnedItems();
      // 보유 아이템 ID를 실제 아이템 객체로 변환
      const currentOwnedItems = ownedData
        .map(owned => allShopItemsMap.get(owned.itemId))
        .filter(item => item !== undefined); // 유효한 아이템만

      setOwnedItems(currentOwnedItems);

    } catch (error) {
      console.error("Failed to fetch owned items:", error.response ? error.response.data : error.message);
      Alert.alert('오류', '보유 아이템을 불러오는데 실패했습니다.');
      setOwnedItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 화면 포커스 시 데이터 로드
  useEffect(() => {
    if (isFocused) {
      fetchData();
    }
  }, [isFocused]);

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.itemContainer}>
      <Image source={item.image} style={styles.itemImage} />
      <Text style={styles.itemName}>{item.name}</Text>
      <Text style={styles.itemType}>{item.type}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.screenContainer, { paddingTop: insets.top + 20 }]}>
      <Header title="오분이의 옷장" showBackButton={true} />
      
      {isLoading && ( // 로딩 스피너 오버레이
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.accentApricot} />
        </View>
      )}

      {ownedItems.length > 0 ? (
        <FlatList
          data={ownedItems}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          numColumns={3}
          contentContainerStyle={styles.itemListContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>소유한 아이템이 없습니다.</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FontSizes.medium,
    color: Colors.secondaryBrown,
  },
  itemListContainer: {
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  itemContainer: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.textLight,
    borderRadius: 15,
    margin: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  itemName: {
    fontSize: FontSizes.medium,
    fontWeight: FontWeights.bold,
    color: Colors.textDark,
    textAlign: 'center',
  },
  itemType: {
    fontSize: FontSizes.small,
    color: Colors.secondaryBrown,
    marginTop: 5,
  },
});

export default ObooniOwnedItemsScreen;
