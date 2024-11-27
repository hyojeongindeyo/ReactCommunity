import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Dimensions, Alert, Modal, TextInput, TouchableWithoutFeedback, ActivityIndicator, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
// import BottomTabBar from '../BottomTabBar';
import axios from 'axios'; // Axios 임포트
import config from '../config';
import CustomModal from '../CustomModal'; // 모달 컴포넌트 import

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SafetyInfo = ({ navigation, route }) => {
  const { filter } = route.params || { filter: '전체' };
  const [selectedCategory, setSelectedCategory] = useState(filter);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [selectedInfo, setSelectedInfo] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const [safetyInfos, setSafetyInfos] = useState([]); // 백엔드에서 불러온 데이터 저장
  const [loading, setLoading] = useState(true); // 로딩 상태 관리
  const [images, setImages] = useState([]); // 선택된 정보의 이미지 목록 저장
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // 현재 보고 있는 이미지 인덱스
  const [coverImages, setCoverImages] = useState({}); // 카드의 표지 이미지를 저장하는 객체
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0); // 현재 배너 인덱스
  const [randomBanners, setRandomBanners] = useState([]); // 랜덤 배너 목록
  const scrollViewRef = useRef(null); // ScrollView의 ref 생성
  const categories = ['전체', '재해', '주의', '생활', '화재'];
  const [searchResults, setSearchResults] = useState([]); // 검색 결과 상태 추가
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [userData, setUserData] = useState(null);
  const [modalVisible, setModalVisible] = useState(false); // 모달의 상태 변수 선언
  const [missionModalVisible, setMissionModalVisible] = useState(false); // 새로운 상태 변수

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
      case '생활':
        return '#DBBBDF'; // 
      default:
        return '#F3F3F3'; // 기본 색상
    }
  };

  const bannerImages = {
    1: require('../assets/banner_typhoon_safety.png'),
    2: require('../assets/banner_earthquake_plan.png'),
    3: require('../assets/banner_fire_prevention.png'),
    4: require('../assets/banner_vehicle_safety.png'),
    5: require('../assets/banner_heat_precaution.png'),
    6: require('../assets/banner_flood_preparedness.png'),
    7: require('../assets/banner_water_safety.png'),
    8: require('../assets/banner_heat_safety.png'),
    9: require('../assets/banner_disaster_guide.png'),
  };

  useEffect(() => {
    if (filter) {
      setSelectedCategory(filter);
    }
  }, [filter]);

  // 백엔드에서 데이터 가져오기
  useEffect(() => {
    const fetchSafetyInfos = async () => {
      try {
        const response = await axios.get(`${config.apiUrl}/safetyinfos`); // API URL로 변경
        setSafetyInfos(response.data); // API로부터 받은 데이터를 저장
        await fetchCoverImages(response.data); // 이 부분 추가
        setRandomBanners(selectRandomBanners(response.data)); // 랜덤 배너 선택
        setLoading(false); // 데이터 로딩 완료
      } catch (error) {
        console.error('Error fetching safety info:', error);
        setLoading(false); // 에러 발생 시에도 로딩 상태 해제
      }
    };

    fetchSafetyInfos();
  }, []);

  // 4초마다 배너 변경
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % randomBanners.length;
        scrollViewRef.current?.scrollTo({ x: nextIndex * SCREEN_WIDTH, animated: true });
        return nextIndex;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [randomBanners]);

  // 모든 카드의 표지 이미지를 가져오는 함수
  const fetchCoverImages = async (infos) => {
    const images = {};
    for (const info of infos) {
      const image = await fetchCoverImage(info.id);
      if (image) {
        images[info.id] = image; // 각 카드의 ID를 키로 하여 이미지 URL을 저장
      }
    }
    setCoverImages(images); // 모든 표지 이미지를 상태에 저장
  };

  // 각 게시물의 표지 이미지를 불러오는 함수
  const fetchCoverImage = async (infoId) => {
    try {
      const imageResponse = await axios.get(`${config.apiUrl}/safetyinfos/cardnews/${infoId}`);
      return imageResponse.data[0]; // 첫 번째 이미지를 반환
    } catch (error) {
      console.error('Error fetching cover image:', error);
      return null; // 이미지가 없을 경우 null 반환
    }
  };
  // 랜덤으로 배너 세 개를 선택하는 함수
  const selectRandomBanners = (infos) => {
    // infos 배열을 복사하여 원본을 변경하지 않음
    const shuffled = [...infos].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3); // 세 개의 랜덤 배너 선택
  };

  const filteredInfos = selectedCategory === '전체' ? safetyInfos : safetyInfos.filter(info => info.category === selectedCategory);

  const handleInfoPress = async (info) => {
    setSelectedInfo(info);
    await fetchImages(info.id);

    try {
      const response = await axios.get(`${config.apiUrl}/missions/user/${userData.id}`);
      const missions = response.data.missions;
      const missionIdToCheck = 2; // 미션 ID

      // 게스트 계정인 경우 미션 모달은 띄우지 않고 info 모달만 띄우기
      if (userData.role === 'guest') {
        console.log('게스트 계정은 미션을 완료할 수 없습니다.');
        setInfoModalVisible(true); // 정보 모달 열기
        return;
      }

      // 미션이 완료되지 않았으면, 미션 모달을 열기
      if (!missions.includes(missionIdToCheck)) {
        // 미션을 완료하기 전에 API 호출
        await axios.post(`${config.apiUrl}/missions/complete-mission`, {
          userId: userData.id,
          missionId: missionIdToCheck
        });
        console.log("미션 완료");
        if (userData.role === 'guest') {
          console.log('게스트 계정은 미션을 완료할 수 없습니다.');
          return;
        }

        setMissionModalVisible(true); // 미션 완료 시 새로운 모달 표시
      } else {
        setInfoModalVisible(true); // 기존 모달 표시
        console.log("이미 미션을 완료하셨습니다.");
        // 미션 모달을 열 필요가 없으므로 상태를 변경하지 않음
        setMissionModalVisible(false); // 이 부분은 필요 없습니다.
      }
    } catch (error) {
      console.error('오류:', error.response ? error.response.data : error);
    }
  };

  // 모달의 상태가 변경될 때마다 확인
  useEffect(() => {
    console.log('모달 비지블 상태:', missionModalVisible);
  }, [missionModalVisible]);

  const missionhandleClose = () => {
    setMissionModalVisible(false); // 새로운 모달 닫기
    setInfoModalVisible(false); // 기존 모달 표시
  };

  const missionhandleConfirm = () => {
    console.log("사용자가 '네'를 선택했습니다.");
    missionhandleClose(); // 모달 닫기
    // navigation.replace('HomeScreen', { showModal: true }); // 홈 화면으로 이동
    navigation.navigate('Home', { screen: 'HomeScreen', params: { showModal: true } })

  };

  useEffect(() => {
    const fetchUserSession = async () => {
      try {
        const response = await axios.get(`${config.apiUrl}/users/session`, { withCredentials: true });
        setUserData(response.data); // 사용자 정보 상태에 저장
      } catch (error) {
        console.error('Error fetching user session:', error);
      }
    };

    fetchUserSession();
  }, []);

  const fetchImages = async (infoId) => {
    try {
      const response = await axios.get(`${config.apiUrl}/safetyinfos/cardnews/${infoId}`); // 해당 정보 ID로 이미지 가져오기
      setImages(response.data); // 가져온 이미지 목록 설정
    } catch (error) {
      console.error('Error fetching images:', error);
      setImages([]); // 에러 발생 시 이미지 목록 초기화
    }
  };

  const handleBannerPress = (banner) => {
    const info = safetyInfos.find(info => info.title === banner.title);
    if (info) {
      handleInfoPress(info);
    }
  };

  // 검색 처리 (검색 결과 필터링 및 설정)
  const handleSearch = async () => {
    setSearchPerformed(true); // 검색이 수행되었음을 표시

    if (searchQuery.trim() !== '') {
      try {
        // 백엔드에 검색 요청 보내기
        const response = await axios.post(`${config.apiUrl}/safetyinfos/search`, { searchQuery });

        // 백엔드에서 가져온 검색 결과를 searchResults로 설정
        setSearchResults(response.data);
        setSearchHistory(prevHistory => [searchQuery, ...prevHistory]); // 검색어 기록 저장
      } catch (error) {
        console.error('Error during search:', error); // 에러 메시지 출력
      }
    } else {
      setSearchResults([]); // 검색어가 비어있을 때 검색 결과를 빈 배열로 설정
    }

    setSearchQuery(''); // 검색어 초기화
  };

  useEffect(() => {
    if (infoModalVisible) {
      setCurrentImageIndex(0); // 모달이 열리면 즉시 첫 번째 이미지로 설정
    }
  }, [infoModalVisible]);

  // 모달이 처음 열릴 때 searchResults와 searchPerformed 초기화
  useEffect(() => {
    if (searchModalVisible) {
      setSearchResults([]); // 검색 모달이 열릴 때 searchResults를 빈 배열로 초기화
      setSearchPerformed(false); // 검색 수행 여부 초기화
    }
  }, [searchModalVisible]);

  const handleNextImage = () => {
    if (currentImageIndex < images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1); // 마지막 이미지가 아닐 때만 넘어가게
    }
  };

  // "이전" 버튼 클릭 시 처리
  const handlePrevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1); // 첫 번째 이미지가 아닐 때만 넘어가게
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => {
          navigation.goBack()
        }}>
          <MaterialIcons name="keyboard-arrow-left" size={30} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>안전 정보</Text>
        <TouchableOpacity style={styles.iconButton} onPress={() => setSearchModalVisible(true)}>
          <MaterialIcons name="search" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <CustomModal
        visible={missionModalVisible}
        onClose={missionhandleClose}
        onConfirm={missionhandleConfirm}
      />

      {/* 로딩 상태일 때 표시 */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <>
          <View style={styles.bannerContainer}>
            <ScrollView
              ref={scrollViewRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              style={styles.banner}
              scrollEventThrottle={16}
            >
              {randomBanners.map((banner, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.bannerItem,
                    index === 0 ? styles.firstBanner : index === 1 ? styles.secondBanner : styles.thirdBanner,
                  ]}
                  onPress={() => handleBannerPress(banner)}
                >
                  {/* 배너 표지 이미지 변경 */}
                  {bannerImages[banner.id] && (
                    <Image
                      source={bannerImages[banner.id]} // 배너에 해당하는 이미지를 설정
                      style={styles.bannerImage} // 배너 이미지 스타일
                    />
                  )}
                </TouchableOpacity>
              ))}
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
                    {/* 카드 표지 이미지 (이건 그대로 유지) */}
                    {coverImages[info.id] && (
                      <Image
                        source={{ uri: coverImages[info.id] }} // 카드 표지 이미지
                        style={styles.cardImageBackground} // 배경 이미지 스타일
                        opacity={0.45}
                      />
                    )}
                    <Text style={styles.infoTitle}>{info.title}</Text>
                  </View>
                  <View style={styles.infoFooter}>
                    <Text style={styles.infoDate}>{info.date}</Text>
                    <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(info.category) }]}>
                      <Text style={styles.categoryBadgeText}>{info.category}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </>
      )}

      {/* Info Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={infoModalVisible}
        onRequestClose={() => setInfoModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedInfo?.title}</Text>
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setInfoModalVisible(false)}>
              <Text style={styles.modalCloseText}>X</Text>
            </TouchableOpacity>
            {images.length > 0 ? (
              <>
                <Image
                  key={currentImageIndex}
                  source={{ uri: images[currentImageIndex] }} // 현재 이미지 URL 사용
                  style={styles.cardImage}
                  resizeMode="contain"
                  onError={(error) => console.error('Image loading error:', error.nativeEvent.error)}
                />
                <View style={styles.imageNavigation}>
                  <TouchableOpacity 
                    onPress={handlePrevImage} 
                    disabled={currentImageIndex === 0} 
                    style={{ opacity: currentImageIndex === 0 ? 0 : 1 }}
                  >
                    <Text style={styles.navigationText}>이전</Text>
                  </TouchableOpacity>
                  <Text style={styles.pageInfo}>
                    {currentImageIndex + 1} / {images.length}
                  </Text>
                  <TouchableOpacity 
                    onPress={handleNextImage} 
                    disabled={currentImageIndex === images.length - 1} 
                    style={{ opacity: currentImageIndex === images.length - 1 ? 0 : 1 }}
                  >
                    <Text style={[styles.navigationText, currentImageIndex === images.length - 1 ? { opacity: 0 } : {}]}>
                      다음
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <Text>No images available.</Text>
            )}
          </View>
        </View>
      </Modal>

      {/* Search Modal */}
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
                    <MaterialIcons name="keyboard-arrow-left" size={30} color="black" />
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
                  {searchPerformed && searchResults.length > 0 ? (
                    searchResults.map((info, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.searchResultContainer}
                        onPress={() => {
                          setSearchModalVisible(false);
                          handleInfoPress(info); // 카드 뉴스 상세 정보로 이동
                        }}
                      >
                        <View style={styles.infoCard}>
                          {/* 이미지 배경 설정 */}
                          {coverImages[info.id] && (
                            <Image
                              source={{ uri: coverImages[info.id] }} // 카드의 대표 이미지를 표시
                              style={styles.cardImageBackground} // 배경 이미지 스타일
                              opacity={0.45}
                            />
                          )}
                          <Text style={styles.infoTitle}>{info.title}</Text>
                        </View>
                        <View style={styles.infoFooter}>
                          <Text style={styles.infoDate}>{info.date}</Text>
                          <View style={styles.categoryBadge}>
                            <Text style={styles.categoryBadgeText}>{info.category}</Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))
                  ) : searchPerformed ? (
                    <View style={styles.noResultContainer}>
                      <Text style={styles.noResultText}>해당 검색어에 대한 결과가 없습니다.</Text>
                    </View>
                  ) : null}
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
    marginBottom: 80,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: '5%',
    paddingTop: '10%',
    paddingBottom: '3%',
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
    width: '100%', // 배너가 화면 너비에 맞게 설정
    marginBottom: 10, // 배너와 다른 요소 간의 간격
  },
  banner: {
    height: '100%',
    backgroundColor: '#e0e0e0',
  },
  bannerItem: {
    width: SCREEN_WIDTH,  // 화면 너비에 맞게 배너 크기 설정
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 0,  // 배너 간의 간격을 없애거나 최소화
    borderRadius: 10,
  },
  bannerImage: {
    width: SCREEN_WIDTH,  // 배너 이미지가 화면 너비에 맞게 설정
    height: '100%',       // 배너의 높이에 맞게 설정
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
    position: 'relative', // 부모 뷰에 상대적 위치 설정
    overflow: 'hidden', // 이미지가 카드 밖으로 나가지 않도록
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    // color: 'white',
    textAlign: 'left',
    backgroundColor: 'rgba(255, 255, 255, 0.6)', // 흐릿한 하얀색 배경

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
  pageInfo: {
    fontSize: 14,
    marginHorizontal: 10,
  },
  categoryBadge: {
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  categoryBadgeText: {
    fontSize: 12,
    color: 'black',
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
    fontSize: 20,
    fontWeight: 'bold',
    // marginBottom: 5,
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
  // grayRectangle: {
  //   width: '100%',
  // },
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
    width: '100%',
  },
  backButton: {
    marginRight: 10, // 검색창과 버튼 사이 여백 추가
    marginTop: -20, // 여백을 줄여 버튼 위치를 위로 올림
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
    marginTop: -12, // 여백을 줄여 버튼 위치를 위로 올림
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
  cardImage: {
    width: '100%',
    height: 300, // 원하는 높이로 조정
    marginVertical: 5,
  },
  imageNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  navigationText: {
    fontSize: 18,
    color: '#007BFF', // 버튼 색상
    fontWeight: 'bold',
  },
  cardImageBackground: {
    position: 'absolute', // 이미지 위치 설정
    top: 0, // 카드의 상단에 위치
    left: 0, // 카드의 왼쪽에 위치
    right: 0, // 카드의 오른쪽에 맞춤
    bottom: 0, // 카드의 하단에 맞춤
    borderRadius: 10, // 카드의 모서리 둥글게 만들기

  },

});


export default SafetyInfo;
