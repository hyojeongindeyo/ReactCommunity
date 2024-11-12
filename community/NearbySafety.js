import React, { useState, useContext, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Modal, TextInput, TouchableWithoutFeedback, ActivityIndicator, Image } from 'react-native';
import { MaterialIcons, Entypo, Ionicons } from '@expo/vector-icons';
import BottomTabBar from '../BottomTabBar';
import { PostsContext } from './PostsContext';
import moment from 'moment';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage'; // AsyncStorage for caching
import axios from 'axios'; // axios 임포트
import config from '../config'; // API URL을 위한 config 임포트
import CustomModal from '../CustomModal'; // 모달 컴포넌트 import

export default function NearbySafety({ navigation, route }) {
  const { posts, loadPosts } = useContext(PostsContext); // PostsContext에서 posts를 가져옴
  const [userLocation, setUserLocation] = useState(null); // 사용자 위치 상태
  const [filteredPosts, setFilteredPosts] = useState([]); // 필터링된 게시물 상태
  const [selectedCategory, setSelectedCategory] = useState('전체'); // 선택된 카테고리 상태
  const [loading, setLoading] = useState(true); // 로딩 상태 추가
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const { filter } = route.params || { filter: '전체' };
  const [isSearchSubmitted, setIsSearchSubmitted] = useState(false);
  const [missionModalVisible, setMissionModalVisible] = useState(false); // 새로운 상태 변수
  const [userData, setUserData] = useState(null); // userData 상태 추가

  // 사용자 세션 정보 가져오기
  useEffect(() => {
    fetchUserSession();
  }, []);

  const fetchUserSession = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/users/session`, { withCredentials: true });
      setUserData(response.data);
    } catch (error) {
      console.error('Error fetching user session:', error);
    }
  };

  useEffect(() => {
    if (filter) {
      setSelectedCategory(filter);
    }
    if (userData) {
      completeMission(6); // 사용자 세션이 있을 때 미션 완료
    }
  }, [filter, userData]);

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
          const { city, district, street } = address[0];
          const userAddress = `${city} ${district || street }`;
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
        const isMatchingLocation = post.location_address === formattedUserLocation;
        if (selectedCategory === 'HOT') {
          // 조회수가 가장 높은 게시물 필터링
          const maxViews = Math.max(...posts.map(p => p.views || 0)); // 조회수가 가장 높은 값 찾기
          return isMatchingLocation && post.views === maxViews; // 조회수가 가장 높은 게시물 반환
        } else {
          // '전체' 카테고리가 선택된 경우 위치만 필터링, 그 외에는 위치와 카테고리 모두 필터링
          const isMatchingCategory = selectedCategory === '전체' || post.category === selectedCategory;
          return isMatchingLocation && isMatchingCategory;
        }
      });

      // 최신순으로 정렬 (timestamp를 기준으로 내림차순 정렬)
      const sortedPosts = filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      setFilteredPosts(sortedPosts);  // 필터링 및 정렬된 게시물 설정
    }
  }, [userLocation, posts, selectedCategory]);

  // 날짜 포맷팅 함수
  const formatDate = (date) => {
    return moment(date).format('YY/MM/DD HH:mm'); // 연도를 두 자리로, 시간을 24시간제로 표시
  };

  // 게시글 작성 후 게시글 목록을 다시 불러오는 useEffect
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadPosts();  // 게시글 작성 후 목록 다시 불러오기
    });
    return unsubscribe;
  }, [navigation, loadPosts]);

  // 검색 처리 (검색 결과 필터링 및 설정)
  const handleSearch = async () => {
    if (searchQuery.trim() !== '' && userLocation) {
      setIsSearchSubmitted(true); // 검색 버튼을 눌렀을 때만 true로 설정
      try {
        const formattedUserLocation = userLocation.replace(' ', ', ');
        const response = await axios.post(`${config.apiUrl}/posts/search/location`, {
          searchQuery,
          userLocation: formattedUserLocation
        });

        setSearchResults(response.data);
        setSearchHistory(prevHistory => [searchQuery, ...prevHistory]);
      } catch (error) {
        console.error('Error during location-based search:', error);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
    setSearchQuery('');
  };

  // 검색어 입력 시 검색어 상태만 업데이트하고, 결과는 업데이트하지 않도록 변경
  const handleSearchQueryChange = (text) => {
    setSearchQuery(text);
    setIsSearchSubmitted(false); // 검색 버튼을 누르기 전까지는 결과를 표시하지 않음
  };

  // 모달이 처음 열릴 때 searchResults 초기화
  useEffect(() => {
    if (searchModalVisible) {
      setSearchResults([]); // 검색 모달이 열릴 때 searchResults를 빈 배열로 초기화
    }
  }, [searchModalVisible]);

  // 검색 기록 삭제
  const deleteSearchHistoryItem = (index) => {
    setSearchHistory(prevHistory => prevHistory.filter((_, i) => i !== index));
  };

  const getHotPost = () => {
    // console.log("Current user location:", userLocation);
    const formattedUserLocation = userLocation.replace(' ', ', '); // 위치 형식 맞추기

    // if (!formattedUserLocation || filteredPosts.length === 0) {
    //   console.log("No hot posts available");
    //   return null;
    // }

    // 현재 위치에 맞는 게시물만 필터링
    const hotPosts = filteredPosts.filter(post => post.location_address === formattedUserLocation);
    // console.log("Hot posts for location:", hotPosts);

    // 필터된 게시물 중 조회수가 가장 높은 게시물 선택
    return hotPosts.sort((a, b) => b.views - a.views)[0] || null;
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case '교통':
        return '#C0E6F6'; // 교통은 파란색
      case '화재':
        return '#F6C0C0'; // 시위는 빨간색
      case '재해':
        return '#C0F6C6'; // 재해는 녹색
      case '주의':
        return '#F6D8C0'; // 주의는 주황색
      default:
        return '#F3F3F3'; // 기본 색상
    }
  };
  const categoryEmojis = {
    전체: '🌎',
    교통: '🚔',
    화재: '🧯',
    재해: '🌪️',
    주의: '⚠️',
  };

  // 미션 완료 여부 확인 및 API 호출
  const completeMission = async (missionId) => {
    if (!userData) {
      console.error('사용자 데이터가 없습니다. 로그인 필요');
      return;
    }

    try {
      const response = await axios.get(`${config.apiUrl}/missions/user/${userData.id}`);
      const missions = response.data.missions;

      if (missions.includes(missionId)) {
        console.log('이미 미션을 완료했습니다.');
      } else {
        const completeResponse = await axios.post(`${config.apiUrl}/missions/complete-mission`, {
          userId: userData.id,
          missionId: missionId,
        });
        console.log(`미션 ${missionId} 완료:`, completeResponse.data);
        setMissionModalVisible(true); // 처음 완료된 미션일 경우 모달 띄우기
      }
    } catch (error) {
      console.error('미션 완료 오류:', error.response ? error.response.data : error);
    }
  };

  const missionhandleClose = () => {
    setMissionModalVisible(false); // 새로운 모달 닫기
  };

  const missionhandleConfirm = () => {
    console.log("사용자가 '네'를 선택했습니다.");
    missionhandleClose(); // 모달 닫기
    navigation.navigate('Home', { screen: 'HomeScreen', params: { showModal: true } }); // Home 탭으로 이동
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('CommunityHome')}>
          <MaterialIcons name="keyboard-arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>내 주변 안전 소식</Text>
        <TouchableOpacity style={styles.iconButton} onPress={() => setSearchModalVisible(true)}>
          <MaterialIcons name="search" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <CustomModal
        visible={missionModalVisible}
        onClose={missionhandleClose}
        onConfirm={missionhandleConfirm}
      />
      {loading ? (
        // 위치 정보 로딩 중 로딩 표시
        <ActivityIndicator size="large" color="#0000ff" style={styles.loadingIndicator} />
      ) : (
        <>
          {/* HOT 게시물 상단 표시 - 현재 비워둠 */}
          <View style={styles.hotBox}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.hotTitle}>
                {categoryEmojis[selectedCategory]} HOT
              </Text>


              {/* HOT 옆에 제목 배치, 위치 조정 */}
              {getHotPost() ? (
                <TouchableOpacity onPress={() => navigation.navigate('PostDetail', { post: getHotPost() })}>
                  <Text style={[styles.hotMessage, { marginLeft: 5, lineHeight: 20, paddingTop: 3 }]}>
                    {getHotPost().title
                      ? (getHotPost().title.length > 18
                        ? `${getHotPost().title.substring(0, 18)}...`
                        : getHotPost().title)
                      : '제목 없음'}
                  </Text>
                </TouchableOpacity>
              ) : (

                <Text style={styles.hotMessage}>    -</Text>
              )}

            </View>

            {getHotPost() && (
              <TouchableOpacity onPress={() => navigation.navigate('PostDetail', { post: getHotPost() })}>
                {/* 본문에서 굵은 글씨 제거 */}
                <Text style={[styles.hotMessage, { fontWeight: 'normal' }]}>
                  {getHotPost().message.length > 30 ? `${getHotPost().message.slice(0, 30)}...` : getHotPost().message}
                </Text>
                <Text style={styles.hotTimestamp}>{moment(getHotPost().timestamp).format('YY/MM/DD HH:mm')}</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* 카테고리 버튼 */}
          <View style={styles.categoryContainer}>
            {['전체', '교통', '화재', '재해', '주의'].map((category) => (
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
                  <View style={styles.postContent}>
                    {/* 텍스트 블록 (제목, 본문, 날짜) */}
                    <View style={styles.textContainer}>
                      {/* 제목 */}
                      <View style={styles.titlecontainer}>
                        <View style={[styles.listContainer, { backgroundColor: getCategoryColor(post.category) }]}>
                          <Text style={styles.listText}>{post.category}</Text>
                        </View>
                        <Text style={styles.titleText}>
                          {post.title.length > 20 ? `${post.title.substring(0, 20)}...` : post.title}
                        </Text>


                      </View>

                      {/* 본문 */}
                      <Text style={styles.postMessage}>
                        {post.message.includes('\n')
                          ? `${post.message.split('\n')[0].slice(0, 30)}...`
                          : post.message.length > 30
                            ? `${post.message.slice(0, 30)}...`
                            : post.message}
                      </Text>

                      {/* 댓글 수와 타임스탬프를 한 줄에 배치 */}
                      <View style={styles.commentTimestampContainer}>
                        <View style={styles.commentCountContainer}>
                          <Ionicons name="chatbubble-outline" size={14} color="#666" />
                          <Text style={styles.commentCountText}>{post.commentCount || 0}</Text>
                        </View>
                        <Text style={styles.timestamp}>{formatDate(post.timestamp)}</Text>
                      </View>
                    </View>

                    {/* 이미지 */}
                    {post.image ? (
                      <Image
                        source={{ uri: post.image }}
                        style={styles.postImage}
                      />
                    ) : null}
                  </View>
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
                  {isSearchSubmitted ? (  // 검색 버튼을 눌렀을 때만 결과를 표시
                    searchResults.length > 0 ? (
                      searchResults.map((post, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.searchResultContainer}
                          onPress={() => {
                            setSearchModalVisible(false);
                            navigation.navigate('PostDetail', { post });
                          }}
                        >
                          <View style={styles.searchResultContent}>
                            <Text style={styles.searchResultTitle}>
                              [{post.category}] {post.title}
                            </Text>
                            <Text style={styles.searchResultMessage}>
                              {post.message.length > 50 ? `${post.message.slice(0, 50)}...` : post.message}
                            </Text>
                            <Text style={styles.searchResultTimestamp}>
                              {moment(post.timestamp).format('YY/MM/DD HH:mm')}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))
                    ) : (
                      <View style={styles.noResultContainer}>
                        <Text style={styles.noResultText}>해당 검색어에 대한 결과가 없습니다.</Text>
                      </View>
                    )
                  ) : null}
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
    fontSize: 18,
    fontWeight: 'bold',
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
    fontSize: 16,
  },
  hotMessage: {
    fontSize: 15,
    color: '#333',
    marginBottom: 5,
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
    fontWeight: 'bold'
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
  searchResultContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  searchResultContent: {
    flexDirection: 'column',
  },
  searchResultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  searchResultMessage: {
    fontSize: 14,
    color: '#666',
    marginTop: 3,
  },
  searchResultTimestamp: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 3,
  },
  noResultContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noResultText: {
    fontSize: 16,
    color: '#999',
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
  postContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 10,
    flexDirection: 'row',  // 텍스트와 이미지를 가로로 정렬
    justifyContent: 'space-between',  // 텍스트와 이미지 간의 공간 분배
    alignItems: 'center',  // 수직 중앙 정렬
  },
  postContent: {
    flexDirection: 'row',  // 텍스트와 이미지를 가로로 배치
    flex: 1,
    justifyContent: 'space-between', // 텍스트와 이미지 사이 간격 확보
    alignItems: 'center', // 수직 중앙 정렬
  },
  textContainer: {
    flex: 1,  // 텍스트가 이미지 옆에서 충분한 공간을 차지하도록
    flexDirection: 'column',  // 텍스트는 수직 배치
    marginRight: 10, // 이미지와 텍스트 간의 간격
  },
  postText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,  // 제목과 본문 사이 간격
  },
  postMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,  // 본문과 날짜 사이 간격
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  postImage: {
    width: 55,   // 이미지 너비 (텍스트 블록 높이에 맞춰 조정)
    height: 55,  // 이미지 높이
    borderRadius: 5,  // 이미지 모서리 둥글게 처리
  },
  commentTimestampContainer: {
    flexDirection: 'row',  // 한 줄로 배치
    alignItems: 'center',  // 수직 중앙 정렬
  },
  commentCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,  // 댓글 수와 타임스탬프 사이의 간격
  },
  commentCountText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5, // 말풍선 아이콘과 댓글 수 텍스트 사이의 간격
  },
  titlecontainer: {
    flexDirection: 'row', // 수평 방향으로 배치
    alignItems: 'center', // 세로 가운데 정렬
    marginBottom: 4, // 아래쪽 여백
  },
  titleText: {
    fontSize: 16,
    fontWeight: 'bold',
    // flex: 1, // 필요에 따라 주석처리
  },
  listContainer: {
    borderRadius: 10, // 카테고리 배경 둥글게
    padding: 3, // 카테고리 안쪽 여백
    paddingLeft: 7,
    paddingRight: 7,
    marginLeft: 2, // 제목과 카테고리 사이의 간격을 없앰
    marginRight: 4,
    opacity: 0.8,
  },
  listText: {
    color: 'black',
    // fontWeight: 'nomal',
    // marginLeft: 5,
    fontSize: 13,
  },
});
