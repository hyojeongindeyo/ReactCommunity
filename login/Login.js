import 'react-native-gesture-handler';
import React, { useState, useContext } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Dimensions, TextInput, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ThemeProvider, ThemeContext } from './ThemeContext'; // Adjust this import if the path is different

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const Stack = createStackNavigator();

function LoginScreen({ navigation }) {
  const { isDarkMode } = useContext(ThemeContext);
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    console.log('아이디:', id);
    console.log('비밀번호:', password);
    // Navigate to MainScreen after login
    // navigation.navigate('Main');
  };

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <TextInput
        style={[styles.input1, isDarkMode && styles.darkInput]}
        placeholder="아이디"
        value={id}
        onChangeText={setId}
        placeholderTextColor={isDarkMode ? '#fff' : '#000'}
      />
      <TextInput
        style={[styles.input1, isDarkMode && styles.darkInput]}
        placeholder="비밀번호"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        placeholderTextColor={isDarkMode ? '#fff' : '#000'}
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>로그인</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
        <Text style={styles.linkText}>회원가입</Text>
      </TouchableOpacity>
    </View>
  );
}

function SignupScreen({ navigation }) {
  const { isDarkMode } = useContext(ThemeContext);
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');

  const handleSignup = () => {
    if (password !== confirmPassword) {
      console.log('비밀번호가 일치하지 않습니다.');
      return;
    }
    console.log('아이디:', id);
    console.log('비밀번호:', password);
    console.log('휴대폰 번호:', phone);
    // 여기서 아이디, 비밀번호, 전화번호를 서버에 전송하는 로직을 추가하세요.
    navigation.navigate('Login');
  };

  return (
    <View style={[styles.signupContainer, isDarkMode && styles.darkContainer]}>
      <View style={styles.inputContainer}>
        <Text style={[styles.label, isDarkMode && styles.darkLabel]}>아이디</Text>
        <View style={styles.inputWithButton}>
          <TextInput
            style={[styles.inputWithSmallButton, isDarkMode && styles.darkInput]}
            placeholder="8자 이상(영소문자, 숫자)"
            value={id}
            onChangeText={setId}
            placeholderTextColor={isDarkMode ? '#fff' : '#000'}
          />
          <TouchableOpacity style={styles.smallButton}>
            <Text style={styles.smallButtonText}>중복확인</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, isDarkMode && styles.darkLabel]}>비밀번호</Text>
        <TextInput
          style={[styles.input, isDarkMode && styles.darkInput]}
          placeholder="8자 이상(영소문자, 숫자, 특수문자)"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholderTextColor={isDarkMode ? '#fff' : '#000'}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, isDarkMode && styles.darkLabel]}>비밀번호 확인</Text>
        <TextInput
          style={[styles.input, isDarkMode && styles.darkInput]}
          placeholder="비밀번호 재입력"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholderTextColor={isDarkMode ? '#fff' : '#000'}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, isDarkMode && styles.darkLabel]}>휴대폰 번호</Text>
        <TextInput
          style={[styles.input, isDarkMode && styles.darkInput]}
          placeholder="휴대폰 번호"
          value={phone}
          onChangeText={setPhone}
          placeholderTextColor={isDarkMode ? '#fff' : '#000'}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSignup}>
        <Text style={styles.buttonText}>회원가입</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="Signup" 
            component={SignupScreen} 
            options={{ 
              title: '회원가입',
              headerBackTitleVisible: false,
              headerTintColor: '#000',
            }} 
          />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  signupContainer: {
    flex: 1,
    backgroundColor: '#fff',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 50,
  },
  darkContainer: {
    backgroundColor: '#000',
  },
  inputContainer: {
    width: SCREEN_WIDTH * 0.8,
    marginVertical: 10,
  },
  label: {
    fontSize: 14,
    color: '#000',
    marginBottom: 5,
  },
  darkLabel: {
    color: '#fff',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    backgroundColor: '#F3F3F3',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    width: '100%',
    marginTop: 10,
  },
  input1: {
      height: 40,
      borderColor: '#ccc',
      backgroundColor: '#F3F3F3',
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: 10,
      width: '80%',
      marginTop: 10,
  },
  inputWithSmallButton: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    backgroundColor: '#F3F3F3',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  darkInput: {
    backgroundColor: '#333',
    color: '#fff',
    borderColor: '#555',
  },
  inputWithButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  smallButton: {
    marginLeft: 10,
    backgroundColor: '#92B2AE',
    padding: 10,
    borderRadius: 10,
    height: 40,
    justifyContent: 'center',
  },
  smallButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  button: {
    width: SCREEN_WIDTH * 0.6,
    height: 40,
    backgroundColor: '#92B2AE',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkText: {
    color: '#92B2AE',
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
  },
});