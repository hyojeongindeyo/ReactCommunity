import React, { useState, useContext, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image, Alert, KeyboardAvoidingView, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { PostsContext } from './PostsContext'; // PostsContext import
import axios from 'axios'; // axios import
import config from '../config'; // config 파일 import

export default function WritePost({ navigation }) {
  const { addPost } = useContext(PostsContext);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [userData, setUserData] = useState(null); // 사용자 정보 상태 추가
  const [location, setLocation] = useState(null); // 위치 정보 상태 추가
  const [address, setAddress] = useState(null); // 주소 상태 추가
  const [loading, setLoading] = useState(false); // 로딩 상태 수정

  useEffect(() => {
    fetchUserSession();
    getLocation();
  }, []);

  useEffect(() => {
    console.log('Fetched address:', address);  // 주소가 제대로 설정되었는지 확인
  }, [address]);

  const fetchUserSession = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/session`, { withCredentials: true });
      setUserData(response.data);
    } catch (error) {
      console.error('Error fetching user session:', error);
      Alert.alert('Error', 'Failed to load user data.');
    }
  };

  const checkLogin = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/session`, { withCredentials: true });
      if (!response.data.user) {
        Alert.alert('로그인이 필요합니다.');
        navigation.navigate('Login');  // 로그인 페이지로 리다이렉트
      }
    } catch (error) {
      console.error('세션 확인 중 오류 발생:', error);
    }
  };

  useEffect(() => {
    checkLogin();  // 화면 로드 시 로그인 상태 확인
  }, []);

  const getLocation = async () => {
    try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            throw new Error('Permission Denied');
        }

        const { coords } = await Location.getCurrentPositionAsync({});
        const address = await getAddressFromCoordinates(coords.latitude, coords.longitude);
        setAddress(address || 'Seoul, Jongno-gu');  // 주소가 없을 경우 기본값 설정

    } catch (error) {
        console.error('Error fetching location:', error);
        setAddress('Seoul, Jongno-gu');
        Alert.alert('Error', 'Failed to fetch location.');
    }
};

const getAddressFromCoordinates = async (latitude, longitude) => {
  try {
    const [result] = await Location.reverseGeocodeAsync({ latitude, longitude });
    console.log("Reverse geocode result:", result);  // 결과 확인 로그 추가
    // 시(city)와 동(district)을 반환, 주소 데이터가 없을 경우 기본값 설정
    return result && result.city && result.district ? `${result.city}, ${result.district}` : 'Unknown Location';
  } catch (error) {
    console.error('Error getting address from coordinates:', error);
    return 'Unknown Location';  // 기본값 설정
  }
};

  const handleCategorySelect = (category) => {
    console.log("Selected category:", category);  // 카테고리 선택 로그 추가
    setSelectedCategory(category);
  };

  const handlePostSubmit = async () => {
    // 로그 확인
    console.log("User Data:", userData);
    console.log('Selected Category:', selectedCategory);
    console.log('Post Title:', postTitle);
    console.log('Post Content:', postContent);
    console.log('Location Address:', address);  // location_address를 address로 설정
    console.log('Selected Image:', selectedImage);

    if (!userData.id || !selectedCategory || !postTitle.trim() || !postContent.trim()) {
      Alert.alert('All fields are required');
      return;
    }

    if (selectedCategory && postTitle.trim() && postContent.trim() && (address || 'Seoul, Jongno-gu') && userData) {
        setLoading(true);

        const formData = new FormData();
        formData.append('category', selectedCategory);
        formData.append('title', postTitle);
        formData.append('message', postContent);
        formData.append('user_id', userData.id); 
        formData.append('timestamp', new Date().toISOString().slice(0, 19).replace('T', ' '));

        if (selectedImage) {
            formData.append('image', {
                uri: selectedImage.startsWith('file://') ? selectedImage : `file://${selectedImage}`, 
                name: selectedImage.split('/').pop(),
                type: 'image/jpeg',
            });
        }

        // location_address만 전송
        formData.append('location_address', address);

        try {
            const response = await axios.post(`${config.apiUrl}/posts`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true,
            });
            console.log('서버 응답:', response.data);
            navigation.goBack();
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


  const pickImage = async () => {
  let result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: false,
    // aspect: [4, 3],
    //quality: 1,  // 이미지 품질을 낮춰 크기를 줄임
  });

  if (!result.canceled) {
    setSelectedImage(result.assets[0].uri); // 이미지 선택 후 URI 설정
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
                {['교통', '시위', '재해', '주의'].map((category, index) => (
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
