import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState, useRef, useEffect } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, Alert, Linking, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import axios from 'axios';
import config from '../config';
import CustomModal from '../CustomModal';

export default function App({ navigation }) {
  const [facing, setFacing] = useState('back');
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();
  const cameraRef = useRef(null);
  const [missionModalVisible, setMissionModalVisible] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false); // 로딩 상태 추가
  const YOUR_CLIENT_API_KEY = config.YOUR_CLIENT_API_KEY;
  const OPENAI_API_KEY = config.OPENAI_API_KEY;

  useEffect(() => {
    const fetchUserSession = async () => {
      try {
        const response = await axios.get(`${config.apiUrl}/session`, { withCredentials: true });
        setUserData(response.data);
      } catch (error) {
        console.error('Error fetching user session:', error);
      }
    };

    fetchUserSession();
  }, []);

  useEffect(() => {
    (async () => {
      const { status: cameraStatus } = await requestCameraPermission();
      const { status: mediaStatus } = await requestMediaPermission();

      if (cameraStatus !== 'granted') {
        Alert.alert("카메라 권한이 필요합니다.");
      }

      if (mediaStatus !== 'granted') {
        Alert.alert("미디어 라이브러리 권한이 필요합니다.");
      }
    })();
  }, []);

  if (!cameraPermission || !mediaPermission) {
    return <View />;
  }

  if (!cameraPermission.granted || !mediaPermission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
        <Button onPress={requestCameraPermission} title="grant camera permission" />
        <Button onPress={requestMediaPermission} title="grant media permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  async function takePicture() {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        console.log("Picture taken!", photo);
        
        const asset = await MediaLibrary.createAssetAsync(photo.uri);
        console.log("사진이 저장되었습니다!", `사진 URI: ${asset.uri}`);
        
        await checkForCracks(photo.uri);
      } catch (error) {
        console.error("사진 찍기 실패:", error);
        Alert.alert("사진 찍기 실패", "사진을 찍는 데 오류가 발생했습니다.");
      }
    }
  }

  async function checkForCracks(imageUri) {
    setLoading(true); // 로딩 시작
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'photo.jpg'
    });

    try {
      const uploadResponse = await fetch(`https://api.imgbb.com/1/upload?expiration=600&key=${YOUR_CLIENT_API_KEY}`, {
        method: 'POST',
        body: formData
      });
      const uploadData = await uploadResponse.json();
      const imageUrl = uploadData.data.url;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            { role: "system", content: "You're an expert at judging cracks in walls. You need to look at the image provided and determine whether the wall in that image has a crack or not. If the image provided is not a photo of a wall or is a hand-drawn picture, answer No" },
            { role: "user", content: "Is there a crack in this wall image?", image_url: imageUrl }
          ],
          max_tokens: 300
        })
      });

      const data = await response.json();
      const resultMessage = data.choices[0].message.content;

      setLoading(false); // 로딩 종료

      if (resultMessage.includes('yes')) {
        Alert.alert(
          "결과",
          '균열이 있습니다!',
          [
            {
              text: "안전신고 바로가기",
              onPress: () => Linking.openURL("https://www.safetyreport.go.kr/#safereport/safereport")
            },
            { text: "확인", style: "cancel" }
          ]
        );
      } else {
        Alert.alert("결과", '균열이 없습니다!', [{ text: "확인", style: "cancel" }]);
      }

      await completeMission(5);

    } catch (error) {
      setLoading(false); // 로딩 종료
      console.error('Error:', error);
      Alert.alert('An error occurred while processing the image.');
    }
  }

  const completeMission = async (missionId) => {
    try {
      const response = await axios.get(`${config.apiUrl}/user/missions/${userData.id}`);
      const missions = response.data.missions;

      if (missions.includes(missionId)) {
        console.log('이미 미션을 완료했습니다.');
      } else {
        const completeResponse = await axios.post(`${config.apiUrl}/complete-mission`, {
          userId: userData.id,
          missionId: missionId,
        });
        console.log(`미션 ${missionId} 완료:`, completeResponse.data);
        setMissionModalVisible(true);
      }
    } catch (error) {
      console.error('미션 완료 오류:', error.response ? error.response.data : error);
    }
  };

  const missionhandleClose = () => {
    setMissionModalVisible(false);
  };

  const missionhandleConfirm = () => {
    console.log("사용자가 '네'를 선택했습니다.");
    missionhandleClose();
    navigation.navigate('Home', { screen: 'HomeScreen', params: { showModal: true } });
  };

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Ionicons name="camera-reverse" size={32} color="white" />
          </TouchableOpacity>
        </View>
        <CustomModal
          visible={missionModalVisible}
          onClose={missionhandleClose}
          onConfirm={missionhandleConfirm}
        />
        <View style={styles.captureButtonContainer}>
          <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
            <Ionicons name="camera" size={32} color="black" />
          </TouchableOpacity>
        </View>
      </CameraView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={{ marginTop: 10 }}>Waiting for Detection..</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 80,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'transparent',
  },
  button: {
    alignItems: 'center',
  },
  captureButtonContainer: {
    position: 'absolute',
    bottom: 40,
    left: '50%',
    transform: [{ translateX: -25 }],
    alignItems: 'center',
  },
  captureButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
