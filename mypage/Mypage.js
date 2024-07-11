import 'react-native-gesture-handler';
import React, { useState, useContext } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Dimensions, Image, ScrollView, Switch, TouchableOpacity, TextInput } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import LogoutModal from './LogoutModal';
import DeleteAccountModal from './DeleteAccountModal';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const Stack = createStackNavigator();




function MainScreen({ navigation }) {

  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [deleteAccountModalVisible, setDeleteAccountModalVisible] = useState(false);



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
          <Text style={styles.nametitle}>000님의 평안이</Text>
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
      {/* <BottomTabBar navigation={navigation} /> */}
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


// 나머지 화면 컴포넌트 생략
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
      <Text>내가 작성한 글 목록</Text>
      {/* 여기에 내가 작성한 글 목록을 보여주는 컴포넌트를 추가할 수 있습니다. */}
    </View>
  );
}

function ScrappedPostsScreen() {

  return (
    <View style={styles.container}>
      <Text>내가 스크랩한 글 목록</Text>
      {/* 스크랩한 글을 표시하는 컴포넌트 추가 */}
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
      {/* 추가적인 알림 설정 옵션을 여기에 추가할 수 있습니다. */}
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
            shadowOpacity: 0, // iOS에서 선 제거
            elevation: 0, // 안드로이드에서 선 제거
          },
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 20,
          },
          headerBackTitleVisible: false,
          headerTintColor: '#000',
        }}
      />
      {/* 나머지 Stack.Screen 추가 */}
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{
          title: '비밀번호 변경',
          headerStyle: {
            shadowOpacity: 0, // iOS에서 선 제거
            elevation: 0, // 안드로이드에서 선 제거
          },
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 20,
          },
          headerBackTitleVisible: false,
          headerTintColor: '#000',
        }}
      />
      <Stack.Screen
        name="MyPosts"
        component={MyPostsScreen}
        options={{
          title: '내가 작성한 글',
          headerStyle: {
            shadowOpacity: 0, // iOS에서 선 제거
            elevation: 0, // 안드로이드에서 선 제거
          },
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 20,
          },
          headerBackTitleVisible: false,
          headerTintColor: '#000',
        }}
      />
      <Stack.Screen
        name="ScrappedPosts"
        component={ScrappedPostsScreen}
        options={{
          title: '내가 스크랩한 글',
          headerStyle: {
            shadowOpacity: 0, // iOS에서 선 제거
            elevation: 0, // 안드로이드에서 선 제거
          },
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 20,
          },
          headerBackTitleVisible: false,
          headerTintColor: '#000',
        }}
      />
      <Stack.Screen
        name="NotificationSettings"
        component={NotificationSettingsScreen}
        options={{
          title: '알림 설정',
          headerStyle: {
            shadowOpacity: 0, // iOS에서 선 제거
            elevation: 0, // 안드로이드에서 선 제거
          },
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 20,
          },
          headerBackTitleVisible: false,
          headerTintColor: '#000',
        }}
      />
      <Stack.Screen
        name="Inquiry"
        component={InquiryScreen}
        options={{
          title: '문의사항',
          headerStyle: {
            shadowOpacity: 0, // iOS에서 선 제거
            elevation: 0, // 안드로이드에서 선 제거
          },
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 20,
          },
          headerBackTitleVisible: false,
          headerTintColor: '#000',
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
    width: SCREEN_WIDTH * 1,
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