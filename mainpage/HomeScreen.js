import React, { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { StatusBar } from 'expo-status-bar';
import { View, Text, Image, StyleSheet, Dimensions, ActivityIndicator, ScrollView } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AntDesign from '@expo/vector-icons/AntDesign';
import Weather from './Weather'; // Weather 컴포넌트 import
import Swiper from 'react-native-swiper';
import BottomTabBar from '../BottomTabBar';
import Entypo from '@expo/vector-icons/Entypo';


const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const App = () => {

  const [city, setCity] = useState('Loading...');
  const [location, setLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const scrollViewRef = useRef(null)
  const bannerWidth = SCREEN_WIDTH


  // 배너


  // 위치 가져오기
  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setCity('Permission to access location was denied');
      setLoadingLocation(false);
      return;
    }

    try {
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      setLocation({ latitude, longitude });
      const address = await Location.reverseGeocodeAsync({ latitude, longitude });
      const city = address[0].city || 'Unknown';
      const district = address[0].district || ''; // 구 정보 가져오기
      setCity(`${city} ${district}`); // city와 district 함께 출력
      setLoadingLocation(false);
    } catch (error) {
      console.error('Error fetching location:', error);
      setCity('Error fetching location');
      setLoadingLocation(false);
    }
  };





  return (
    <View style={styles.allItems}>
      <View style={styles.logoAndMenuIconContainer}>
        <Image source={require('../assets/logo.png')} style={styles.logoImage} resizeMode="contain" />
        <Entypo name="menu" size={24} color="black" style={styles.menuIcon} />
      </View>



      <View style={styles.topline}></View>




      {/* 오늘의~, 위치, 내주변안전소식 묶음 */}
      <View style={styles.container}>
        {/* 평안팁 부분 */}
        <View style={styles.tips}>
          <Image source={require('../assets/tips.png')} style={styles.tipImage} resizeMode="contain" />
          <View style={styles.tipTitles}>
            <Text style={styles.tipstitle}>[오늘의 평안팁]</Text>
            <Text style={styles.condition}>폭염주의보</Text>
          </View>
          <View style={styles.verticalLine}></View>
          <Text style={styles.tip} resizeMode="contain">외출 시 물 챙기기</Text>
        </View>

        {/* 날씨랑 평안이 부분 */}
        <View style={styles.weather}>
          <Text style={styles.locationText}>현재 위치: {city}</Text>
          <View style={styles.weatherwrap}>
            <View style={styles.imageContainer}>
              <Image source={require('../assets/pyeong.png')} style={styles.pyeong} resizeMode="contain" />
              <Image source={require('../assets/bag.png')} style={styles.bag} resizeMode="contain" />
            </View>
            {/* Weather part */}
            {location && (
              <View style={styles.weatherContent}>
                <Weather latitude={location.latitude} longitude={location.longitude} city={city} />
              </View>
            )}
            <Text style={styles.pyeongT}>000님의 평안이</Text>
          </View>
        </View>


        <View style={styles.horizontalLine}></View>
        <View style={styles.iconContainer}>
          <View style={styles.icons}>
            <MaterialIcons name="health-and-safety" size={25} color="rgb(146, 171, 168)" />
          </View>
          <Text style={styles.safetyText}>내 주변 안전소식  </Text>
          <View style={styles.icons}>
            <AntDesign name="right" size={16} color="black" />
          </View>

        </View>

        <View style={styles.safe}>
          <View style={styles.safebox}>
            <Text style={styles.safetitle}>교통</Text>
            <Text style={styles.safebody} numberOfLines={1} ellipsizeMode='tail'>지금 00사거리에 사고가 나서 차가 좌회전 때 많이 막히는 것 같네요</Text>
            <Text style={styles.safetime}>지금</Text>
          </View>
          <View style={styles.safebox}>
            <Text style={styles.safetitle}>시위</Text>
            <Text style={styles.safebody} numberOfLines={1} ellipsizeMode='tail'>내일 부천역 앞에서 시위를 한다고 하네요 출퇴근 조심하세요!!</Text>
            <Text style={styles.safetime}>10분 전</Text>
          </View>
          <View style={styles.safebox}>
            <Text style={styles.safetitle}>주의</Text>
            <Text style={styles.safebody} numberOfLines={1} ellipsizeMode='tail'>00동 내일 잠깐 단수된다고 하던데 주의하세요</Text>
            <Text style={styles.safetime}>1일 전</Text>
          </View>
        </View>
        <StatusBar style="auto" />


      </View>

      <View style={styles.banners}>
        {/* 배너 */}
        <Swiper
          style={styles.swiperContainer}
          showsButtons={false}
          loop={true}
          paginationStyle={{ bottotopm: 30 }}
          dotStyle={styles.dot}
          activeDotStyle={styles.activeDot}
          width={SCREEN_WIDTH}
          index={1}
          autoplay={true} // 자동 재생 활성화
          autoplayTimeout={3} // 3초마다 변경
          autoplayDirection={true}
        >
          <View style={[styles.slide, styles.slide1]}>
            <Image source={require('../assets/community.png')} style={styles.bannerImage} />
          </View>
          <View style={[styles.slide, styles.slide2]}>
            <Image source={require('../assets/crack.png')} style={styles.bannerImage} />
          </View>
          <View style={[styles.slide, styles.slide3]}>
            <Image source={require('../assets/shelter.png')} style={styles.bannerImage} />
          </View>
        </Swiper>
      </View>
      <BottomTabBar />



    </View >
  );
};



