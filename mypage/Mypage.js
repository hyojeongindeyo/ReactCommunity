import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Dimensions, Image, ScrollView, Switch, TouchableOpacity, TextInput } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import LogoutModal from './LogoutModal';
import DeleteAccountModal from './DeleteAccountModal';
import axios from 'axios';
import config from '../config';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const Stack = createStackNavigator();

function MainScreen({ navigation }) {
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [deleteAccountModalVisible, setDeleteAccountModalVisible] = useState(false);
  const [nickname, setNickname] = useState('');  // 닉네임 상태 추가

  useEffect(() => {
    // 로그인된 사용자의 세션 정보를 가져오는 함수
    const fetchUserSession = async () => {
      try {
        const response = await axios.get(`${config.apiUrl}/session`, { withCredentials: true });
        setNickname(response.data.nickname);  // 닉네임 상태 업데이트
      } catch (error) {
        console.error('Error fetching user session:', error);
      }
    };

    fetchUserSession();
  }, []);

  const handleLogout = () => {
    setLogoutModalVisible(false);
  };

  const handleDeleteAccount = () => {
    setDeleteAccountModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View>
          <Text style={styles.nametitle}>{nickname}님의 평안이</Text>
        </View>

        <View style={styles.imgContainer}>
          <Image source={require('../assets/pyeong.png')} style={styles.pyeong} resizeMode='contain' />
          <Image source={require('../assets/bag.png')} style={styles.bag} resizeMode='contain' />
        </View>

        <View style={styles.separator} />
        <Text style={styles.title}>내 정보</Text>
        <Text style={styles.message} onPress={() => navigation.navigate('Profile')}>프로필</Text>
        <Text style={styles.message} onPress={() => navigation.navigate('ChangePassword')}>비밀번호 변경</Text>
        <View style={styles.separator} />
        <Text style={styles.title}>커뮤니티</Text>
        <Text style={styles.message} onPress={() => navigation.navigate('MyPosts')}>내가 작성한 글</Text>
        <Text style={styles.message} onPress={() => navigation.navigate('ScrappedPosts')}>스크랩한 글</Text>
        <View style={styles.separator} />
        <Text style={styles.title}>설정</Text>
        <Text style={styles.message} onPress={() => navigation.navigate('NotificationSettings')}>알림 설정</Text>
        <View style={styles.separator} />
        <Text style={styles.title}>기타</Text>
        <Text style={styles.message} onPress={() => navigation.navigate('Inquiry')}>문의사항</Text>
        <Text style={styles.message} onPress={() => setLogoutModalVisible(true)}>로그아웃</Text>
        <LogoutModal
          visible={logoutModalVisible}
          onClose={() => setLogoutModalVisible(false)}
          onLogout={handleLogout}
        />
        <Text style={styles.message} onPress={() => setDeleteAccountModalVisible(true)}>회원 탈퇴</Text>
        <DeleteAccountModal
          visible={deleteAccountModalVisible}
          onClose={() => setDeleteAccountModalVisible(false)}
          onDelete={handleDeleteAccount}
        />
      </ScrollView>

      <StatusBar />
    </View>
  );
}

function ProfileScreen({ navigation }) {
  const [name, setName] = useState('***');
  const [id, setId] = useState('**********');
  const [phone, setPhone] = useState('**********');

  const handleSave = () => {
    console.log('이름:', name);
    console.log('아이디:', id);
    console.log('전화번호:', phone);
    navigation.goBack();
  };

  return (
    <View style={styles.profileContainer}>
      <TextInput
        style={styles.input}
        placeholder="이름"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="아이디"
        value={id}
        onChangeText={setId}
      />
      <TextInput
        style={styles.input}
        placeholder="전화번호"
        value={phone}
        onChangeText={setPhone}
      />
      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>수정</Text>
      </TouchableOpacity>
    </View>
  );
}

function ChangePasswordScreen({ navigation }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handlePasswordChange = () => {
    console.log('현재 비밀번호:', currentPassword);
    console.log('새 비밀번호:', newPassword);
    navigation.goBack();
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
      <TouchableOpacity style={styles.button} onPress={handlePasswordChange}>
        <Text style={styles.buttonText}>확인</Text>
      </TouchableOpacity>
    </View>
  );
}

function MyPostsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header} />
      <ScrollView style={styles.postsContainer}>
        <View style={styles.postItem}>
          <Text style={styles.postTitle}>00사거리에 교통사고 났대요 그래서...</Text>
          <View style={styles.commentContainer}>
            <Ionicons name="chatbubble-ellipses-outline" size={20} color="gray" />
            <Text style={styles.postCommentCount}>6</Text>
          </View>
        </View>
        <View style={styles.postItem}>
          <Text style={styles.postTitle}>역 앞에서 시위 중이에요 조심하세요!</Text>
          <View style={styles.commentContainer}>
            <Ionicons name="chatbubble-ellipses-outline" size={20} color="gray" />
            <Text style={styles.postCommentCount}>2</Text>
          </View>
        </View>
        <View style={styles.postItem}>
          <Text style={styles.postTitle}>역 주위에 정차된 차들이 많아서 차가 많이...</Text>
          <View style={styles.commentContainer}>
            <Ionicons name="chatbubble-ellipses-outline" size={20} color="gray" />
            <Text style={styles.postCommentCount}>5</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function ScrappedPostsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header} />
      <ScrollView style={styles.postsContainer}>
        <View style={styles.postItem}>
          <Text style={styles.postTitle}>00사거리에 교통사고 났대요 그래서...</Text>
          <Ionicons name="star" size={16} color="#FFF500" />
        </View>
        <View style={styles.postItem}>
          <Text style={styles.postTitle}>역 앞에서 시위 중이에요 조심하세요!</Text>
          <Ionicons name="star" size={16} color="#FFF500" />
        </View>
        <View style={styles.postItem}>
          <Text style={styles.postTitle}>역 주위에 정차된 차들이 많아서 차가 많이...</Text>
          <Ionicons name="star" size={16} color="#FFF500" />
        </View>
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

export default function Mypage() {
  return (
    <Stack.Navigator initialRouteName="Main">
      <Stack.Screen
        name="Main"
        component={MainScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: '프로필',
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
  },
  postItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
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
  },
  bag: {
    width: SCREEN_WIDTH * 0.15,
    height: SCREEN_HEIGHT * 0.1,
    right: 145,
    top: 70,
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
});
