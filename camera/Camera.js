import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState, useRef, useEffect } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, Alert, Linking, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import axios from 'axios';
import config from '../config';
import CustomModal from '../CustomModal';
import Toast from 'react-native-toast-message';
import AlterModal from './AlterModal';


export default function App({ navigation }) {
  const [facing, setFacing] = useState('back');
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();
  const cameraRef = useRef(null);
  const [missionModalVisible, setMissionModalVisible] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewUri, setPreviewUri] = useState(null);
  const YOUR_CLIENT_API_KEY = config.YOUR_CLIENT_API_KEY;
  const OPENAI_API_KEY = config.OPENAI_API_KEY;

  const [alterModalVisible, setAlterModalVisible] = useState(false);
  const [alterModalText, setAlterModalText] = useState('');
  const [alterModalSubText, setAlterModalSubText] = useState('');
  const [showReportLink, setShowReportLink] = useState(false);

  useEffect(() => {
    const fetchUserSession = async () => {
      try {
        const response = await axios.get(`${config.apiUrl}/users/session`, { withCredentials: true });
        setUserData(response.data);
      } catch (error) {
        console.error('Error fetching user session:', error);
      }
    };

    fetchUserSession();
  }, []);

  useEffect(() => {
    (async () => {
      // 카메라 권한 요청
      const { status: cameraStatus } = await requestCameraPermission();
      if (cameraStatus !== 'granted') {
        Alert.alert(
          "카메라 권한 필요",
          "앱이 카메라를 사용하여 이미지를 촬영하고 업로드할 수 있도록 권한이 필요합니다. 설정에서 권한을 허용해주세요.",
          [
            { text: "취소", style: "cancel" },
            {
              text: "설정으로 이동",
              onPress: () => Linking.openSettings(),
            },
          ]
        );
      }
  
      // 사진첩 권한 요청
      const { status: mediaStatus } = await requestMediaPermission();
      if (mediaStatus !== 'granted') {
        Alert.alert(
          "사진첩 권한 필요",
          "앱이 사진첩에서 이미지를 선택하고 업로드할 수 있도록 권한이 필요합니다. 설정에서 권한을 허용해주세요.",
          [
            { text: "취소", style: "cancel" },
            {
              text: "설정으로 이동",
              onPress: () => Linking.openSettings(),
            },
          ]
        );
      }
    })();
  }, []);
  
  if (!cameraPermission || !mediaPermission) {
    // 권한 로딩 중
    return <View />;
  }
  
  if (!cameraPermission.granted || !mediaPermission.granted) {
    // 권한이 거부된 경우
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center', marginBottom: 20 }}>
          앱의 기능을 사용하려면 카메라와 사진첩 권한이 필요합니다.
        </Text>
        <Button
          onPress={() => requestCameraPermission()}
          title="카메라 권한 요청"
        />
        <Button
          onPress={() => requestMediaPermission()}
          title="사진첩 권한 요청"
        />
        <Button
          onPress={() => Linking.openSettings()}
          title="설정으로 이동"
        />
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
        setPreviewUri(photo.uri);

        const asset = await MediaLibrary.createAssetAsync(photo.uri);
        await checkForCracks(photo.uri);
      } catch (error) {
        console.error("사진 찍기 실패:", error);
        Alert.alert("사진 찍기 실패", "사진을 찍는 데 오류가 발생했습니다.");
      }
    }
  }

  async function checkForCracks(imageUri) {
    setLoading(true);
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
      console.log(uploadData)

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            { role: "system", content: "You are an expert at identifying cracks in walls. Examine the provided image carefully and determine whether the wall in the image has a natural or real crack. Only recognize cracks caused by structural damage, weathering, or other physical causes. Do not recognize cracks that are hand-drawn, artificially created, or photos of hand-drawn cracks on a computer screen. If the image depicts an artificially uniform, smooth, or white background, especially if it resembles paper, cardboard, or a non-wall surface, then it is likely not a real crack. Such cases should be excluded from recognition as a crack. If the crack appears to be highly defined, with sharp edges or perfect symmetry, this might indicate it is an artificial drawing or graphic. If there is excessive clarity of the crack's edges with no variation in texture or wall details, you should be cautious. When evaluating the crack, consider the texture, depth, and irregularity of the crack. Natural cracks typically have uneven edges and may display gradual variations in texture, color, and depth. Please return a probability between 0.0001 and 0.9999, with a higher probability indicating greater certainty of a real, natural crack. Even if you are highly confident, you should return a probability to account for minor uncertainty. Example output: 'Crack probability: 0.3457'" },
            {
              role: "user", content: [
                {
                  type: "text",
                  text: "Is there a crack in this wall image? Please return a probability value along with your answer."
                },
                {
                  type: "image_url",
                  image_url: {
                    url: imageUrl
                  }
                }
              ]
            }
          ],
          max_tokens: 300
        })
      });

      const data = await response.json();
      const resultMessage = data.choices[0].message.content.toLowerCase();
      const match = resultMessage.match(/crack probability:\s*([0-9]+(?:\.[0-9]+)?)/i);
      let crackProbability = 0;
      if (match) {
        crackProbability = parseFloat(match[1]);
      }

      const nonCrackProbability = 1 - crackProbability;
      setLoading(false);
      setPreviewUri(null); // 미리보기 해제하여 카메라 활성화

      if (crackProbability > 0.5) {
        setAlterModalText('균열이 맞습니다.');
        setShowReportLink(true);
        setAlterModalSubText((crackProbability*100).toFixed(1)+'%');
      } else {
        setAlterModalText('균열이 아닙니다.');
        setShowReportLink(false);
        setAlterModalSubText('신고가 필요하지 않습니다.');
      }

      setAlterModalVisible(true);

      console.log(`(${crackProbability.toFixed(4)}, ${nonCrackProbability.toFixed(4)})`);

      await completeMission(5);

    } catch (error) {
      setLoading(false);
      setPreviewUri(null);
      console.error('Error:', error);
      Alert.alert('An error occurred while processing the image.');
    }
  }

  const completeMission = async (missionId) => {
    // 사용자 역할이 guest일 경우 아무 동작도 하지 않음
    if (userData.role === 'guest') {
      console.log('게스트 계정은 미션을 완료할 수 없습니다.');
      return;
    }
    try {
      const response = await axios.get(`${config.apiUrl}/missions/user/${userData.id}`);
      const missions = response.data.missions;

      if (missions.includes(missionId)) {
        console.log('이미 미션을 완료했습니다.');
      } else {
        const completeResponse = await axios.post(`${config.apiUrl}/missions/complete-mission`, {
          userId: userData.id,
          missionId: missionId,
        });
        console.log(`미션 ${missionId} 완료:`, completeResponse.data);
        Toast.show({
          type: 'success',
          text1: '미션 완료!',
          text2: `미션 ${missionId}이(가) 완료되었습니다.`,
          visibilityTime: 3000,
        });
      }
    } catch (error) {
      console.error('미션 완료 오류:', error.response ? error.response.data : error);
    }
  };

  const missionhandleClose = () => {
    setMissionModalVisible(false);
  };

  const missionhandleConfirm = () => {
    missionhandleClose();
    navigation.navigate('Home', { screen: 'HomeScreen', params: { showModal: true } });
  };

  return (
    <View style={styles.container}>
      {previewUri ? (
        <Image source={{ uri: previewUri }} style={styles.camera} />
      ) : (
        <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
              <Ionicons name="camera-reverse" size={32} color="white" />
            </TouchableOpacity>
          </View>
        </CameraView>
      )}
      <CustomModal
        visible={missionModalVisible}
        onClose={missionhandleClose}
        onConfirm={missionhandleConfirm}
      />
      <AlterModal
        modalVisible={alterModalVisible}
        onClose={() => setAlterModalVisible(false)}
        content={alterModalText}
        subContent={alterModalSubText}
        showReportLink={showReportLink}
      />
      <View style={styles.captureButtonContainer}>
        <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
          <Ionicons name="camera" size={32} color="black" />
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={{ marginTop: 10 }}>균열 분석 중..</Text>
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
    width: '100%',
    height: '100%',
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
    bottom: 100,
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
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  }
});
