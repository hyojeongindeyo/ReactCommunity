import React, { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { StatusBar } from 'expo-status-bar';
import { View, Text, Image, StyleSheet, Dimensions, ActivityIndicator, ScrollView } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AntDesign from '@expo/vector-icons/AntDesign';
import Weather from './Weather'; // Weather 컴포넌트 import
import Swiper from 'react-native-swiper';
import BottomTabBar from './BottomTabBar';
import Entypo from '@expo/vector-icons/Entypo';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './HomeScreen';
import Mypage from './mypage/Mypage.js'; // Mypage 컴포넌트 import
import Camera from './camera/Camera.js';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const Tab = createBottomTabNavigator();

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
        {/* 다른 탭 화면을 여기에 추가할 수 있습니다 */}
      </Tab.Navigator>
    </NavigationContainer>
  );
};


export default App;