const styles = StyleSheet.create({
  allItems: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: "white",
  },
  logoAndMenuIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: '5%', // 화면 양쪽의 여백 조절
    marginTop: '10%', // 로고와 메뉴 아이콘 간격 조절
  },
  logoImage: {
    marginLeft: 'auto',
    marginRight: '36%',
    // position: 'absolute',

    
    width: '13%', // 픽셀 단위로 설정
    aspectRatio: 1,

    // marginRight: 10, // 로고와 메뉴 아이콘 간격 조절
  },
  menuIcon: {
    // marginRight: 0, // 로고와 메뉴 아이콘 간격 조절
  },



  topline: {
    marginTop: 0,
    marginBottom: 20,
    borderBottomWidth: 2,
    borderColor: '#E7E7E7',
    width: '100%',

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
    fontSize: 18,
    fontWeight: 'bold',
    // alignItems: "right",
    paddingTop: 20,
    marginBottom: 10,
  },
  weather: {
    paddingLeft: 10,
    width: '100%'
  },
  // weather content style 설정
  weatherContent: {
    position: "absolute",
    paddingLeft: '45%',

  },
  weatherwrap: {
    flexDirection: "row",
  },
  pyeongT: {
    fontSize: 16,
    fontWeight: 'bold',
    position: 'absolute',
    paddingLeft: '45%',
  },



  imageContainer: {
    flexDirection: "row",
    alignContent: "center",
    width: '40%'
  },
  pyeong: {
    paddingTop: 10,
    marginTop: 5,
    width: '100%'
  },
  bag: {
    width: '50%',
    height: '50%',
    position: 'absolute',
    top: '56%',
    left: '33%',
    width: '100%',
  },
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
    width: '100%',
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
    backgroundColor: "#f3f3f3",
    justifyContent: 'center',
    // height: '30%',
    padding: '5%',
    borderRadius: 20,
    marginTop: '2%',
    flexDirection: "row",
    alignItems: "center"
  },
  safetime: {
    color: '#8A9094',
    fontWeight: 200,
  },



  // 배너


  banners: {
    width: '100%',
    height: '16%',
    marginTop: '5%'

  },
  bannerImage: {
    alignSelf: 'center', // 이미지를 부모 컨테이너 내에서 가운데 정렬

    resizeMode: "contain",
    width: '90%',
  },
  buttonText: {
    alignItems: "center",
    fontSize: 30,
  },

  activeDot: {
    backgroundColor: '#92B2AE', // 활성화된 도트의 색상
    width: 8, // 활성화된 도트의 너비
    height: 8, // 활성화된 도트의 높이
    borderRadius: 4, // 활성화된 도트의 모서리 반경
    marginHorizontal: 3, // 도트 사이의 간격
  },



});

export default App;