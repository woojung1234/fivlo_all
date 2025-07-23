// src/screens/Obooni/ObooniClosetScreen.jsx

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, FlatList, ActivityIndicator } from 'react-native'; // ActivityIndicator 임포트 추가
import { useNavigation, useRoute, useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';

// 공통 스타일 및 컴포넌트 임포트
import { GlobalStyles } from '../../styles/GlobalStyles';
import { Colors } from '../../styles/color';
import { FontSizes, FontWeights } from '../../styles/Fonts';
import Header from '../../components/common/Header';
import CharacterImage from '../../components/common/CharacterImage';

// API 서비스 임포트
import { getOwnedItems, equipItem, unequipItem } from '../../services/obooniApi'; // 오분이 API 임포트 (새로 생성할 파일)
import { getShopItems } from '../../services/obooniApi'; // 상점 아이템 데이터도 필요 (이미지 로딩용)

const ObooniClosetScreen = ({ isPremiumUser }) => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();

  const [ownedItems, setOwnedItems] = useState([]); // 사용자가 소유한 아이템 목록 (실제 아이템 객체)
  const [equippedItems, setEquippedItems] = useState({ // 현재 착용 중인 아이템 ID
    top: null,
    bottom: null,
    acc: null,
  });
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태

  // 데이터 로드 (소유 아이템, 착용 아이템)
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

      // 현재 착용 중인 아이템 조회 (API 명세에 없지만, 필요시 백엔드에서 제공해야 함)
      // 여기서는 임시로 첫 번째 아이템을 착용하는 것으로 시뮬레이션
      if (currentOwnedItems.length > 0) {
        // setEquippedItems({ top: currentOwnedItems[0].id }); // 예시
      }

      // 구매한 아이템이 있다면 착용 상태 업데이트 (ObooniShopScreen에서 전달받은 경우)
      if (route.params?.purchasedItem) {
        const purchased = route.params.purchasedItem;
        setEquippedItems(prev => ({
          ...prev,
          [purchased.type]: purchased.id
        }));
        navigation.setParams({ purchasedItem: undefined });
      }

    } catch (error) {
      console.error("Failed to fetch closet data:", error.response ? error.response.data : error.message);
      Alert.alert('오류', '옷장 데이터를 불러오는데 실패했습니다.');
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

  // 아이템 착용/해제 (API 연동)
  const handleEquipItem = async (item) => {
    setIsLoading(true);
    try {
      let response;
      if (equippedItems[item.type] === item.id) {
        // 착용 해제
        response = await unequipItem(item.type); // API 호출
        setEquippedItems(prev => ({ ...prev, [item.type]: null }));
        Alert.alert('착용 해제', `${item.name} 착용을 해제했습니다.`);
      } else {
        // 착용
        response = await equipItem(item.id); // API 호출
        setEquippedItems(prev => ({ ...prev, [item.type]: item.id }));
        Alert.alert('착용 완료', `${item.name}을(를) 착용했습니다.`);
      }
      console.log("아이템 착용/해제 성공:", response);
    } catch (error) {
      console.error("아이템 착용/해제 실패:", error.response ? error.response.data : error.message);
      Alert.alert('오류', '아이템 착용/해제 중 문제가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToOwnedItems = () => {
    navigation.navigate('ObooniOwnedItems', { ownedItems: ownedItems });
  };

  const handleGoToShop = () => {
    navigation.navigate('ObooniShop');
  };

  const renderOwnedItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.itemThumbnailContainer, equippedItems[item.type] === item.id && styles.itemThumbnailActive]}
      onPress={() => handleEquipItem(item)}
      disabled={isLoading} // 로딩 중에는 비활성화
    >
      <Image source={item.image} style={styles.itemThumbnail} />
    </TouchableOpacity>
  );

  const getObooniCharacterSource = () => {
    return require('../../../assets/images/obooni_default.png');
  };

  return (
    <View style={[styles.screenContainer, { paddingTop: insets.top + 20 }]}>
      <Header title="오분이 커스터마이징" showBackButton={true} />

      {isLoading && ( // 로딩 스피너 오버레이
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.accentApricot} />
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollViewContentContainer}>
        <View style={styles.obooniPreviewContainer}>
          <Image source={getObooniCharacterSource()} style={styles.obooniPreviewImage} />
          {equippedItems.top && <Image source={ownedItems.find(i => i.id === equippedItems.top)?.image} style={styles.equippedItemOverlay} />}
          {equippedItems.bottom && <Image source={ownedItems.find(i => i.id === equippedItems.bottom)?.image} style={styles.equippedItemOverlay} />}
          {equippedItems.acc && <Image source={ownedItems.find(i => i.id === equippedItems.acc)?.image} style={styles.equippedItemOverlay} />}
        </View>

        <View style={styles.closetSection}>
          <View style={styles.closetHeader}>
            <TouchableOpacity onPress={handleGoToOwnedItems} disabled={isLoading}>
              <Text style={styles.closetTitle}>오분이 옷장</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleGoToShop} style={styles.addShopButton} disabled={isLoading}>
              <FontAwesome5 name="plus" size={20} color={Colors.secondaryBrown} />
            </TouchableOpacity>
          </View>
          
          {ownedItems.length > 0 ? (
            <FlatList
              data={ownedItems}
              renderItem={renderOwnedItem}
              keyExtractor={item => item.id}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.ownedItemsList}
            />
          ) : (
            <Text style={styles.emptyClosetText}>아직 옷과 소품이 없습니다.</Text>
          )}
        </View>
      </ScrollView>
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
  scrollViewContentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
    paddingTop: 10,
  },
  obooniPreviewContainer: {
    width: 250,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    position: 'relative',
  },
  obooniPreviewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  equippedItemOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  closetSection: {
    width: '100%',
    backgroundColor: Colors.textLight,
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  closetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  closetTitle: {
    fontSize: FontSizes.large,
    fontWeight: FontWeights.bold,
    color: Colors.textDark,
  },
  addShopButton: {
    backgroundColor: Colors.primaryBeige,
    borderRadius: 15,
    padding: 8,
    borderWidth: 1,
    borderColor: Colors.secondaryBrown,
  },
  ownedItemsList: {
    paddingVertical: 10,
  },
  itemThumbnailContainer: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: Colors.primaryBeige,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  itemThumbnailActive: {
    borderColor: Colors.accentApricot,
  },
  itemThumbnail: {
    width: '80%',
    height: '80%',
    resizeMode: 'contain',
  },
  emptyClosetText: {
    fontSize: FontSizes.medium,
    color: Colors.secondaryBrown,
    textAlign: 'center',
    paddingVertical: 30,
  },
});

export default ObooniClosetScreen;
