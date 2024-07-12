import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Dimensions, ScrollView, PanResponder, Animated } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

// JSON 파일을 불러옵니다
import shelterData from './Shelter.json';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function ShelterScreen({ navigation }) {
  const [location, setLocation] = useState(null);
  const [region, setRegion] = useState(null);
  const [address, setAddress] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [shelters, setShelters] = useState([]);
  const scrollViewHeight = useRef(new Animated.Value(SCREEN_HEIGHT / 3)).current;

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
    // 위치 권한을 요청하고 현재 위치를 가져옵니다
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });

      let address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      if (address.length > 0) {
        const { city, district, street, streetNumber } = address[0];
        setAddress(`${city} ${district} ${street} ${streetNumber}`);
      }

      // 사용자 위치 기준으로 가장 가까운 상위 10개 쉼터를 계산합니다
      const sortedShelters = shelterData.map((shelter) => ({
        ...shelter,
        distance: getDistanceFromLatLonInKm(
          location.coords.latitude,
          location.coords.longitude,
          parseFloat(shelter["위도(EPSG4326)"]),
          parseFloat(shelter["경도(EPSG4326)"])
        ),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10)
      .map((shelter, index) => ({
        id: shelter.번호,
        name: shelter.시설명,
        address : shelter["도로명전체주소"],
        people : parseInt(shelter["최대수용인원"]),
        latitude: parseFloat(shelter["위도(EPSG4326)"]),
        longitude: parseFloat(shelter["경도(EPSG4326)"]),
      }));

      setShelters(sortedShelters);
    })();
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gestureState) => {
        if (gestureState.dy < 0) {
          Animated.timing(scrollViewHeight, {
            toValue: SCREEN_HEIGHT / 2,
            duration: 300,
            useNativeDriver: false,
          }).start();
        } else {
          Animated.timing(scrollViewHeight, {
            toValue: SCREEN_HEIGHT / 3,
            duration: 300,
            useNativeDriver: false,
          }).start();
        }
      },
      onPanResponderRelease: (event, gestureState) => {
        if (gestureState.dy < 0) {
          Animated.timing(scrollViewHeight, {
            toValue: SCREEN_HEIGHT / 2,
            duration: 300,
            useNativeDriver: false,
          }).start();
        } else {
          Animated.timing(scrollViewHeight, {
            toValue: SCREEN_HEIGHT / 3,
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
          />
        ))}
      </MapView>
      <View style={styles.infoContainer}>
        <Text style={styles.locationText}>
          {locationText}
        </Text>
      </View>
      <Animated.View style={[styles.scrollViewContainer, { height: scrollViewHeight }]}>
        <ScrollView contentContainerStyle={styles.scrollViewContent} {...panResponder.panHandlers}>
          <View style={styles.dragHandle}></View>
          {shelters.map(shelter => (
            <View key={shelter.id} style={styles.shelterInfo}>
              <Text style={styles.shelterName}>{shelter.name}</Text>
              <Text style={styles.shelterLocation}>{shelter.address}, 수용인원 : {shelter.people}</Text>
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
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 1,
  },
  scrollViewContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 1,
  },
  scrollViewContent: {
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  shelterInfo: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
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
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 2.5,
    alignSelf: 'center',
    marginVertical: 10,
  },
});
