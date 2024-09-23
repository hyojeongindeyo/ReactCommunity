import React, { useState, useContext, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Modal, TextInput, TouchableWithoutFeedback, ActivityIndicator } from 'react-native';
import { MaterialIcons, Entypo } from '@expo/vector-icons';
import BottomTabBar from '../BottomTabBar';
import { PostsContext } from './PostsContext';
import moment from 'moment';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage'; // AsyncStorage for caching

export default function NearbySafety({ navigation, route }) {
  const { posts, loadPosts } = useContext(PostsContext); // PostsContext에서 posts를 가져옴
  const [userLocation, setUserLocation] = useState(null); // 사용자 위치 상태
  const [filteredPosts, setFilteredPosts] = useState([]); // 필터링된 게시물 상태
  const [selectedCategory, setSelectedCategory] = useState('전체'); // 선택된 카테고리 상태
  const [loading, setLoading] = useState(true); // 로딩 상태 추가
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);

  // 위치 정보 캐싱 함수
  const getCachedLocation = async () => {
    try {
      const cachedLocation = await AsyncStorage.getItem('userLocation');
      if (cachedLocation !== null) {
        setUserLocation(cachedLocation);
        setLoading(false); // 캐시에서 로드된 경우 로딩 상태 해제
      }
    } catch (error) {
      console.error('Failed to load cached location:', error);
    }
  };

  // 사용자 위치 가져오기
  useEffect(() => {
    const fetchLocation = async () => {
      setLoading(true); // 위치 정보 로드 시작 시 로딩 상태 활성화
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        return;
      }

      try {
        // 빠르게 위치를 얻기 위해 정확도를 낮춤
        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced
        });

        const address = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        });

        if (address.length > 0) {
          const { city, district } = address[0];
          const userAddress = `${city} ${district}`;
          setUserLocation(userAddress);  // 시(city)와 동(district) 정보 설정
          await AsyncStorage.setItem('userLocation', userAddress); // 위치 캐싱
        }
      } catch (error) {
        console.error('Error fetching location:', error);
      } finally {
        setLoading(false); // 위치 정보 로드 완료 후 로딩 상태 해제
      }
    };

    getCachedLocation(); // 캐시된 위치 먼저 가져오기
    fetchLocation(); // 새 위치 정보 요청
  }, []);

  // 위치와 카테고리에 따른 게시물 필터링 및 정렬
useEffect(() => {
  if (userLocation && posts) {
    const formattedUserLocation = userLocation.replace(' ', ', ');  // 위치 형식 맞추기
    const filtered = posts.filter(post => {
      // '전체' 카테고리가 선택된 경우 위치만 필터링, 그 외에는 위치와 카테고리 모두 필터링
      const isMatchingLocation = post.location_address === formattedUserLocation;
      const isMatchingCategory = selectedCategory === '전체' || post.category === selectedCategory;
      return isMatchingLocation && isMatchingCategory;
    });
    
    // 최신순으로 정렬 (timestamp를 기준으로 내림차순 정렬)
    const sortedPosts = filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    setFilteredPosts(sortedPosts);  // 필터링 및 정렬된 게시물 설정
  }
}, [userLocation, posts, selectedCategory]);

  // 날짜 포맷팅 함수
  const formatDate = (date) => {
    return moment(date).format('YYYY.MM.DD A hh:mm');
  };

  // 게시글 작성 후 게시글 목록을 다시 불러오는 useEffect
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadPosts();  // 게시글 작성 후 목록 다시 불러오기
    });
    return unsubscribe;
  }, [navigation, loadPosts]);

  // 검색 처리
  const handleSearch = () => {
    if (searchQuery.trim() !== '') {
      setSearchHistory(prevHistory => [searchQuery, ...prevHistory]);
      setSearchQuery('');
    }
  };

  // 검색 기록 삭제
  const deleteSearchHistoryItem = (index) => {
    setSearchHistory(prevHistory => prevHistory.filter((_, i) => i !== index));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="keyboard-arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>내 주변 안전 소식</Text>
        <TouchableOpacity style={styles.iconButton} onPress={() => setSearchModalVisible(true)}>
          <MaterialIcons name="search" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {loading ? ( 
        // 위치 정보 로딩 중 로딩 표시
        <ActivityIndicator size="large" color="#0000ff" style={styles.loadingIndicator} /> 
      ) : (
        <>
          {/* HOT 게시물 상단 표시 - 현재 비워둠 */}
          <View style={styles.hotBox}>
            <Text style={styles.hotTitle}>[HOT]</Text>
            <Text style={styles.hotMessage}>HOT 게시물은 아직 없습니다.</Text>
            <Text style={styles.hotTimestamp}>-</Text>
          </View>

          {/* 카테고리 버튼 */}
          <View style={styles.categoryContainer}>
            {['전체', 'HOT', '교통', '시위', '재해', '주의'].map((category) => (
              <TouchableOpacity
                key={category}
                onPress={() => setSelectedCategory(category)}  // 선택된 카테고리 설정
                style={styles.categoryButton}
              >
                <Text style={[styles.categoryText, selectedCategory === category && styles.selectedCategoryText]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.horizontalLine}></View>

          {/* 필터링된 게시물 목록 */}
          <ScrollView style={styles.content}>
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post, index) => (
                <TouchableOpacity key={index} style={styles.postContainer} onPress={() => navigation.navigate('PostDetail', { post })}>
                  <Text style={styles.postText}>
                    [{post.category}] {post.title}
                  </Text>
                  <Text style={styles.timestamp}>{formatDate(post.timestamp)}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.alertBox}>
                <Text style={styles.message}>해당 위치에 대한 소식이 없습니다.</Text>
              </View>
            )}
          </ScrollView>
        </>
      )}

      {/* 게시물 작성 버튼 */}
      <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('WritePost')}>
        <Entypo name="plus" size={30} color="black" />
      </TouchableOpacity>

      <BottomTabBar navigation={navigation} />

      {/* 검색 모달 */}
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingBottom: 80,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: '5%',
    paddingTop: '10%',
    paddingBottom: '5%',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  iconButton: {
    padding: '2%',
  },
  hotBox: {
    backgroundColor: '#F3F3F3',
    borderRadius: 10,
    marginHorizontal: '5%',
    marginBottom: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  hotTitle: {
    color: '#A51919',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  hotMessage: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  hotTimestamp: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: '5%',
  },
  categoryButton: {
    paddingHorizontal: 10,
  },
  categoryText: {
    fontSize: 16,
    color: '#999',
  },
  selectedCategoryText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    borderBottomWidth: 2,
    borderBottomColor: '#000',
  },
  horizontalLine: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 10,
    width: '100%',
  },
  content: {
    flex: 1,
    paddingHorizontal: '5%',
  },
  postContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 10,
  },
  postText: {
    fontSize: 16,
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  alertBox: {
    backgroundColor: '#fff3e0',
    borderRadius: 10,
    marginVertical: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  message: {
    fontSize: 16,
    color: '#999',
  },
  addButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    backgroundColor: '#fff',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
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
    height: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 60,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
  },
  backButton: {
    marginRight: 10,
  },
  searchInput: {
    borderBottomWidth: 1,
    borderColor: '#ddd',
    flex: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  searchButton: {
    backgroundColor: '#556D6A',
    padding: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  historyContainer: {
    width: '100%',
    marginTop: 20,
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
});
