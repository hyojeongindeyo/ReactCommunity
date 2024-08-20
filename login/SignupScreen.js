import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Dimensions, TextInput, TouchableOpacity } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const SignupScreen = ({ navigation }) => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [nickname, setNickname] = useState('');

  const handleSignup = () => {
    if (password !== confirmPassword) {
      console.log('비밀번호가 일치하지 않습니다.');
      return;
    }
    console.log('아이디:', id);
    console.log('비밀번호:', password);
    console.log('휴대폰 번호:', phone);
    console.log('닉네임:', nickname);
    // 회원가입 처리 로직 추가 후 LoginScreen으로 이동
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>평안</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="아이디"
          value={id}
          onChangeText={setId}
          placeholderTextColor="#000"
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="비밀번호"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholderTextColor="#000"
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="비밀번호 확인"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholderTextColor="#000"
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="휴대폰 번호"
          value={phone}
          onChangeText={setPhone}
          placeholderTextColor="#000"
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="닉네임"
          value={nickname}
          onChangeText={setNickname}
          placeholderTextColor="#000"
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSignup}>
        <Text style={styles.buttonText}>회원가입</Text>
      </TouchableOpacity>
      <StatusBar style="auto" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 50,
  },
  title: {
    fontSize: 36,
    color: '#92B2AE',
    marginBottom: 40,
  },
  inputContainer: {
    width: SCREEN_WIDTH * 0.8,
    marginVertical: 10,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    backgroundColor: '#F3F3F3',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    width: '100%',
  },
  button: {
    width: SCREEN_WIDTH * 0.6,
    height: 50,
    backgroundColor: '#92B2AE',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    marginTop: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SignupScreen;
