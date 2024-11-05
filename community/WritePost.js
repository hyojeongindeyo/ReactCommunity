import React, { useState, useContext, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image, Alert, KeyboardAvoidingView, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { PostsContext } from './PostsContext';
import axios from 'axios';
import config from '../config';
import CustomModal from '../CustomModal';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function WritePost({ navigation }) {
  const { addPost } = useContext(PostsContext);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [userData, setUserData] = useState(null);
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [missionModalVisible, setMissionModalVisible] = useState(false);
  const [userLocation, setUserLocation] = useState(''); // 위치 정보를 저장할 상태 변수
  const [loadingLocation, setLoadingLocation] = useState(false);

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

  const checkLogin = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/users/session`, { withCredentials: true });
      if (!response.data.user) {
        Alert.alert('로그인이 필요합니다.');
        navigation.navigate('Login');
      }
    } catch (error) {
      console.error('세션 확인 중 오류 발생:', error);
    }
  };

  useEffect(() => {
    checkLogin();
  }, []);

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
          const { city, district } = address[0];
          const userAddress = `${city} ${district}`;
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

  const handleCategorySelect = (category) => {
    console.log("Selected category:", category);
    setSelectedCategory(category);
  };

  const handlePostSubmit = async () => {
    const formattedUserLocation = userLocation.replace(' ', ', '); // 위치 형식 맞추기
    console.log("User Data:", userData);
    console.log('Selected Category:', selectedCategory);
    console.log('Post Title:', postTitle);
    console.log('Post Content:', postContent);
    console.log('Location Address:', formattedUserLocation);
    console.log('Selected Image:', selectedImage);
  
    if (!userData.id || !selectedCategory || !postTitle.trim() || !postContent.trim()) {
      Alert.alert('All fields are required');
      return;
    }
  
    if (selectedCategory && postTitle.trim() && postContent.trim() && (formattedUserLocation || 'Seoul, Jongno-gu') && userData) {
      setLoading(true);
  
      const formData = new FormData();
      formData.append('category', selectedCategory);
      formData.append('title', postTitle);
      formData.append('message', postContent);
      formData.append('user_id', userData.id);
      formData.append('timestamp', new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '));
  
      if (selectedImage) {
        formData.append('image', {
          uri: selectedImage.startsWith('file://') ? selectedImage : `file://${selectedImage}`,
          name: selectedImage.split('/').pop(),
          type: 'image/jpeg',
        });
      }
  
      formData.append('location_address', formattedUserLocation);
  
      try {
        const response = await axios.post(`${config.apiUrl}/posts`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true,
        });
        console.log('서버 응답:', response.data);
  
        // 미션 완료 상태 확인 및 모달 표시
        const isMissionCompleted = await completeMission(userData.id);
        if (!isMissionCompleted) {
          setMissionModalVisible(true); // 미션이 처음 완료되었을 때만 모달 띄움
        } else {
          console.log('이미 미션이 완료되었습니다.'); // 이미 미션이 완료되었을 때는 터미널 로그만 출력
          navigation.goBack();
        }
  
      } catch (error) {
        if (error.response) {
          console.log('Response error data:', error.response.data);
          console.log('Response status:', error.response.status);
          Alert.alert('Error', `Failed to submit post. Server returned: ${error.response.data.error}`);
        } else if (error.request) {
          console.log('Request made but no response:', error.request);
          Alert.alert('Error', 'Request made but no response from server.');
        } else {
          console.log('Other error:', error.message);
          Alert.alert('Error', `Failed to submit post: ${error.message}`);
        }
      } finally {
        setLoading(false);
      }
    } else {
      Alert.alert('모든 필드를 채워주세요');
      setLoading(false);
    }
  };

  const completeMission = async (userId) => {
    const missionIdToCheck = 4; // 미션 ID

    try {
      // 미션 상태 확인
      const response = await axios.get(`${config.apiUrl}/missions/user/${userId}`);
      const missions = response.data.missions;
  
      // 미션이 완료되지 않았으면, 미션 완료 처리 후 모달 띄우기
      if (!missions.includes(missionIdToCheck)) {
        // 미션을 완료하기 전에 API 호출
        await axios.post(`${config.apiUrl}/missions/complete-mission`, {
          userId: userId,
          missionId: missionIdToCheck,
        });
        console.log("미션 완료");
        setMissionModalVisible(true); // 미션 완료 시 모달 표시
        return false; // 미션이 처음 완료됨
      } else {
        console.log("이미 미션을 완료하셨습니다.");
        return true; // 이미 완료된 경우 모달 띄우지 않음
      }
    } catch (error) {
      console.error('오류:', error.response ? error.response.data : error);
      return true; // 오류 발생 시에도 모달 띄우지 않음
    }
  };

  const handleClose = () => {
    setMissionModalVisible(false);
    navigation.goBack(); // "아니오"를 눌렀을 때 돌아가도록 설정
  };

  const handleConfirm = () => {
    console.log("사용자가 '네'를 선택했습니다.");
    handleClose();
    navigation.replace('HomeScreen', { showModal: true });
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };


  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
              <MaterialIcons name="keyboard-arrow-left" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.title}>글 등록하기</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.content}>
            <View style={styles.categoryContainer}>
              <Text style={styles.label}>카테고리</Text>
              <View style={styles.categories}>
                {['교통', '화재', '재해', '주의'].map((category, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.categoryButton, selectedCategory === category && styles.selectedCategoryButton]}
                    onPress={() => handleCategorySelect(category)}
                  >
                    <Text style={[styles.categoryText, selectedCategory === category && styles.selectedCategoryText]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>제목</Text>
              <TextInput
                style={styles.input}
                placeholder="제목을 입력하세요."
                value={postTitle}
                onChangeText={setPostTitle}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>내용</Text>
              <TextInput
                style={[styles.input, { height: 100 }]}
                multiline
                placeholder="내용을 입력하세요."
                value={postContent}
                onChangeText={setPostContent}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>사진 첨부</Text>
              <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                <Text style={styles.imageButtonText}>사진 선택</Text>
              </TouchableOpacity>
              {selectedImage && <Image source={{ uri: selectedImage }} style={styles.selectedImage} />}
            </View>

            <TouchableOpacity style={styles.addButton} onPress={handlePostSubmit} disabled={loading}>
              <Text style={styles.buttonText}>작성 완료</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>

      {/* 글 작성 후 미션 완료 모달 */}
      <CustomModal
        visible={missionModalVisible}
        onClose={handleClose}
        onConfirm={handleConfirm}
      />

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',

  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingBottom: 110,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: '5%',
    paddingTop: '15%',
    paddingBottom: '5%',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  iconButton: {
    padding: '2%',
  },
  placeholder: {
    width: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: '5%',
    paddingTop: '5%',
  },
  categoryContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  categoryButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
    margin: 5,
  },
  selectedCategoryButton: {
    backgroundColor: '#556D6A',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
    fontWeight: 'bold',
  },
  selectedCategoryText: {
    color: '#ddd',
    fontWeight: 'bold',
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    height: 40,
  },
  imageButton: {
    backgroundColor: '#556D6A',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 10,
    width: 120,
  },
  imageButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  selectedImage: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    marginTop: 10,
  },
  addButton: {
    backgroundColor: '#556D6A',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ddd',
  },
});
