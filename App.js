import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { CommentsProvider } from './community/CommentsContext';
import { PostsProvider } from './community/PostsContext';
import BottomTabBar from './BottomTabBar.js';
import HomeScreen from './mainpage/HomeScreen';
import Mypage from './mypage/Mypage.js';
import Camera from './camera/Camera.js';
import Community from './community/Community.js';
import NearbySafety from './community/NearbySafety.js';
import SafetyInfo from './community/SafetyInfo';
import WritePost from './community/WritePost.js';
import PostDetail from './community/PostDetail';
import Shelter from './shelter/Shelter.js';
import LoginScreen from './login/LoginScreen'; // 로그인 페이지
import SignupScreen from './login/SignupScreen'; // 회원가입 페이지
import UpdatePost from './community/UpdatePost.js';
import Toast from 'react-native-toast-message';
import MenuPage from './menuBar.js';


const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const CommunityStack = () => (
  <Stack.Navigator initialRouteName="CommunityHome" screenOptions={{ headerShown: false }}>
    <Stack.Screen name="CommunityHome" component={Community} />
    <Stack.Screen name="NearbySafety" component={NearbySafety} />
    <Stack.Screen name="WritePost" component={WritePost} />
    <Stack.Screen name="SafetyInfo" component={SafetyInfo} />
    <Stack.Screen name="PostDetail" component={PostDetail} />
    <Stack.Screen name="UpdatePost" component={UpdatePost} />
    {/* <Stack.Screen name="HomeScreen" component={HomeScreen} /> */}
    <Stack.Screen name="MenuPage" component={MenuPage} />
  </Stack.Navigator>
);

const HomeStack = () => (
  <Stack.Navigator initialRouteName="HomeScreen" screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HomeScreen" component={HomeScreen} />
    {/* <Stack.Screen name="NearbySafety" component={NearbySafety} /> */}
    {/* <Stack.Screen name="PostDetail" component={PostDetail} /> */}
    {/* <Stack.Screen name="WritePost" component={WritePost} /> */}
    {/* <Stack.Screen name="UpdatePost" component={UpdatePost} /> */}
    <Stack.Screen name="MenuPage" component={MenuPage} />
    {/* <Stack.Screen name="SafetyInfo" component={SafetyInfo} /> */}

  </Stack.Navigator>
);

const MainScreen = ({ handleLogout }) => (
  <Tab.Navigator
    tabBar={(props) => <BottomTabBar {...props} />}
    screenOptions={{ headerShown: false, tabBarHideOnKeyboard: true, }}
    
  >
    <Tab.Screen name="Home" component={HomeStack} />
    <Tab.Screen name="Mypage">
      {props => <Mypage {...props} handleLogout={handleLogout} />}
    </Tab.Screen>
    <Tab.Screen name="Camera" component={Camera} />
    <Tab.Screen name="Community" component={CommunityStack} />
    <Tab.Screen name="Shelter" component={Shelter} />
    
  </Tab.Navigator>
);

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태를 관리

  // 로그인 성공 시 호출될 함수
  const handleLoginSuccess = () => {
    setIsLoggedIn(true); // 로그인 상태를 true로 변경
  };

  const handleLogout = () => {
    setIsLoggedIn(false); // 로그아웃 시 로그인 상태를 false로 변경
  };

  return (
    <PostsProvider>
      <CommentsProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {isLoggedIn ? (
              <Stack.Screen name="Main">
                {props => <MainScreen {...props} handleLogout={handleLogout} />}
              </Stack.Screen>
            ) : (
              <>
                <Stack.Screen name="Login">
                  {props => <LoginScreen {...props} onLoginSuccess={handleLoginSuccess} />}
                </Stack.Screen>
                <Stack.Screen name="Signup" component={SignupScreen} />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </CommentsProvider>
      <Toast />
    </PostsProvider>
    
  );
};

export default App;
