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

  const handleSignup = () => {
    if (password !== confirmPassword) {
      console.log('비밀번호가 일치하지 않습니다.');
      return;
    }
    console.log('아이디:', id);
    console.log('비밀번호:', password);
    console.log('휴대폰 번호:', phone);
    // 회원가입 처리 로직 추가 후 LoginScreen으로 이동
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>아이디</Text>
        <TextInput
          style={styles.input}
          placeholder="8자 이상(영소문자, 숫자)"
          value={id}
          onChangeText={setId}
          placeholderTextColor="#000"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>비밀번호</Text>
        <TextInput
          style={styles.input}
          placeholder="8자 이상(영소문자, 숫자, 특수문자)"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholderTextColor="#000"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>비밀번호 확인</Text>
        <TextInput
          style={styles.input}
          placeholder="비밀번호 재입력"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholderTextColor="#000"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>휴대폰 번호</Text>
        <TextInput
          style={styles.input}
          placeholder="휴대폰 번호"
          value={phone}
          onChangeText={setPhone}
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
  inputContainer: {
    width: SCREEN_WIDTH * 0.8,
    marginVertical: 10,
  },
  label: {
    fontSize: 14,
    color: '#000',
    marginBottom: 5,
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
});

export default SignupScreen;
