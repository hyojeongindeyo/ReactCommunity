import 'react-native-gesture-handler';
import React, { useState, useEffect, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Dimensions, Image, ScrollView, Switch, TouchableOpacity, TextInput } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialIcons, Ionicons, FontAwesome } from '@expo/vector-icons';
import LogoutModal from './LogoutModal';
import DeleteAccountModal from './DeleteAccountModal';
import PostDetail from '../community/PostDetail';
import UpdatePost from '../community/UpdatePost';
import PrivacyPolicyContent from './PrivacyPolicyContent';
import axios from 'axios';
import config from '../config';
import { useFocusEffect } from '@react-navigation/native';
import MissionModal from '../MissionModal'; // MissionModal import
import EnlargeModal from '../EnlargeModal'; // EnlargeModal import

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const Stack = createStackNavigator();

function MainScreen({ navigation, handleLogout }) {
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [deleteAccountModalVisible, setDeleteAccountModalVisible] = useState(false);
  const [nickname, setNickname] = useState('');  // 닉네임 상태 추가
  const [modalVisible, setModalVisible] = useState(false); // 모달 상태 정의
  const [userMissions, setUserMissions] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null); // 확대할 이미지의 상태
  const [enlargeModalVisible, setEnlargeModalVisible] = useState(false); // 이미지 확대 모달

  useEffect(() => {
    // 로그인된 사용자의 세션 정보를 가져오는 함수
    const fetchUserSession = async () => {
      try {
        const response = await axios.get(`${config.apiUrl}/users/session`, { withCredentials: true });
        setNickname(response.data.nickname);  // 닉네임 상태 업데이트
        console.log('서버 응답:', response.data); // 응답 데이터 확인
      } catch (error) {
        console.error('Error fetching user session:', error);
      }
    };

    fetchUserSession();
  }, []);
  
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

  const handleImagePress = (image) => {
    setSelectedImage(image);
    setModalVisible(false);
    setEnlargeModalVisible(true);
  };

  const handleCloseEnlargeModal = () => {
    setEnlargeModalVisible(false);
    setModalVisible(true);
  };


  const handleLogoutClick = async () => {
    try {
      await axios.post(`${config.apiUrl}/users/logout`, {}, { withCredentials: true });
      setLogoutModalVisible(false);
      handleLogout(); // handleLogout을 직접 호출
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  const handleDeleteAccountClick = async () => {
    try {
      await axios.delete(`${config.apiUrl}/users/delete`, { withCredentials: true });
      handleLogout(); // 로그아웃 함수 호출하여 로그인 화면으로 이동
    } catch (error) {
      console.error("회원 탈퇴 실패:", error);
    }
  };
  const missionImages = {
    1: require('../assets/flashlight.png'),
    2: require('../assets/whistle.png'),
    3: require('../assets/compass.png'),
    4: require('../assets/fire_extinguisher.png'),
    5: require('../assets/first_aid_kit.png'),
    6: require('../assets/water.png'),
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View>
          <Text style={styles.nametitle}>{nickname}님의 평안이</Text>
        </View>

        <View style={styles.imgContainer}>
          <Image source={require('../assets/pyeong.png')} style={styles.pyeong} resizeMode='contain' />
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Image source={require('../assets/bag.png')} style={styles.bag} resizeMode='contain' />
          </TouchableOpacity>


        </View>
        <MissionModal
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          userMissions={userMissions}
          handleImagePress={handleImagePress}
          missionImages={missionImages}
        />

        <EnlargeModal
          enlargeModalVisible={enlargeModalVisible}
          setEnlargeModalVisible={setEnlargeModalVisible}
          selectedImage={selectedImage}
          handleCloseEnlargeModal={handleCloseEnlargeModal}
        />

        <View style={styles.separator} />
        <Text style={styles.title}>내 정보</Text>
        <Text style={styles.message} onPress={() => navigation.navigate('ChangePassword')}>비밀번호 변경</Text>
        <View style={styles.separator} />
        <Text style={styles.title}>커뮤니티</Text>
        <Text style={styles.message} onPress={() => navigation.navigate('MyPosts')}>내가 작성한 글</Text>
        <Text style={styles.message} onPress={() => navigation.navigate('ScrappedPosts')}>스크랩한 글</Text>
        <View style={styles.separator} />
        <Text style={styles.title}>설정</Text>
        <Text style={styles.message} onPress={() => navigation.navigate('NotificationSettings')}>알림 설정</Text>
        <Text style={styles.message} onPress={() => navigation.navigate('PrivacyPolicy')}>개인정보 처리방침</Text>
        <View style={styles.separator} />
        <Text style={styles.title}>기타</Text>
        <Text style={styles.message} onPress={() => navigation.navigate('Inquiry')}>문의사항</Text>
        <Text style={styles.message} onPress={() => setLogoutModalVisible(true)}>로그아웃</Text>
        <LogoutModal
          visible={logoutModalVisible}
          onClose={() => setLogoutModalVisible(false)}
          onLogout={handleLogoutClick}
        />
        <Text style={styles.message} onPress={() => setDeleteAccountModalVisible(true)}>회원 탈퇴</Text>
        <DeleteAccountModal
          visible={deleteAccountModalVisible}
          onClose={() => setDeleteAccountModalVisible(false)}
          onDelete={handleDeleteAccountClick}
        />
      </ScrollView>

      <StatusBar />
    </View>
  );
}

function ChangePasswordScreen({ navigation }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handlePasswordChange = async () => {
    try {
      const response = await axios.post(`${config.apiUrl}/change-password`, {
        currentPassword,
        newPassword,
      });

      if (response.status === 200) {
        // 비밀번호 변경 성공 시 알림 및 화면 전환
        alert('비밀번호가 성공적으로 변경되었습니다.');
        navigation.goBack();
      }
    } catch (error) {
      if (error.response && error.response.data.error) {
        // 서버에서 온 오류 메시지 한국어로 표시
        setErrorMessage(error.response.data.error);
      } else {
        setErrorMessage('알 수 없는 오류가 발생했습니다. 다시 시도해 주세요.');
      }
    }
  };

  return (
    <View style={styles.passwordContainer}>
      <TextInput
        style={styles.input}
        placeholder="현재 비밀번호"
        secureTextEntry
        value={currentPassword}
        onChangeText={setCurrentPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="새 비밀번호"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={handlePasswordChange}>
        <Text style={styles.buttonText}>확인</Text>
      </TouchableOpacity>
    </View>
  );
}

function MyPostsScreen({ navigation }) {
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 내가 작성한 글 목록 가져오기
  const fetchMyPosts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${config.apiUrl}/posts/myposts`, { withCredentials: true });
      setMyPosts(response.data);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setMyPosts([]); // 글이 없을 때 빈 배열로 설정
      } else if (error.response && error.response.status === 401) {
        console.error('사용자 인증 실패');
      } else {
        console.error('내가 작성한 글 불러오기 실패:', error);
      }
    } finally {
      setLoading(false);
    }
  }, []);



  // 화면이 focus될 때마다 내 글 목록 새로고침
  useFocusEffect(
    useCallback(() => {
      fetchMyPosts(); // Fetch posts when screen is focused
    }, [fetchMyPosts]) // fetchMyPosts를 의존성으로 추가
  );

  // 로딩 중일 때
  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <ScrollView style={styles.postsContainer} contentContainerStyle={{ marginBottom: 80 }}>
      {myPosts.length > 0 ? (
        myPosts.map((post, index) => (
          <TouchableOpacity
            key={post.id} // 고유한 키를 사용
            style={styles.postItem}
            onPress={() => navigation.navigate('PostDetail', { post })}
          >
            <View style={styles.titleContainer}>
              <Text style={styles.postTitle}>{post.title}</Text>
              <Ionicons name="chatbubble-ellipses-outline" size={20} color="gray" />
            </View>
            <Text style={styles.postMessage}>{post.message}</Text>
          </TouchableOpacity>
        ))
      ) : (
        <Text>내가 작성한 글이 없습니다.</Text>
      )}
    </ScrollView>
  );
}

function ScrappedPostsScreen({ navigation }) {
  const [scrappedPosts, setScrappedPosts] = useState([]); // 스크랩한 글 목록 상태
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [isScraped, setIsScraped] = useState(false);


  useEffect(() => {
    fetchScrappedPosts(); // 스크랩된 글을 가져오는 함수
  }, []);

  const fetchScrappedPosts = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/scrap/read/myscrap`, { withCredentials: true });
      const updatedPosts = response.data.map(post => ({
        ...post,
        isScraped: true, // 스크랩된 글이므로 true로 설정
      }));
      setScrappedPosts(updatedPosts);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setScrappedPosts([]); // 글이 없을 때 빈 배열로 설정
      } else {
        console.error('내가 스크랩한 글 불러오기 실패:', error);
      }
    } finally {
      setLoading(false);
    }
  };


  const handleScrap = async (postId) => {
    try {
      let updatedPosts;

      const postToUpdate = scrappedPosts.find(post => post.id === postId);

      if (postToUpdate.isScraped) {
        // 스크랩 해제 요청
        await axios.delete(`${config.apiUrl}/scrap/${postId}`, { withCredentials: true });
        // 해제된 게시글을 배열에서 제거
        updatedPosts = scrappedPosts.filter(post => post.id !== postId);
      } else {
        // 스크랩 추가 요청
        await axios.post(`${config.apiUrl}/scrap`, { post_id: postId }, { withCredentials: true });
        // 상태를 업데이트
        updatedPosts = scrappedPosts.map(post =>
          post.id === postId ? { ...post, isScraped: true } : post
        );
      }

      setScrappedPosts(updatedPosts);
    } catch (error) {
      console.error('스크랩 오류:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchScrappedPosts();
    }, [])
  );

  if (loading) {
    return <Text>로딩 중...</Text>;
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.postsContainer} contentContainerStyle={{ marginBottom: 80 }}>
        {scrappedPosts.length === 0 ? (
          <Text>스크랩한 글이 없습니다.</Text>
        ) : (
          scrappedPosts.map((post, index) => (
            <TouchableOpacity
              key={index}
              style={styles.postItem}
              onPress={() => navigation.navigate('PostDetail', { post })}
            >
              <View style={styles.titleContainer}>
                <Text style={styles.postTitle}>{post.title}</Text>
                <TouchableOpacity onPress={() => handleScrap(post.id)} style={styles.scrapButton}>
                  <FontAwesome name={post.isScraped ? 'star' : 'star-o'} size={20} color={post.isScraped ? 'gold' : 'black'} />
                </TouchableOpacity>
              </View>
              <Text style={styles.postMessage}>{post.message}</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

    </View>
  );
}

function NotificationSettingsScreen() {
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);

  return (
    <View style={styles.container}>
      <View style={styles.notificationContainer}>
        <Text>푸시 알림</Text>
        <Switch
          trackColor={{ false: "#98A7AF", true: "#92B2AE" }}
          thumbColor={isEnabled ? "#f4f3f4" : "#f4f3f4"}
          onValueChange={toggleSwitch}
          value={isEnabled}
        />
      </View>
    </View>
  );
}

function PrivacyPolicyScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ marginBottom: 80 }}>
      <Text style={styles.privacypolicytitle}>{PrivacyPolicyContent.title}</Text>
      <Text style={styles.privacypolicyIntroduction}>{PrivacyPolicyContent.introduction}</Text>

      {PrivacyPolicyContent.sections.map((section, index) => (
        <React.Fragment key={index}>
          <Text style={styles.privacypolicysectionTitle}>{section.title}</Text>
          {section.content.map((text, idx) => (
            <Text key={idx} style={styles.privacypolicycontentText}>{text}</Text>
          ))}
        </React.Fragment>
      ))}
    </ScrollView>
  );
}

