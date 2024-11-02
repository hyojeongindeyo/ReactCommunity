import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState, useRef, useEffect } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Ionicons 추가
import * as MediaLibrary from 'expo-media-library'; // MediaLibrary 추가
import axios from 'axios';
import config from '../config'; // SafetyInfo.js와 동일한 config 파일 사용
import CustomModal from '../CustomModal'; // 모달 컴포넌트 import

export default function App({ navigation }) {
  const [facing, setFacing] = useState('back');
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions(); // 미디어 라이브러리 권한 요청
  const cameraRef = useRef(null); // 카메라 참조 추가
  const [missionModalVisible, setMissionModalVisible] = useState(false); // 새로운 상태 변수
  const [userData, setUserData] = useState(null);
  
  useEffect(() => {
    const fetchUserSession = async () => {
      try {
        const response = await axios.get(`${config.apiUrl}/session`, { withCredentials: true });
        setUserData(response.data); // 사용자 정보 상태에 저장
      } catch (error) {
        console.error('Error fetching user session:', error);
      }
    };

    fetchUserSession();
  }, []);

  useEffect(() => {
    (async () => {
      // 카메라와 미디어 라이브러리 권한 요청
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
  
        // 사진 갤러리에 저장
        const asset = await MediaLibrary.createAssetAsync(photo.uri);
        Alert.alert("사진이 저장되었습니다!", `사진 URI: ${asset.uri}`);
  
        // 미션 완료 함수 호출
        await completeMission(5);
      } catch (error) {
        console.error("사진 찍기 실패:", error);
        Alert.alert("사진 찍기 실패", "사진을 찍는 데 오류가 발생했습니다.");
      }
    }
  }  

  const completeMission = async (missionId) => {
    try {
      // 서버에서 유저의 완료된 미션 목록을 가져옵니다.
      const response = await axios.get(`${config.apiUrl}/user/missions/${userData.id}`);
      const missions = response.data.missions;
  
      // 미션 ID가 완료된 목록에 있는지 확인합니다.
      if (missions.includes(missionId)) {
        // 이미 완료된 미션일 경우 콘솔에 메시지 출력
        console.log('이미 미션을 완료했습니다.');
      } else {
        // 미션이 완료되지 않았을 경우 미션 완료 API 호출
        const completeResponse = await axios.post(`${config.apiUrl}/complete-mission`, {
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
    position: 'absolute', // 절대 위치 지정
    top: 40, // 상단에서의 거리
    right: 20, // 우측에서의 거리
    backgroundColor: 'transparent', // 배경 투명
  },
  button: {
    alignItems: 'center',
  },
  captureButtonContainer: {
    position: 'absolute',
    bottom: 40, // 하단에서의 거리
    left: '50%', // 가운데 정렬
    transform: [{ translateX: -25 }], // 버튼 크기만큼 왼쪽으로 이동
    alignItems: 'center',
  },
  captureButton: {
    width: 50, // 버튼 너비
    height: 50, // 버튼 높이
    borderRadius: 25, // 동그란 버튼
    backgroundColor: 'white', // 버튼 배경색
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});
