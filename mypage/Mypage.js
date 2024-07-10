import 'react-native-gesture-handler';
import React, { useState, useContext } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Dimensions, Image, ScrollView, Switch, TouchableOpacity, TextInput } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { ThemeProvider, ThemeContext } from './ThemeContext';
// import BottomTabBar from '../BottomTabBar';
import LogoutModal from './LogoutModal';
import DeleteAccountModal from './DeleteAccountModal';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const Stack = createStackNavigator();

//테마
const getThemedStyle = (isDarkMode) => ({
  nameStyle : isDarkMode ? styles.darkText : styles.name,
  titleStyle : isDarkMode ? styles.darkText : styles.title,
  modeButtonTextStyle : isDarkMode ? styles.darkText : styles.modeButtonText,
  messageStyle : isDarkMode ? styles.darkText : styles.message,
  containerStyle : isDarkMode ? styles.darkContainer : styles.container,
  inputStyle : isDarkMode ? styles.darkInput : styles.input,
  inquiryContainerStyle : isDarkMode ? styles.darkContainer : styles.inquiryContainer,
  inquiryInputStyle : isDarkMode ? styles.darkInput : styles.inquiryInput,
  profileContainerStyle : isDarkMode ? styles.darkInput : styles.profileContainer,
  passwordContainerStyle : isDarkMode ? styles.darkInput : styles.passwordContainer,
  

  // isDarkMode && styles.darkText
  
});


function MainScreen({ navigation }) {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [deleteAccountModalVisible, setDeleteAccountModalVisible] = useState(false);

  const themedStyle = getThemedStyle(isDarkMode);

  const handleLogout = () => {
    setLogoutModalVisible(false);
  };

  const handleDeleteAccount = () => {
    setDeleteAccountModalVisible(false);
  };

   

  return (
    <View style={[styles.container, themedStyle.containerStyle]}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Text style={[styles.name, themedStyle.nameStyle]}>000님의 평안이</Text>

        <View style={styles.imgContainer}>
          <Image source={require('../assets/pyeong.png')} style={styles.pyeong} resizeMode='contain' />
          <Image source={require('../assets/bag.png')} style={styles.bag} resizeMode='contain' />
        </View>

        <View style={styles.separator} />
        <Text style={[styles.title, themedStyle.titleStyle]}>내 정보</Text>
        <Text style={[styles.message, themedStyle.messageStyle]} onPress={() => navigation.navigate('Profile')}>프로필</Text>
        <Text style={[styles.message, themedStyle.messageStyle]} onPress={() => navigation.navigate('ChangePassword')}>비밀번호 변경</Text>
        <View style={styles.separator} />
        <Text style={[styles.title, themedStyle.titleStyle]}>커뮤니티</Text>
        <Text style={[styles.message, themedStyle.messageStyle]} onPress={() => navigation.navigate('MyPosts')}>내가 작성한 글</Text>
        <Text style={[styles.message, themedStyle.messageStyle]} onPress={() => navigation.navigate('ScrappedPosts')}>스크랩한 글</Text>
        <View style={styles.separator} />
        <Text style={[styles.title, themedStyle.titleStyle]}>설정</Text>
        <View style={styles.modeContainer}>
          <Text style={[styles.modeButtonText, themedStyle.modeButtonTextStyle]}>{isDarkMode ? '다크 모드' : '라이트 모드'}</Text>
          <Switch
            trackColor={{ false: "#767577", true: "#92B2AE" }}
            thumbColor={isDarkMode ? "#f4f3f4" : "#f4f3f4"}
            onValueChange={toggleTheme}
            value={isDarkMode}
          />
        </View>
        <Text style={[styles.message, themedStyle.messageStyle]} onPress={() => navigation.navigate('NotificationSettings')}>알림 설정</Text>
        <View style={styles.separator} />
        <Text style={[styles.title, themedStyle.titleStyle]}>기타</Text>
        <Text style={[styles.message, themedStyle.messageStyle]} onPress={() => navigation.navigate('Inquiry')}>문의사항</Text>
        <Text style={[styles.message, themedStyle.messageStyle]} onPress={() => setLogoutModalVisible(true)}>로그아웃</Text>
        <LogoutModal
          visible={logoutModalVisible}
          onClose={() => setLogoutModalVisible(false)}
          onLogout={handleLogout}
        />
        <Text style={[styles.message, themedStyle.messageStyle]} onPress={() => setDeleteAccountModalVisible(true)}>회원 탈퇴</Text>
        <DeleteAccountModal
          visible={deleteAccountModalVisible}
          onClose={() => setDeleteAccountModalVisible(false)}
          onDelete={handleDeleteAccount}
        />
      </ScrollView>
      {/* <BottomTabBar navigation={navigation} /> */}
      <StatusBar style={isDarkMode ? "light" : "dark"} />
    </View>
  );
}

