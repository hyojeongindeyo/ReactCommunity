import React, { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { StatusBar } from 'expo-status-bar';
import { Modal, View, Text, Image, StyleSheet, Dimensions, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { MaterialIcons, AntDesign } from '@expo/vector-icons';
import Weather from './Weather'; // Weather 컴포넌트 import
import Swiper from 'react-native-swiper';
import axios from 'axios';
import config from '../config'; // config 파일 import
import AsyncStorage from '@react-native-async-storage/async-storage'; // AsyncStorage import
import BagCombinedModal from '../BagCombinedModal'; // MissionModal import
// import EnlargeModal from '../EnlargeModal'; // EnlargeModal import

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const App = ({ navigation, route }) => {
  const [posts, setPosts] = useState([]); // posts 상태 정의
  const [userData, setUserData] = useState(null);
  const [city, setCity] = useState('Loading...');
  const [location, setLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [modalVisible, setModalVisible] = useState(false); // 모달 상태 정의
  const scrollViewRef = useRef(null);
  const [userLocation, setUserLocation] = useState(''); // 위치 정보를 저장할 상태 변수
  const [filteredPosts, setFilteredPosts] = useState([]); // 필터링된 게시물을 저장할 상태 변수
  const [safetyTip, setSafetyTip] = useState({}); // 초기값을 빈 객체로 설정
  const [error, setError] = useState(null);
  const [userMissions, setUserMissions] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null); // 확대할 이미지의 상태
  const [selectedName, setSelectedName] = useState(null);
  const [selectedDescription, setSelectedDescription] = useState(null);
  const [enlargeModalVisible, setEnlargeModalVisible] = useState(false); // 이미지 확대 모달

  const handleImagePress = (image, name, description) => {
    setSelectedImage(image);
    setSelectedName(name);
    setSelectedDescription(description); // 설명 설정
    setModalVisible(false);
    setEnlargeModalVisible(true);
  };

  const handleCloseEnlargeModal = () => {
    setEnlargeModalVisible(false);
    setModalVisible(true);
  };

  const missionImages = {
    1: {
      image: require('../assets/flashlight.png'),
      name: '손전등',
      description: '어두운 곳을 밝혀주는 손전등이에요. 🌟',
    },
    2: {
      image: require('../assets/whistle.png'),
      name: '호루라기',
      description: '위험할 땐 호루라기를 불어요. 🚨',
    },
    3: {
      image: require('../assets/compass.png'),
      name: '나침반',
      description: '길을 잃었을 때 유용한 나침반이에요. 🧭',
    },
    4: {
      image: require('../assets/fire_extinguisher.png'),
      name: '소화기',
      description: '불이 나면 소화기로 안전하게 끄세요. 🔥',
    },
    5: {
      image: require('../assets/first_aid_kit.png'),
      name: '구급상자',
      description: '부상을 치료할 수 있는 구급상자에요. 🚑',
    },
    6: {
      image: require('../assets/water.png'),
      name: '물',
      description: '갈증을 해소해주는 시원한 물이에요. 💧',
    },
};



  // 위치 가져오기 및 데이터 호출
  useEffect(() => {
    fetchUserSession();
    fetchPosts(); // 게시물 데이터 가져오기 호출
    fetchMissionSession();

    // 5초마다 fetchPosts 호출
    const intervalId = setInterval(fetchPosts, 5000);

    // 컴포넌트 언마운트 시 interval 제거
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const fetchRandomTip = async () => {
      try {
        const response = await axios.get(`${config.apiUrl}/tips/random-tip`); // API 호출
        console.log('받은 팁:', response.data); // 받은 팁을 콘솔에 출력
        setSafetyTip(response.data); // 전체 데이터 객체로 설정
      } catch (error) {
        console.error('팁을 가져오는 데 실패했습니다:', error);
        setError('팁을 가져오는 데 실패했습니다.');
      }
    };

    fetchRandomTip(); // 컴포넌트가 마운트될 때 호출
  }, []);

  useEffect(() => {
    if (route.params?.showModal) {
      setModalVisible(true);
    }
  }, [route.params?.showModal]);

  const fetchMissionSession = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/users/session`, { withCredentials: true });
      console.log('User session data:', response.data);
      const userId = response.data.id; // 사용자 ID 가져오기

      // 사용자 미션 가져오기
      const missionsResponse = await axios.get(`${config.apiUrl}/missions/user/${userId}`, { withCredentials: true });
      console.log('User Missions:', missionsResponse.data); // 미션 데이터 출력
      setUserMissions(missionsResponse.data.missions || []); // 미션 상태 설정

      // // 모달 표시 여부를 설정
      // if (route.params?.showModal) {
      //   setModalVisible(true);
      // }

    } catch (error) {
      if (error.response) {
        console.error('데이터 오류:', error.response.data);
      } else {
        console.error('Error fetching user session:', error.message);
      }
      setUserMissions([]);
    }
  };

  // 컴포넌트가 마운트될 때 fetchMissionSession 호출
  React.useEffect(() => {
    fetchMissionSession();
  }, []); // 의존성 배열에 빈 배열을 주어 컴포넌트가 마운트될 때만 호출

  useEffect(() => {
    if (modalVisible) {
      fetchMissionSession(); // 모달이 열릴 때마다 미션을 다시 가져옵니다.
    }
  }, [modalVisible]);




  // 게시물 데이터 가져오기
  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/posts`);
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const fetchUserSession = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/users/session`, { withCredentials: true });
      setUserData(response.data);
    } catch (error) {
      console.error('Error fetching user session:', error);
    }
  };

  useEffect(() => {
    const fetchLocation = async () => {
      setLoadingLocation(true); // 위치 정보 로드 시작 시 로딩 상태 활성화
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        setLoadingLocation(false);
        return;
      }

      try {
        // 빠르게 위치를 얻기 위해 정확도를 낮춤
        let loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced
        });

        setLocation(loc.coords); // 위치 상태 업데이트

        const address = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude
        });

        if (address.length > 0) {
          const { city, district, street } = address[0];
          const userAddress = `${city} ${district || street}`;
          setUserLocation(userAddress); // 시(city)와 동(district) 정보 설정
          await AsyncStorage.setItem('userLocation', userAddress); // 위치 캐싱
        }
      } catch (error) {
        console.error('Error fetching location:', error);
      } finally {
        setLoadingLocation(false); // 위치 정보 로드 완료 후 로딩 상태 해제
      }
    };

    // 캐시된 위치 먼저 가져오기
    const getCachedLocation = async () => {
      const cachedLocation = await AsyncStorage.getItem('userLocation');
      if (cachedLocation) {
        setUserLocation(cachedLocation);
      }
    };

    getCachedLocation(); // 캐시된 위치 먼저 가져오기
    fetchLocation(); // 새 위치 정보 요청
  }, []);

  // 위치 정보 변경 시 필터링된 게시물 업데이트
  useEffect(() => {
    if (userLocation && posts.length > 0) {
      const formattedUserLocation = userLocation.replace(' ', ', '); // 위치 형식 맞추기
      const filtered = posts.filter(post => post.location_address === formattedUserLocation);
      setFilteredPosts(filtered);
    }
  }, [userLocation, posts]);

  const getCategoryPost = (category) => {
    return posts.find(post => post.category === category) || null;
  };

  const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(timestamp);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1 필요
      const year = String(date.getFullYear() % 100).padStart(2, '0'); // 두 자리 연도
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');

      return `${year}/${month}/${day} ${hours}:${minutes}`;
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return timestamp;
    }
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
      case '생활':
        return '#DBBBDF'; // 
      default:
        return '#F3F3F3'; // 기본 색상
    }
  };


  return (
    <View style={styles.allItems}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('MenuPage')}>
          <MaterialIcons name="menu" size={24} color="black" />
        </TouchableOpacity>
        <Image source={require('../assets/logo.png')} style={styles.logoImage} resizeMode="contain" />
        <MaterialIcons name="search" size={24} style={styles.logohidden} color="black" />
      </View>

      <View style={styles.container}>
        {/* 평안팁 부분 */}
        <View style={styles.tips}>
          <Image source={require('../assets/tips.png')} style={styles.tipImage} resizeMode="contain" />
          <View style={styles.tipTitles}>
            <Text style={styles.tipstitle}>[오늘의 평안팁]</Text>
            <Text style={styles.condition}>{safetyTip.category}</Text>
          </View>
          <View style={styles.verticalLine}></View>
          <Text style={styles.tip}>{safetyTip.tip}</Text>
        </View>

        <Text style={styles.pyeongT}>
          {userData ? `${userData.nickname}님의 평안이` : '사용자 정보 로딩 중...'}
        </Text>

        {/* 날씨 정보 */}
        <View style={styles.rowcontainer}>
          {/* 50% 왼쪽: 사진 */}
          <View style={styles.leftContainer}>

            <Image source={require('../assets/pyeong.png')} style={styles.pyeong} resizeMode="contain" />
            <Image source={require('../assets/bag.png')} style={styles.bag} resizeMode="contain" />
          </View>

          {/* 50% 오른쪽: 날씨, 평안, 배너 */}
          <View style={styles.rightContainer}>
            {/* 날씨 정보 */}
            <View style={styles.weather}>
              <Text style={styles.locationText}>현재 위치: {userLocation}</Text>
              {location && (

                <Weather latitude={location.latitude} longitude={location.longitude} city={city} />

              )}
            </View>


            {/* 평안이 가방 모달입니다 */}
            {/* 평안이 가방 모달 버튼 */}
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <View style={styles.inpyeongbag}>
                <Text style={styles.inpyeongtext}>평안이의 가방 속</Text>
                {/* 아이템 이미지들을 추가 */}
                <View style={styles.itemImagesContainer}>
                  {userMissions && userMissions.length > 0 ? (
                    <>
                      {userMissions.slice(0, 3).map((missionId) => (
                        <View key={missionId} style={styles.missionContainer}>
                          {missionImages[missionId] && missionImages[missionId].image ? (
                            <Image
                              source={missionImages[missionId].image}
                              style={styles.itemImage}
                            />
                          ) : (
                            <Text style={styles.noImageText}>
                              미션 아이디 {missionId}에 대한 이미지가 없습니다.
                            </Text>
                          )}
                        </View>
                      ))}
                      {userMissions.slice(3, 6).map((missionId) => (
                        <View key={missionId} style={styles.missionContainer}>
                          {missionImages[missionId] && missionImages[missionId].image ? (
                            <Image
                              source={missionImages[missionId].image}
                              style={styles.itemImage}
                            />
                          ) : (
                            <Text style={styles.noImageText}>
                              미션 아이디 {missionId}에 대한 이미지가 없습니다.
                            </Text>
                          )}
                        </View>
                      ))}
                    </>
                  ) : (
                    <Text style={styles.noItemsText}>아이템이 없습니다.</Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>


            {/* 평안이의 안전 가방 모달 */}
            <BagCombinedModal
              modalVisible={modalVisible}
              setModalVisible={setModalVisible}
              userMissions={userMissions}
              handleImagePress={handleImagePress}
              missionImages={missionImages}
              userData = {userData}
              

            />

            {/* <EnlargeModal
              enlargeModalVisible={enlargeModalVisible}
              setEnlargeModalVisible={setEnlargeModalVisible}
              selectedImage={selectedImage}
              selectedName={selectedName} // name도 함께 전달
              selectedDescription={selectedDescription} // name도 함께 전달
              handleCloseEnlargeModal={handleCloseEnlargeModal}
            /> */}

          </View>
        </View>


        <View style={styles.horizontalLine}></View>
        <TouchableOpacity
          style={styles.iconContainer}
          onPress={() => navigation.navigate('Community', { screen: 'NearbySafety', params: { filter: '전체' } })}
        >
          <View style={styles.icons}>
            <MaterialIcons name="health-and-safety" size={25} color="rgb(146, 171, 168)" />
          </View>
          <Text style={styles.safetyText}>내 주변 안전소식</Text>
          <View style={styles.icons}>
            <AntDesign name="right" size={10} color="black" style={{ marginLeft: 2, transform: [{ scaleX: 1.2 }, { scaleY: 1.4}] }}/>
          </View>
        </TouchableOpacity>

        <View style={styles.safe}>
          {['교통', '화재', '재해', '주의'].map((category, index) => {
            const filteredPost = filteredPosts.find(filteredPost => filteredPost.category === category);

            return (
              <View key={index}>
                {filteredPost ? (
                  <TouchableOpacity
                    style={styles.safebox}
                    onPress={() => navigation.navigate('Community', { screen: 'PostDetail', params: { post: filteredPost, fromHome:true } })}

                    // onPress={() => navigation.navigate('PostDetail', { post: filteredPost })}
                  >
                    <View style={styles.safetyContent}>
                      <View style={[styles.listContainer, { backgroundColor: getCategoryColor(category) }]}>
                        <Text style={styles.safecategory}>{category}</Text>
                      </View>
                      <Text style={styles.safetitle}>
                        {filteredPost.title.length > 20 ? `${filteredPost.title.substring(0, 20)}...` : filteredPost.title}
                      </Text>
                    </View>
                    <Text style={styles.safetime}>{formatTimestamp(filteredPost.timestamp)}</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.safebox}>
                    <View style={styles.safetyContent}>
                      <View style={[styles.listContainer, { backgroundColor: getCategoryColor(category) }]}>
                        <Text style={styles.safecategory}>{category}</Text>
                      </View>
                      <Text style={styles.safetitle} numberOfLines={1} ellipsizeMode="tail">
                        {`${category}에 대한 게시물이 아직 없습니다.`}
                      </Text>
                    </View>
                    <Text style={styles.safetime}>소식을 남겨주세요!</Text>
                  </View>
                )}
                {index < 3 && <View style={styles.separator} />}
              </View>
            );

          })}
        </View>

        <StatusBar style="auto" />
      </View>


    </View >
  );
};



const styles = StyleSheet.create({
  allItems: {
    flex: 1,
    paddingTop: '7%',
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: '5%',
    paddingVertical: '3%',
    backgroundColor: '#fff',
  },
  iconButton: {
    padding: 10,
  },

  logoImage: {
    aspectRatio: 1,
    width: '12%', // 픽셀 단위로 설정
  },
  logohidden: {
    opacity: 0,
  },


  container: {
    paddingLeft: '3%',
    paddingRight: '3%',
    paddingTop: 0,

  },

  tips: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: "#ADADAD",
    padding: '0.5%',
    borderRadius: 25,
    width: '100%',
    shadowColor: '#000', // 그림자의 색상
    shadowOffset: { width: 1, height: 1 }, // 그림자의 위치 조정
    shadowOpacity: 0.3, // 그림자의 불투명도
    shadowRadius: 5, // 그림자의 모서리 반경
  },
  tipTitles: {
    flexDirection: 'column',
    alignItems: "center",
    marginRight: '5%',
  },
  tipstitle: {
    fontWeight: 'bold',
    fontSize: 15,

  },
  condition: {
    marginTop: 5,
    fontSize: 15,
    fontWeight: 'bold',
  },
  tip: {
    marginLeft: 10,
    alignItems: "center",
    marginRight: 10,
    fontSize: 15,
  },
  tipImage: {
    width: '8%',
    marginRight: '5%',
    marginLeft: '2%',

  },
  verticalLine: {
    height: '60%', // 세로선의 높이
    width: 1, // 세로선의 너비
    backgroundColor: 'black', // 세로선의 배경색
    marginHorizontal: 5, // 텍스트와 세로선 사이의 간격
    // alignItems: "center",
    alignSelf: "center"
  },
  locationText: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 0, // 아래쪽 마진을 제거합니다
    paddingTop: 0, // 위쪽 패딩을 제거합니다
    // alignItems: "right",
    // paddingTop: 20,
    // marginBottom: 10,
  },
  weather: {
    // paddingLeft: 10,
    width: '100%',
    // paddingTop: '10%'
  },
  // weather content style 설정
  rowcontainer: {
    flexDirection: 'row', // 양옆으로 나란히 배치
    width: '100%',
    // height: '100%',
  },
  leftContainer: {
    width: '50%', // 화면의 왼쪽 50% 차지
    justifyContent: 'center',
    // alignItems: 'center',
    height: 200, // height를 제한합니다.
  },
  rightContainer: {
    width: '50%', // 화면의 오른쪽 50% 차지
    // paddingLeft: 10, // 오른쪽에 약간의 여백 추가
    justifyContent: 'center',
    alignItems: 'center',
    // paddingTop: '20%',
    // padding: 0,
    height: 200, // height를 제한합니다.
  },
  pyeong: {
    width: '50%', // 큰 이미지
    marginBottom: 10,
    height: '80%',
    marginLeft: 10,


  },
  bag: {
    width: '30%', // 작은 가방 이미지
    position: 'absolute',
    // top: '50%',
    // top: 0,
    top: '40%',
    right: '10%',
    height: '50%',

  },
  weatherContent: {
    // marginBottom: 10,
    // padding: 0,
  },
  pyeongT: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 20,
  },

  banners: {
    width: '100%',
    height: 100, // 배너의 높이를 충분히 설정합니다.
    // marginTop: '%',
    padding: 0, // 여기가 여백의 원인일 수 있음


    // overflow: 'hidden', // 오버플로우를 숨깁니다.
  },

  bannerImage: {
    alignSelf: 'center', // 이미지를 부모 컨테이너 내에서 가운데 정렬
    resizeMode: "contain", // 이미지를 잘리지 않게 조절합니다.
    width: '100%', // 배너 너비를 100%로 설정합니다.
    marginTop: 10,
    height: '90%',
    // height: '100%', // 배너 높이를 100%로 설정합니다.
  },




  imageContainer: {
    flexDirection: "row",
    alignContent: "center",
    width: '40%'
  },
  // pyeong: {
  //   paddingTop: 10,
  //   marginTop: 5,
  //   width: '100%'
  // },
  // bag: {
  //   width: '50%',
  //   height: '30%',
  //   position: 'absolute',
  //   top: '56%',
  //   left: '33%',
  //   width: '100%',
  // },
  horizontalLine: {
    paddingTop: '5%',
    borderBottomWidth: 3,
    borderColor: '#E7E7E7',
    width: '100%',
  },
  icons: {
    paddingRight: 8,
    alignItems: 'center',

  },
  iconContainer: {
    padding: '2%',
    flexDirection: 'row',
    alignItems: "center",

  },

  safe: {
    marginBottom: 5,
  },
  safeItem: {
    marginVertical: 5,
  },

  safetyText: {
    fontWeight: 'bold',
    fontSize: 16,

  },
  safetitle: {
    fontWeight: "600",
    fontSize: 15,
    // flex: 1,
  },
  safebody: {
    fontSize: 15,
    flex: 2, // safebody가 safetitle보다 더 넓은 공간을 차지하게 설정
    marginLeft: 10,
  },

  safebox: {
    padding: 3,
    borderRadius: 10,
    marginVertical: 5,
  },
  safetyContent: {
    flexDirection: 'row', // 제목과 본문을 수평으로 배치
    // justifyContent: 'space-between',
    alignItems: 'center',
  },
  safecategory: {
    color: 'black',
    // fontWeight: 'nomal',
    // marginLeft: 5,
    fontSize: 13,
  },
  safetitle: {
    fontSize: 15,
    // marginLeft: 5, // 제목과 본문 사이 여백 추가
    // flex: 1, // 남은 공간을 차지하도록 설정
    fontWeight: 'bold', // 내용도 굵은 글씨로 설정
  },
  safetime: {
    fontSize: 12,
    color: 'gray',
    textAlign: 'left', // 좌측 정렬
    marginTop: 5, // 위쪽 여백 추가
  },
  separator: {
    height: 1,
    backgroundColor: '#ddd', // 구분선 색상
    marginVertical: 5, // 위아래 여백 추가
  },
  listContainer: {
    borderRadius: 10, // 카테고리 배경 둥글게
    padding: 3, // 카테고리 안쪽 여백
    paddingLeft: 7,
    paddingRight: 7,
    marginLeft: 2, // 제목과 카테고리 사이의 간격을 없앰
    marginRight: 3,
    opacity: 0.8,
  },



  // 배너


  // banners: {
  //   width: '100%',
  //   height: '16%',
  //   marginTop: '5%'

  // },
  // bannerImage: {
  //   alignSelf: 'center', // 이미지를 부모 컨테이너 내에서 가운데 정렬

  //   resizeMode: "contain",
  //   width: '90%',
  // },
  buttonText: {
    alignItems: "center",
    fontSize: 30,
  },

  dot: {
    backgroundColor: 'rgba(0, 0, 0, .2)', // 도트 색상
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3, // 여기가 여백의 원인일 수 있음
  },
  activeDot: {
    backgroundColor: '#92B2AE',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3,
  },
  inpyeongbag: {
    backgroundColor: '#F0F0F0', // 더 밝은 그레이로 변경
    borderRadius: 12, // 둥근 모서리
    width: 170,
    height: 150, // 크기 그대로 유지
    marginTop: 10,
    padding: 10, // 패딩 추가로 내부 여유 공간 확보
    shadowColor: '#000', // 그림자 색상
    shadowOffset: { width: 0, height: 4 }, // 그림자 위치
    shadowOpacity: 0.1, // 그림자 불투명도 낮춤
    shadowRadius: 6, // 그림자 모서리 반경
    elevation: 5, // 안드로이드에서 그림자 효과
  },
  inpyeongtext: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 14, // 제목 크기 조정
  },
  itemImagesContainer: {
    flexDirection: 'row', // 가로로 아이템 배치
    flexWrap: 'wrap', // 넘치는 아이템은 다음 줄로 넘어가게
    justifyContent: 'center', // 아이템들을 가운데 정렬
    marginTop: 5,
  },
  itemImage: {
    width: 40, // 이미지 크기 줄이기
    height: 40, // 이미지 크기 줄이기
    margin: 5, // 이미지 간 간격 추가
    borderRadius: 10, // 아이템 이미지 둥글게 처리
    resizeMode: 'contain',
  },
  noItemsText: {
    textAlign: 'center',
    color: 'gray',
    fontSize: 12,
  },
});

export default App;