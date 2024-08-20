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

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const CommunityStack = () => (
  <Stack.Navigator initialRouteName="CommunityHome" screenOptions={{ headerShown: false }}>
    <Stack.Screen name="CommunityHome" component={Community} />
    <Stack.Screen name="NearbySafety" component={NearbySafety} />
    <Stack.Screen name="WritePost" component={WritePost} />
    <Stack.Screen name="SafetyInfo" component={SafetyInfo} />
    <Stack.Screen name="PostDetail" component={PostDetail} />
  </Stack.Navigator>
);

const HomeStack = () => (
  <Stack.Navigator initialRouteName="HomeScreen" screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HomeScreen" component={HomeScreen} />
    <Stack.Screen name="NearbySafety" component={NearbySafety} />
    <Stack.Screen name="PostDetail" component={PostDetail} />
    <Stack.Screen name="WritePost" component={WritePost} />
  </Stack.Navigator>
);

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태를 관리

  return (
    <PostsProvider>
      <CommentsProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {isLoggedIn ? (
              // 로그인 상태가 true일 때, Tab Navigator를 표시
              <Stack.Screen name="Main" component={() => (
                <Tab.Navigator
                  tabBar={(props) => <BottomTabBar {...props} />}
                  screenOptions={{ headerShown: false }}
                >
                  <Tab.Screen name="Home" component={HomeStack} />
                  <Tab.Screen name="Mypage" component={Mypage} />
                  <Tab.Screen name="Camera" component={Camera} />
                  <Tab.Screen name="Community" component={CommunityStack} />
                  <Tab.Screen name="Shelter" component={Shelter} />
                </Tab.Navigator>
              )} />
            ) : (
              <>
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Signup" component={SignupScreen} />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </CommentsProvider>
    </PostsProvider>
  );
};

export default App;
