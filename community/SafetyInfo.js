import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Dimensions, Modal, TextInput, TouchableWithoutFeedback } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import BottomTabBar from '../BottomTabBar';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SafetyInfo = ({ navigation, route }) => {
  const { filter } = route.params || { filter: '전체' };
  const [selectedCategory, setSelectedCategory] = useState(filter);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [selectedInfo, setSelectedInfo] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);

  const categories = ['전체', '자연', '사회', '생활'];

  const safetyInfos = [
    { id: 1, title: '화재 시\n행동요령', date: '2024.07.01', category: '자연', banner: '화재 시 행동요령' },
    { id: 2, title: '태풍 시\n행동요령', date: '2024.07.02', category: '자연', banner: '태풍 시 대피요령' },
    { id: 3, title: '교통사고', date: '2024.07.03', category: '사회', banner: '교통사고 예방수칙' },
    { id: 4, title: '심폐소생술', date: '2024.07.04', category: '생활', banner: '심폐소생술 방법' },
    { id: 5, title: '침수 시\n행동요령', date: '2024.07.05', category: '자연', banner: '침수 시 예방수칙' },
    { id: 6, title: '뺑소니', date: '2024.07.06', category: '사회', banner: '뺑소니 대처법' },
    { id: 7, title: '응급처치', date: '2024.07.07', category: '생활', banner: '응급처치 방법' },
    { id: 8, title: '폭우 시\n예방수칙', date: '2024.07.01', category: '자연', banner: '폭우 시 예방수칙' },
    { id: 9, title: '산불 예방\n수칙', date: '2024.07.08', category: '자연', banner: '산불 예방수칙' },
    { id: 10, title: '오물풍선 발견 시\n행동요령', date: '2024.07.10', category: '생활', banner: '오물풍선 발견 시 행동요령' },
  ];

  const filteredInfos = selectedCategory === '전체' ? safetyInfos : safetyInfos.filter(info => info.category === selectedCategory);

  useEffect(() => {
    if (filter) {
      setSelectedCategory(filter);
    }
  }, [filter]);

  const handleInfoPress = (info) => {
    setSelectedInfo(info);
    setInfoModalVisible(true);
  };

  const handleBannerPress = (banner) => {
    const info = safetyInfos.find(info => info.banner === banner);
    if (info) {
      setSelectedInfo(info);
      setInfoModalVisible(true);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim() !== '') {
      setSearchHistory(prevHistory => [searchQuery, ...prevHistory]);
      setSearchQuery('');
    }
  };

  const deleteSearchHistoryItem = (index) => {
    setSearchHistory(prevHistory => prevHistory.filter((_, i) => i !== index));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="keyboard-arrow-left" size={30} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>안전 정보</Text>
        <TouchableOpacity style={styles.iconButton} onPress={() => setSearchModalVisible(true)}>
          <MaterialIcons name="search" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <View style={styles.bannerContainer}>
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.banner}>
          <TouchableOpacity style={[styles.bannerItem, styles.firstBanner]} onPress={() => handleBannerPress('폭우 시 예방수칙')}>
            <Text style={styles.bannerSubtitle}>여름철 빈번하게 발생하는</Text>
            <Text style={styles.bannerText}>폭우 시 예방수칙</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.bannerItem, styles.secondBanner]} onPress={() => handleBannerPress('화재 시 행동요령')}>
            <Text style={styles.bannerSubtitle}>북한 오물풍선</Text>
            <Text style={styles.bannerText}>발견 시 행동요령</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.bannerItem, styles.thirdBanner]} onPress={() => handleBannerPress('산불 예방수칙')}>
            <Text style={styles.bannerSubtitle}>봄철 산불 예방</Text>
            <Text style={styles.bannerText}>산불 예방수칙</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <View style={styles.categoryContainer}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            onPress={() => setSelectedCategory(category)}
            style={styles.categoryButton}
          >
            <Text style={[styles.categoryText, selectedCategory === category && styles.selectedCategoryText]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.infoContainer}>
        <View style={styles.infoRow}>
          {filteredInfos.map((info) => (
            <TouchableOpacity key={info.id} onPress={() => handleInfoPress(info)} style={styles.infoCardContainer}>
              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>{info.title}</Text>
              </View>
              <View style={styles.infoFooter}>
                <Text style={styles.infoDate}>{info.date}</Text>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>{info.category}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <BottomTabBar navigation={navigation} />

      <Modal
        animationType="slide"
        transparent={true}
        visible={infoModalVisible}
        onRequestClose={() => setInfoModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedInfo?.banner}</Text>
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setInfoModalVisible(false)}>
              <Text style={styles.modalCloseText}>X</Text>
            </TouchableOpacity>
            <View style={styles.grayRectangle}>
              <Text style={styles.rectangleX}>X</Text>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={searchModalVisible}
        onRequestClose={() => setSearchModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setSearchModalVisible(false)}>
          <View style={styles.searchModalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.searchModalContent}>
                <View style={styles.searchHeader}>
                  <TouchableOpacity onPress={() => setSearchModalVisible(false)} style={styles.backButton}>
                    <MaterialIcons name="keyboard-arrow-left" size={24} color="black" />
                  </TouchableOpacity>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="검색어를 입력하세요"
                    placeholderTextColor="#888888" 
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoFocus
                  />
                  <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                    <Text style={styles.searchButtonText}>검색</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView style={styles.historyContainer}>
                  {searchHistory.map((item, index) => (
                    <View key={index} style={styles.historyItem}>
                      <View style={styles.historyIconContainer}>
                        <MaterialIcons name="history" size={24} color="black" />
                      </View>
                      <Text style={styles.historyText}>{item}</Text>
                      <TouchableOpacity onPress={() => deleteSearchHistoryItem(index)}>
                        <MaterialIcons name="close" size={24} color="black" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: '5%',
    paddingTop: '10%',
    paddingBottom: '5%',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  iconButton: {
    padding: 10,
  },
  bannerContainer: {
    height: 200,
  },
  banner: {
    height: '100%',
    backgroundColor: '#e0e0e0',
  },
  bannerItem: {
    width: SCREEN_WIDTH - 10,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    marginHorizontal: 5,
    borderRadius: 10,
    padding: 20,
  },
  firstBanner: {
    backgroundColor: '#333B54',
  },
  secondBanner: {
    backgroundColor: '#5E6377',
  },
  thirdBanner: {
    backgroundColor: '#718597',
  },
  bannerText: {
    color: 'white',
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  bannerSubtitle: {
    color: 'white',
    fontSize: 15,
    textAlign: 'left',
  },
  categoryContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingVertical: 10,
    backgroundColor: '#f0f0f0',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingLeft: 10,
  },
  categoryButton: {
    paddingHorizontal: 10,
  },
  categoryText: {
    fontSize: 16,
    color: '#999',
  },
  selectedCategoryText: {
    fontWeight: 'bold',
    color: 'black',
  },
  infoContainer: {
    paddingHorizontal: '5%',
    paddingTop: 10,
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoCardContainer: {
    width: '48%',
    marginBottom: 30,
  },
  infoCard: {
    backgroundColor: '#F3F3F3',
    padding: 20,
    borderRadius: 10,
    height: 110,
    elevation: 5,
    justifyContent: 'flex-end',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#969696',
    textAlign: 'left',
  },
  infoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    position: 'absolute',
    bottom: -20,
    right: 10,
  },
  infoDate: {
    fontSize: 12,
    color: '#999',
    marginRight: 5,
  },
  categoryBadge: {
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  categoryBadgeText: {
    fontSize: 12,
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    height: '50%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  modalCloseText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  grayRectangle: {
    backgroundColor: '#e0e0e0',
    width: '90%',
    height: 320,
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rectangleX: {
    color: 'black',
    fontSize: 250,
    fontWeight: '100',
  },
  searchModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchModalContent: {
    backgroundColor: 'white',
    padding: 20,
    width: '100%',
    height: '100%', // 전체 높이를 차지하도록 설정
    justifyContent: 'flex-start', // 상단 정렬
    alignItems: 'center',
    paddingTop: 60, // 상단 여백 추가
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%', // 전체 너비를 차지하도록 설정
    marginTop: 20, // 상단 여백 추가
  },
  backButton: {
    marginRight: 10, // 검색창과 버튼 사이 여백 추가
  },
  searchInput: {
    borderBottomWidth: 1,
    borderColor: '#ddd',
    flex: 1, // 남은 공간을 차지하도록 설정
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  searchButton: {
    backgroundColor: '#556D6A',
    padding: 10,
    borderRadius: 5,
    marginLeft: 10, // 검색창과 버튼 사이 여백 추가
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  historyContainer: {
    width: '100%',
    marginTop: 20, // History list spacing from the search bar
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    marginHorizontal: 10,
  },
  historyIconContainer: {
    marginRight: 10,
  },
  historyText: {
    fontSize: 16,
    flex: 1,
  },
  deleteText: {
    fontSize: 16,
    color: '#ff0000',
  },
});

export default SafetyInfo;
