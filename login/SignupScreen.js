import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, Image, View, Dimensions, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Alert } from 'react-native';
import axios from 'axios'; // axios를 사용하여 API 호출
import config from '../config';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const SignupScreen = ({ navigation }) => {
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [email, setEmail] = useState('');
    const [nickname, setNickname] = useState('');
    const apiUrl = config.apiUrl;

    const handleSignup = async () => {
        if (password !== confirmPassword) {
            Alert.alert('비밀번호 불일치', '비밀번호가 일치하지 않습니다.');
            return;
        }

        try {
            
            const response = await axios.post(`${apiUrl}/users/signup`, { // 서버의 IP 주소와 포트를 사용하세요
                id,
                password,
                email,
                nickname,
            });

            if (response.status === 200) {
                Alert.alert('회원가입 성공', response.data.message);
                navigation.navigate('Login');
            }
        }  catch (error) {
            if (error.response) {
                // 서버가 응답했지만 상태 코드가 2xx가 아닌 경우
                console.error('서버 응답 오류:', error.response.data);
                Alert.alert('회원가입 실패', `오류: ${error.response.data.error}`);
            } else if (error.request) {
                // 요청이 서버로 전송되었으나 응답을 받지 못한 경우
                console.error('요청 오류:', error.request);
                Alert.alert('회원가입 실패', '서버가 응답하지 않습니다.');
            } else {
                // 오류가 발생한 이유가 설정된 요청이 아닌 경우
                console.error('설정 오류:', error.message);
                Alert.alert('회원가입 실패', '회원가입 처리 중 오류가 발생했습니다.');
            }
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <Image source={require('../assets/logo.png')} style={styles.logoImage} resizeMode="contain" />

                <View style={styles.formContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="아이디"
                        value={id}
                        onChangeText={setId}
                        placeholderTextColor="#000"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="비밀번호"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                        placeholderTextColor="#000"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="비밀번호 확인"
                        secureTextEntry
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        placeholderTextColor="#000"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="이메일 주소"
                        value={email}
                        onChangeText={setEmail}
                        placeholderTextColor="#000"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="닉네임"
                        value={nickname}
                        onChangeText={setNickname}
                        placeholderTextColor="#000"
                    />

                    <TouchableOpacity style={styles.button} onPress={handleSignup}>
                        <Text style={styles.buttonText}>회원가입</Text>
                    </TouchableOpacity>
                </View>

                <StatusBar style="auto" />
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    formContainer: {
        width: '80%',
        alignItems: 'center',
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        backgroundColor: '#F3F3F3',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 10,
        width: '100%',
        marginTop: 18,
    },
    button: {
        width: '100%',
        height: 40,
        backgroundColor: '#92B2AE',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        marginTop: 40,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    logoImage: {
        width: 70,
        height: 70,
    },
});

export default SignupScreen;
