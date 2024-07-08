import React, { useState, useEffect, useRef } from 'react';

import { View, Text, Image, StyleSheet, Dimensions, ActivityIndicator, ScrollView } from 'react-native';
import BottomTabBar from './BottomTabBar.js';
import Entypo from '@expo/vector-icons/Entypo';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './mainpage//HomeScreen';
import Mypage from './mypage/Mypage.js'; // Mypage 컴포넌트 import
import Camera from './camera/Camera.js';
import Community from './community/Community.js';
import NearbySafety from './community/NearbySafety.js';
import WritePost from './community/WritePost.js';

import { createStackNavigator } from '@react-navigation/stack';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        tabBar={(props) => <BottomTabBar {...props} />}
        screenOptions={{
          headerShown: false // 이 부분을 추가하여 화면 제목을 숨김
        }}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Mypage" component={Mypage} />
        <Tab.Screen name="Camera" component={Camera} />
        <Tab.Screen name="Community" component={CommunityStack} />
        {/* 다른 탭 화면을 여기에 추가할 수 있습니다 */}
      </Tab.Navigator>
    </NavigationContainer>
  );
};
const CommunityStack = () => {
  return (
    <Stack.Navigator initialRouteName="CommunityHome" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CommunityHome" component={Community} />
      <Stack.Screen name="NearbySafety" component={NearbySafety} />
      <Stack.Screen name="WritePost" component={WritePost} />
    </Stack.Navigator>
  );
};



export default App;