function ProfileScreen({ navigation }) {
  const { isDarkMode } = useContext(ThemeContext);
  const [name, setName] = useState('***');
  const [id, setId] = useState('**********');
  const [phone, setPhone] = useState('**********');

  const themedStyle = getThemedStyle(isDarkMode);

  const handleSave = () => {
    console.log('이름:', name);
    console.log('아이디:', id);
    console.log('전화번호:', phone);
    navigation.goBack();
  };

  return (
    <View style={[styles.profileContainer, themedStyle.profileContainerStyle]}>
      <TextInput
        style={[styles.input, themedStyle.inputStyle]}
        placeholder="이름"
        value={name}
        onChangeText={setName}
        placeholderTextColor={isDarkMode ? '#fff' : '#000'}
      />
      <TextInput
        style={[styles.input, themedStyle.inputStyle]}
        placeholder="아이디"
        value={id}
        onChangeText={setId}
        placeholderTextColor={isDarkMode ? '#fff' : '#000'}
      />
      <TextInput
        style={[styles.input, themedStyle.inputStyle]}
        placeholder="전화번호"
        value={phone}
        onChangeText={setPhone}
        placeholderTextColor={isDarkMode ? '#fff' : '#000'}
      />
      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>수정</Text>
      </TouchableOpacity>
    </View>
  );
}


// 나머지 화면 컴포넌트 생략
function ChangePasswordScreen({ navigation }) {
  const { isDarkMode } = useContext(ThemeContext);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const themedStyle = getThemedStyle(isDarkMode);

  const handlePasswordChange = () => {
    console.log('현재 비밀번호:', currentPassword);
    console.log('새 비밀번호:', newPassword);
    navigation.goBack();
  };

  return (
    <View style={[styles.passwordContainer, themedStyle.passwordContainerStyle]}>
      <TextInput
        style={[styles.input, themedStyle.inputStyle]}
        placeholder="현재 비밀번호"
        secureTextEntry
        value={currentPassword}
        onChangeText={setCurrentPassword}
        placeholderTextColor={isDarkMode ? '#fff' : '#000'}
      />
      <TextInput
        style={[styles.input, themedStyle.inputStyle]}
        placeholder="새 비밀번호"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
        placeholderTextColor={isDarkMode ? '#fff' : '#000'}
      />
      <TouchableOpacity style={styles.button} onPress={handlePasswordChange}>
        <Text style={styles.buttonText}>확인</Text>
      </TouchableOpacity>
    </View>
  );
}


function MyPostsScreen() {
  const { isDarkMode } = useContext(ThemeContext);
  const themedStyle = getThemedStyle(isDarkMode);
  return (
    <View style={[styles.container, themedStyle.containerStyle]}>
      <Text style={themedStyle.textStyle}>내가 작성한 글 목록</Text>
      {/* 여기에 내가 작성한 글 목록을 보여주는 컴포넌트를 추가할 수 있습니다. */}
    </View>
  );
}

function ScrappedPostsScreen() {
  const { isDarkMode } = useContext(ThemeContext);
  const themedStyle = getThemedStyle(isDarkMode);
  return (
    <View style={[styles.container, themedStyle.containerStyle]}>
      <Text style={themedStyle.textStyle}>내가 스크랩한 글 목록</Text>
      {/* 스크랩한 글을 표시하는 컴포넌트 추가 */}
    </View>
  );
}

function NotificationSettingsScreen() {
  const { isDarkMode } = useContext(ThemeContext);
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);
  const themedStyle = getThemedStyle(isDarkMode);

  return (
    <View style={[styles.container, themedStyle.containerStyle]}>
      <View style={styles.notificationContainer}>
        <Text style={themedStyle.textStyle}>푸시 알림</Text>
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
  const { isDarkMode } = useContext(ThemeContext);
  const [inquiry, setInquiry] = useState('');

  const handleSendInquiry = () => {
    console.log('문의 내용:', inquiry);
    navigation.goBack();
  };
  const themedStyle = getThemedStyle(isDarkMode);

  return (
    <View style={[styles.inquiryContainer, themedStyle.inquiryContainerStyle]}>
      <TextInput
        style={[themedStyle.inquiryInputStyle]}
        placeholder="문의 내용을 입력하세요"
        value={inquiry}
        onChangeText={setInquiry}
        multiline
        placeholderTextColor={isDarkMode ? '#fff' : '#000'}
      />
      <TouchableOpacity style={styles.button} onPress={handleSendInquiry}>
        <Text style={styles.buttonText}>보내기</Text>
      </TouchableOpacity>
    </View>
  );
}






export default function Mypage() {
  return (
    <ThemeProvider>
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
              headerBackTitleVisible: false,
              headerTintColor: '#000', 
            }} 
          />
        <Stack.Screen
          name="MyPosts"
          component={MyPostsScreen}
          options={{
            title: '내가 작성한 글',
            headerBackTitleVisible: false,
            headerTintColor: '#000',
          }}
        />
        <Stack.Screen
          name="ScrappedPosts"
          component={ScrappedPostsScreen}
          options={{
            title: '내가 스크랩한 글',
            headerBackTitleVisible: false,
            headerTintColor: '#000',
          }}
        />
        <Stack.Screen
          name="NotificationSettings"
          component={NotificationSettingsScreen}
          options={{
            title: '알림 설정',
            headerBackTitleVisible: false,
            headerTintColor: '#000',
          }}
        />
        <Stack.Screen
          name="Inquiry"
          component={InquiryScreen}
          options={{
            title: '문의사항',
            headerBackTitleVisible: false,
            headerTintColor: '#000',
          }}
        />
      </Stack.Navigator>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  darkContainer: {
    backgroundColor: '#000',
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
    marginTop: 20,
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
  darkText: {
    color: '#fff',
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
  darkInput: {
    backgroundColor: '#333',
    color: '#fff',
    borderColor: '#555',
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