function InquiryScreen({ navigation }) {
  const [inquiry, setInquiry] = useState('');

  const handleSendInquiry = () => {
    console.log('문의 내용:', inquiry);
    navigation.goBack();
  };

  return (
    <View style={styles.inquiryContainer}>
      <TextInput
        placeholder="문의 내용을 입력하세요"
        value={inquiry}
        onChangeText={setInquiry}
        multiline
      />
      <TouchableOpacity style={styles.button} onPress={handleSendInquiry}>
        <Text style={styles.buttonText}>보내기</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function Mypage({ handleLogout }) {
  return (
    <Stack.Navigator initialRouteName="Main">
      <Stack.Screen
        name="Main"
        options={{ headerShown: false }}
      >
        {props => <MainScreen {...props} handleLogout={handleLogout} />}
      </Stack.Screen>
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{
          title: '비밀번호 변경',
          headerStyle: {
            shadowOpacity: 0,
            elevation: 0,
            // paddingTop: 20,
            // height: 80,
          },
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: 'bold',
            alignSelf: 'flex-start',
          },
          headerBackTitleVisible: false,
          headerTintColor: '#000',
          headerLeft: ({ onPress }) => (
            <TouchableOpacity onPress={onPress} style={{ marginLeft: 10 }}>
              <MaterialIcons name="keyboard-arrow-left" size={30} color="black" />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="MyPosts"
        component={MyPostsScreen}
        options={{
          title: '내가 작성한 글',
          headerStyle: {
            shadowOpacity: 0,
            elevation: 0,
            // paddingTop: 20,
            // height: 80,
          },
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: 'bold',
            alignSelf: 'flex-start',
          },
          headerBackTitleVisible: false,
          headerTintColor: '#000',
          headerLeft: ({ onPress }) => (
            <TouchableOpacity onPress={onPress} style={{ marginLeft: 10 }}>
              <MaterialIcons name="keyboard-arrow-left" size={30} color="black" />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="PostDetail"
        component={PostDetail}  // PostDetail 추가
        options={{
          headerShown: false,  // 상단바 숨기기
        }}
      />
      <Stack.Screen
        name="UpdatePost"
        component={UpdatePost}
        options={{
          headerShown: false,  // 상단바 숨기기
        }}
      />
      <Stack.Screen
        name="ScrappedPosts"
        component={ScrappedPostsScreen}
        options={{
          title: '스크랩한 글',
          headerStyle: {
            shadowOpacity: 0,
            elevation: 0,
            // paddingTop: 20,
            // height: 80,
          },
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: 'bold',
            alignSelf: 'flex-start',
          },
          headerBackTitleVisible: false,
          headerTintColor: '#000',
          headerLeft: ({ onPress }) => (
            <TouchableOpacity onPress={onPress} style={{ marginLeft: 10 }}>
              <MaterialIcons name="keyboard-arrow-left" size={30} color="black" />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="NotificationSettings"
        component={NotificationSettingsScreen}
        options={{
          title: '알림 설정',
          headerStyle: {
            shadowOpacity: 0,
            elevation: 0,
            // paddingTop: 20,
            // height: 80,
          },
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: 'bold',
            alignSelf: 'flex-start',
          },
          headerBackTitleVisible: false,
          headerTintColor: '#000',
          headerLeft: ({ onPress }) => (
            <TouchableOpacity onPress={onPress} style={{ marginLeft: 10 }}>
              <MaterialIcons name="keyboard-arrow-left" size={30} color="black" />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={{
          title: '개인정보 처리방침',
          headerStyle: {
            shadowOpacity: 0,
            elevation: 0,
          },
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: 'bold',
            alignSelf: 'flex-start',
          },
          headerBackTitleVisible: false,
          headerTintColor: '#000',
          headerLeft: ({ onPress }) => (
            <TouchableOpacity onPress={onPress} style={{ marginLeft: 10 }}>
              <MaterialIcons name="keyboard-arrow-left" size={30} color="black" />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="Inquiry"
        component={InquiryScreen}
        options={{
          title: '문의사항',
          headerStyle: {
            shadowOpacity: 0,
            elevation: 0,
            // paddingTop: 20,
            // height: 80,
          },
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
            alignSelf: 'flex-start',
          },
          headerBackTitleVisible: false,
          headerTintColor: '#000',
          headerLeft: ({ onPress }) => (
            <TouchableOpacity onPress={onPress} style={{ marginLeft: 10 }}>
              <MaterialIcons name="keyboard-arrow-left" size={30} color="black" />
            </TouchableOpacity>
          ),
        }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  iconButton: {
    marginRight: 10,
  },
  backText: {
    fontSize: 18,
    color: '#000',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  postsContainer: {
    paddingHorizontal: 20,
    backgroundColor: 'white',
  },
  commentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postTitle: {
    fontSize: 16,
    color: '#000',
    flex: 1,
  },
  postCommentCount: {
    fontSize: 16,
    color: '#999',
    marginLeft: 5,
  },
  postStar: {
    fontSize: 16,
    color: 'yellow',
  },
  nametitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollViewContent: {
    paddingTop: 50,
    paddingBottom: 50,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  imgContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 50,
  },
  pyeong: {
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_HEIGHT * 0.2,
    top: -10,
    right: 10,
  },
  bag: {
    width: SCREEN_WIDTH * 0.15,
    height: SCREEN_HEIGHT * 0.1,
    right: 105,
    top: 75,

  },
  modeContainer: {
    width: SCREEN_WIDTH,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  modeButtonText: {
    marginLeft: 20,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 22,
    textAlign: 'center',
  },
  separator: {
    width: SCREEN_WIDTH * 0.9,
    height: 1,
    backgroundColor: '#D6D6D6',
    marginVertical: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    marginLeft: 20,
  },
  message: {
    alignSelf: 'flex-start',
    marginLeft: 20,
    paddingTop: 5,
    marginTop: 5,
  },
  passwordContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  input: {
    width: SCREEN_WIDTH * 0.8,
    height: 40,
    borderColor: '#ccc',
    backgroundColor: '#F3F3F3',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginVertical: 10,
  },
  button: {
    width: 60,
    height: 35,
    backgroundColor: '#5A4A3E',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginTop: 50,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  inquiryContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  inquiryInput: {
    width: SCREEN_WIDTH * 0.8,
    height: 150,
    backgroundColor: '#F3F3F3',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginVertical: 10,
    textAlignVertical: 'top',
  },
  notificationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: SCREEN_WIDTH,
    marginTop: 20,
    paddingHorizontal: 20,
  },
  notificationText: {
    fontSize: 18,
  },
  postItem: {
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  titleContainer: {
    flexDirection: 'row', // 제목과 아이콘을 나란히 배치
    alignItems: 'center', // 세로 중앙 정렬
    justifyContent: 'space-between',
  },
  postTitle: {
    // 제목 스타일
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8, // 제목과 아이콘 사이 간격
  },
  postMessage: {
    // 본문 스타일
    fontSize: 14,
    color: '#666',
    marginTop: 4, // 본문과 제목 사이 간격
  },
  privacypolicytitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
    paddingHorizontal: 10,
  },
  privacypolicyIntroduction: {
    fontSize: 14,
    lineHeight: 24,
    color: '#555',
    paddingHorizontal: 10,
  },
  privacypolicysectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
    color: '#333',
    paddingHorizontal: 10,
  },
  privacypolicycontentText: {
    fontSize: 14,
    lineHeight: 24,
    color: '#555',
    paddingHorizontal: 10,
  },
});
