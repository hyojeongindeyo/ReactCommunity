import React from 'react';
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
  </Stack.Navigator>
);

const App = () => {
  return (
    <PostsProvider>
      <CommentsProvider>
        <NavigationContainer>
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
        </NavigationContainer>
      </CommentsProvider>
    </PostsProvider>
  );
};

export default App;
