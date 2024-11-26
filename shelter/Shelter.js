import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Dimensions, ScrollView, PanResponder, Animated } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';
import config from '../config'; // SafetyInfo.js와 동일한 config 파일 사용
import CustomModal from '../CustomModal'; // 모달 컴포넌트 import

// JSON 파일을 불러옵니다
import shelterData from './Shelter.json';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function ShelterScreen({ navigation }) {
  const [location, setLocation] = useState(null);
  const [region, setRegion] = useState(null);
  const [address, setAddress] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [shelters, setShelters] = useState([]);
  const [userData, setUserData] = useState(null);
  const [missionModalVisible, setMissionModalVisible] = useState(false); // 새로운 상태 변수

  const scrollViewHeight = useRef(new Animated.Value(SCREEN_HEIGHT / 5)).current;
  const [locationRequestTime, setLocationRequestTime] = useState(Date.now());

  // useEffect(() => {
  //   fetchUserSession();
  // }, []);

  // const fetchUserSession = async () => {
  //   try {
  //     const response = await axios.get(`${config.apiUrl}/users/session`, { withCredentials: true });
  //     setUserData(response.data);
  //   } catch (error) {
  //     console.error('Error fetching user session:', error);
  //   }
  // };

  // Haversine 공식을 사용하여 두 지점 간의 거리를 계산하는 함수
  function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // 지구 반경 (킬로미터)
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // 거리 (킬로미터)
    return d;
  }

  function deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  useEffect(() => {
    const getLocation = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          return;
        }

        // 캐시된 위치 사용
        let cachedLocation = await Location.getLastKnownPositionAsync({});
        if (cachedLocation) {
          setLocation(cachedLocation);
          setRegion({
            latitude: cachedLocation.coords.latitude,
            longitude: cachedLocation.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          });

          let address = await Location.reverseGeocodeAsync({
            latitude: cachedLocation.coords.latitude,
            longitude: cachedLocation.coords.longitude,
          });

          if (address.length > 0) {
            const { city, district, street, streetNumber } = address[0];

            // district가 null, undefined 또는 빈 문자열이 아니면 district + street, 아니면 street만 포함
            const fullAddress = `${city} ${district && district.trim()
              ? (district === street ? district : `${district} ${street}`)
              : street} ${streetNumber ? streetNumber : ''}`.trim();

            setAddress(fullAddress); // 완성된 주소 상태 설정


          }

          // 사용자 위치 기준으로 가장 가까운 상위 10개 쉼터를 계산합니다
          updateShelters(cachedLocation.coords.latitude, cachedLocation.coords.longitude);
        }

        // 일정 시간 간격으로 새 위치 요청
        const now = Date.now();
        if (now - locationRequestTime > 10000) { // 10초
          let location = await Location.getCurrentPositionAsync({});
          setLocation(location);
          setRegion({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          });

          updateShelters(location.coords.latitude, location.coords.longitude);
          setLocationRequestTime(now);
        }

      } catch (error) {
        console.error('Error getting location:', error);
        setErrorMsg('Could not fetch location. Please try again.'); // 사용자에게 오류 메시지 표시
      }
    };

    getLocation();
  }, [locationRequestTime]);

  const updateShelters = (latitude, longitude) => {
    const sortedShelters = shelterData.map((shelter) => ({
      ...shelter,
      distance: getDistanceFromLatLonInKm(
        latitude,
        longitude,
        parseFloat(shelter["위도(EPSG4326)"]),
        parseFloat(shelter["경도(EPSG4326)"])
      ),
    }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10)
      .map((shelter) => ({
        id: shelter.번호,
        name: shelter.시설명,
        address: shelter["도로명전체주소"],
        people: parseInt(shelter["최대수용인원"]),
        latitude: parseFloat(shelter["위도(EPSG4326)"]),
        longitude: parseFloat(shelter["경도(EPSG4326)"]),
      }));

    setShelters(sortedShelters);
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gestureState) => {
        if (gestureState.dy < 0) {
          Animated.timing(scrollViewHeight, {
            toValue: SCREEN_HEIGHT / 2.5,
            duration: 300,
            useNativeDriver: false,
          }).start();
        } else {
          Animated.timing(scrollViewHeight, {
            toValue: SCREEN_HEIGHT / 5,
            duration: 300,
            useNativeDriver: false,
          }).start();
        }
      },
      onPanResponderRelease: (event, gestureState) => {
        if (gestureState.dy < 0) {
          Animated.timing(scrollViewHeight, {
            toValue: SCREEN_HEIGHT / 2.5,
            duration: 300,
            useNativeDriver: false,
          }).start();
        } else {
          Animated.timing(scrollViewHeight, {
            toValue: SCREEN_HEIGHT / 5,
            duration: 300,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  let locationText = 'Waiting..';
  if (errorMsg) {
    locationText = errorMsg;
  } else if (address) {
    locationText = address;
  } else if (location) {
    locationText = `위도: ${location.coords.latitude}, 경도: ${location.coords.longitude}`;
  }

  const handleShelterPress = (shelter) => {
    // 대피소 정보 표시 로직
    const missionIdToCheck = 3; // 미션 ID
    completeMission(missionIdToCheck);
  };

  const completeMission = async (missionId) => {
    // userData.role이 guest인 경우 실행 중단
    if (userData.role === 'guest') {
      console.log('게스트 계정은 미션을 완료할 수 없습니다.');
      // console.log(userData.role);
      return;
      
    };
    try {
      // 서버에서 유저의 완료된 미션 목록을 가져옵니다.
      const response = await axios.get(`${config.apiUrl}/missions/user/${userData.id}`);
      const missions = response.data.missions;

      // 미션 ID가 완료된 목록에 있는지 확인합니다.
      if (missions.includes(missionId)) {
        // 이미 완료된 미션일 경우 콘솔에 메시지 출력
        console.log('이미 미션을 완료했습니다.');
      } else {
        // 미션이 완료되지 않았을 경우 미션 완료 API 호출
        const completeResponse = await axios.post(`${config.apiUrl}/missions/complete-mission`, {
          userId: userData.id,
          missionId: missionId,
        });
        console.log(`미션 ${missionId} 완료:`, completeResponse.data);

        // 처음 완료된 미션일 경우 모달 띄우기
        setMissionModalVisible(true);
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
      <MapView
        style={styles.map}
        region={region}
        showsUserLocation={true}
      >
        {shelters.map(shelter => (
          <Marker
            key={shelter.id}
            coordinate={{
              latitude: shelter.latitude,
              longitude: shelter.longitude,
            }}
            title={shelter.name}
            onPress={() => handleShelterPress(shelter)} // 클릭 이벤트 추가
          />
        ))}
      </MapView>
      <CustomModal
        visible={missionModalVisible}
        onClose={missionhandleClose}
        onConfirm={missionhandleConfirm}
      />
      <View style={styles.infoContainer}>
        <Text style={styles.locationText}>
          {locationText}
        </Text>
      </View>
      <Animated.View style={[styles.scrollViewContainer]}>
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          {...panResponder.panHandlers}
        >

          {shelters.map(shelter => (
            <View key={shelter.id} style={styles.shelterInfo}>
              <View style={styles.shelterNamePeople}>
                <Text style={styles.shelterName}>{shelter.name}</Text>
                <Text>수용인원 : {shelter.people}</Text>
              </View>
              <Text style={styles.shelterLocation}>{shelter.address}</Text>
            </View>
          ))}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 80,

  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  infoContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',

    borderRadius: 20,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 1 },
    // shadowOpacity: 0.8,
    // shadowRadius: 2,
    // elevation: 1,
  },
  scrollViewContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: SCREEN_HEIGHT / 3.9, // 고정된 높이 설정
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#333',
    shadowOffset: { width: 0, height: -0.8 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 1,
  },
  scrollViewContent: {
    paddingTop: 8,
    paddingHorizontal: 20,

  },
  shelterInfo: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 6,
    marginTop: 8,
  },
  shelterNamePeople: {
    flexDirection: 'row', // 요소를 수평으로 나란히 정렬
    justifyContent: 'space-between'
  },
  shelterName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  shelterLocation: {
    marginTop: 7,
    fontSize: 14,
    color: '#666',
  },
  locationText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },

});
