// src/screens/Obooni/ObooniShopScreen.jsx

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert, Modal, ActivityIndicator } from 'react-native'; // ActivityIndicator 임포트 추가
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';

// 공통 스타일 및 컴포넌트 임포트
import { GlobalStyles } from '../../styles/GlobalStyles';
import { Colors } from '../../styles/color';
import { FontSizes, FontWeights } from '../../styles/Fonts';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';

// API 서비스 임포트
import { getCoinBalance, spendCoin } from '../../services/coinApi'; // 코인 API 임포트
import { getShopItems, purchaseItem, getOwnedItems } from '../../services/obooniApi'; // 오분이 API 임포트 (새로 생성할 파일)

const ObooniShopScreen = ({ isPremiumUser }) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();

  const [userCoins, setUserCoins] = useState(0); // 초기 코인 0
  const [shopItems, setShopItems] = useState([]); // 상점 아이템 목록
  const [ownedItemIds, setOwnedItemIds] = useState([]); // 사용자가 소유한 아이템 ID 목록
  const [selectedItem, setSelectedItem] = useState(null);
  const [isPurchaseConfirmModalVisible, setIsPurchaseConfirmModalVisible] = useState(false);

  const [isLoading, setIsLoading] = useState(false); // 로딩 상태

  // 데이터 로드 (코인 잔액, 상점 아이템, 소유 아이템)
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 코인 잔액 조회
      const coinData = await getCoinBalance();
      setUserCoins(coinData.balance);

      // 상점 아이템 목록 조회
      const itemsData = await getShopItems();
      setShopItems(itemsData);

      // 보유 아이템 목록 조회
      const ownedData = await getOwnedItems();
      setOwnedItemIds(ownedData.map(item => item.itemId)); // itemId만 추출

    } catch (error) {
      console.error("Failed to fetch shop data:", error.response ? error.response.data : error.message);
      Alert.alert('오류', '상점 데이터를 불러오는데 실패했습니다.');
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

  const handlePurchaseAttempt = (item) => {
    if (!isPremiumUser) {
      Alert.alert('유료 기능', '아이템 구매는 유료 버전에서만 가능합니다. 유료 버전 구매 페이지로 이동하시겠습니까?');
      return;
    }

    if (ownedItemIds.includes(item.id)) {
      Alert.alert('알림', '이미 소유한 아이템입니다.');
      return;
    }
    setSelectedItem(item);
    setIsPurchaseConfirmModalVisible(true);
  };

  const confirmPurchase = async () => {
    if (!selectedItem) return;

    if (userCoins < selectedItem.price) {
      Alert.alert('코인 부족', '코인이 부족합니다. 더 많은 코인을 모아주세요!');
      setIsPurchaseConfirmModalVisible(false);
      return;
    }

    setIsLoading(true);
    try {
      // 코인 사용 API 호출
      await spendCoin(selectedItem.price, 'item_purchase', `오분이 아이템 구매: ${selectedItem.name}`);
      // 아이템 구매 API 호출
      const purchaseResponse = await purchaseItem(selectedItem.id, 1); // quantity 1
      console.log("아이템 구매 성공:", purchaseResponse);

      Alert.alert('구매 완료', `${selectedItem.name}을(를) 구매했습니다!`);
      
      // 구매 후 데이터 새로고침
      fetchData(); // 코인 잔액과 소유 아이템 목록을 최신화
      navigation.replace('ObooniCloset', { purchasedItem: selectedItem }); // 옷장으로 이동
      setIsPurchaseConfirmModalVisible(false);
    } catch (error) {
      console.error("아이템 구매 실패:", error.response ? error.response.data : error.message);
      Alert.alert('구매 실패', error.response?.data?.message || '아이템 구매 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderShopItem = ({ item }) => {
    const canAfford = userCoins >= item.price;
    const isOwned = ownedItemIds.includes(item.id);

    return (
      <TouchableOpacity
        style={styles.shopItemContainer}
        onPress={() => handlePurchaseAttempt(item)}
        disabled={isOwned || !isPremiumUser || isLoading} // 로딩 중에도 비활성화
      >
        <Image source={item.image} style={styles.shopItemImage} />
        <Text style={styles.shopItemName}>{item.name}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.shopItemPrice}>{item.price}</Text>
          <FontAwesome5 name="coins" size={FontSizes.small} color={Colors.accentApricot} style={styles.coinIcon} />
        </View>
        {!isPremiumUser && (
          <View style={styles.lockOverlay}>
            <FontAwesome5 name="lock" size={30} color={Colors.textLight} />
          </View>
        )}
        {isOwned && (
          <View style={styles.ownedOverlay}>
            <FontAwesome5 name="check-circle" size={30} color={Colors.accentApricot} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.screenContainer, { paddingTop: insets.top + 20 }]}>
      <Header title="오분이 상점" showBackButton={true} />

      {isLoading && ( // 로딩 스피너 오버레이
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.accentApricot} />
        </View>
      )}

      <View style={styles.userCoinDisplay}>
        <Text style={styles.userCoinText}>보유 코인: {userCoins}</Text>
        <FontAwesome5 name="coins" size={FontSizes.medium} color={Colors.accentApricot} />
      </View>

      <FlatList
        data={shopItems} // 백엔드에서 가져온 상점 아이템 사용
        renderItem={renderShopItem}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.shopItemList}
      />

      <Modal
        animationType="fade"
        transparent={true}
        visible={isPurchaseConfirmModalVisible}
        onRequestClose={() => setIsPurchaseConfirmModalVisible(false)}
      >
        <View style={styles.confirmModalOverlay}>
          <View style={styles.confirmModalContent}>
            <Text style={styles.confirmModalTitle}>아이템 구매</Text>
            {selectedItem && (
              <>
                <Image source={selectedItem.image} style={styles.confirmModalImage} />
                <Text style={styles.confirmModalText}>
                  {selectedItem.name}을(를) {selectedItem.price} 코인에 구매하시겠습니까?
                </Text>
              </>
            )}
            <View style={styles.confirmModalButtons}>
              <Button title="취소" onPress={() => setIsPurchaseConfirmModalVisible(false)} primary={false} style={styles.confirmButton} disabled={isLoading} />
              <Button title="구매하기" onPress={confirmPurchase} style={styles.confirmButton} disabled={isLoading} />
            </View>
          </View>
        </View>
      </Modal>
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
  userCoinDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  userCoinText: {
    fontSize: FontSizes.medium,
    fontWeight: FontWeights.bold,
    color: Colors.textDark,
    marginRight: 5,
  },
  shopItemList: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  shopItemContainer: {
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
    position: 'relative',
  },
  shopItemImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  shopItemName: {
    fontSize: FontSizes.medium,
    fontWeight: FontWeights.bold,
    color: Colors.textDark,
    textAlign: 'center',
    marginBottom: 5,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shopItemPrice: {
    fontSize: FontSizes.small,
    color: Colors.secondaryBrown,
    marginRight: 5,
  },
  coinIcon: {
    // FontAwesome5 코인 아이콘
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ownedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  confirmModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  confirmModalContent: {
    backgroundColor: Colors.textLight,
    borderRadius: 20,
    padding: 25,
    width: '85%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  confirmModalTitle: {
    fontSize: FontSizes.large,
    fontWeight: FontWeights.bold,
    color: Colors.textDark,
    marginBottom: 20,
  },
  confirmModalImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 15,
  },
  confirmModalText: {
    fontSize: FontSizes.medium,
    color: Colors.textDark,
    textAlign: 'center',
    marginBottom: 30,
  },
  confirmModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  confirmButton: {
    flex: 1,
    marginHorizontal: 5,
  },
});

export default ObooniShopScreen;
