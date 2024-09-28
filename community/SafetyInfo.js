import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Dimensions, Modal, TextInput, TouchableWithoutFeedback, ActivityIndicator, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import BottomTabBar from '../BottomTabBar';
import axios from 'axios'; // Axios 임포트
import config from '../config';

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
  const categories = ['전체', '자연', '사회', '생활'];

  useEffect(() => {
    if (filter) {
      setSelectedCategory(filter);
    }
  }, [filter]);

  // 백엔드에서 데이터 가져오기
  useEffect(() => {
    const fetchSafetyInfos = async () => {
      try {
        const response = await axios.get(`${config.apiUrl}/safetyInfos`); // API URL로 변경
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
        const imageResponse = await axios.get(`${config.apiUrl}/cardnews/${infoId}`);
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
    setInfoModalVisible(true);
    await fetchImages(info.id); // 선택된 정보의 이미지 목록 가져오기

  };

  const fetchImages = async (infoId) => {
    try {
      const response = await axios.get(`${config.apiUrl}/cardnews/${infoId}`); // 해당 정보 ID로 이미지 가져오기
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

  const handleSearch = () => {
    if (searchQuery.trim() !== '') {
      setSearchHistory(prevHistory => [searchQuery, ...prevHistory]);
      setSearchQuery('');
    }
  };

  const deleteSearchHistoryItem = (index) => {
    setSearchHistory(prevHistory => prevHistory.filter((_, i) => i !== index));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };
  
  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
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

      {/* 로딩 상태일 때 표시 */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <>
          <View style={styles.bannerContainer}>
        <ScrollView
          ref={scrollViewRef} // ScrollView에 ref 연결
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.banner}
          scrollEventThrottle={16} // 이벤트 업데이트 빈도 설정
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
              <Text style={styles.bannerSubtitle}>{banner.subtitle}</Text>
              <Text style={styles.bannerText}>{banner.title}</Text>
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
                    {/* 이미지 배경 설정 */}
                    {coverImages[info.id] && (
                      <Image
                        source={{ uri: coverImages[info.id] }} // 카드의 표지 이미지를 표시
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
              ))}
            </View>
          </ScrollView>
        </>
      )}

      <BottomTabBar navigation={navigation} />

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
            {/* <View style={styles.grayRectangle}> */}
              {images.length > 0 ? (
                <>
                  <Image
                    key={currentImageIndex}
                    source={{ uri: images[currentImageIndex] }} // 현재 이미지 URL 사용
                    style={styles.cardImage}
                    resizeMode="contain" // 비율을 유지하며 컨테이너 안에 맞춤
                    onError={(error) => console.error('Image loading error:', error.nativeEvent.error)}
                  />
                  <View style={styles.imageNavigation}>
                    <TouchableOpacity onPress={handlePrevImage} disabled={images.length === 0}>
                      <Text style={styles.navigationText}>이전</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleNextImage} disabled={images.length === 0}>
                      <Text style={styles.navigationText}>다음</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <Text>No images available.</Text>
              )}
            </View>
          </View>
        {/* </View> */}
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
