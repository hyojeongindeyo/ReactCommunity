import 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, Image, View, Dimensions, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import axios from 'axios';
import config from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const LoginScreen = ({ navigation, onLoginSuccess }) => {
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const apiUrl = config.apiUrl;

    // 앱 실행 시 저장된 토큰 확인
    useEffect(() => {
        const checkToken = async () => {
            const token = await AsyncStorage.getItem('userToken'); // 저장된 토큰 가져오기
            console.log('토큰 확인:', token); // 로그로 토큰 확인
            if (token) {
                try {
                    const response = await axios.get(`${apiUrl}/users/verify-token`, {
                        headers: { Authorization: `Bearer ${token}` }, // Bearer 토큰 추가
                    });
                    console.log('토큰 검증 성공:', response.data);
                    if (response.status === 200 && response.data.valid) {
                        onLoginSuccess(response.data.user); // 자동 로그인 처리
                    }
                } catch (error) {
                    console.error('토큰 검증 실패:', error.response?.data || error.message);
                    await AsyncStorage.removeItem('userToken'); // 유효하지 않은 토큰 삭제
                }
            }
        };
    
        checkToken();
    }, []);    

    const handleLogin = async () => {
        if (id.trim() === '' || password.trim() === '') {
            Toast.show({
                type: 'error',
                text1: '입력 오류',
                text2: '아이디와 비밀번호를 모두 입력해 주세요.',
                text1Style: { fontSize: 15, color: 'black' },
                text2Style: { fontSize: 13, color: 'black' },
                visibilityTime: 2000,
            });
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(`${apiUrl}/users/login`, { id, password });

            if (response.status === 200) {
                const { token, user } = response.data;

                if (token) {
                    await AsyncStorage.setItem('userToken', token); // 토큰 저장
                    onLoginSuccess(user); // 로그인 성공 처리
                } else {
                    Toast.show({
                        type: 'error',
                        text1: '로그인 실패',
                        text2: '서버에서 토큰을 받지 못했습니다.',
                        visibilityTime: 2000,
                    });
                }
            } else {
                Toast.show({
                    type: 'error',
                    text1: '로그인 실패',
                    text2: '아이디 또는 비밀번호가 잘못되었습니다.',
                    visibilityTime: 2000,
                });
            }
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: '로그인 실패',
                text2: '서버 오류가 발생했습니다.',
                visibilityTime: 2000,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleGuestLogin = async () => {
        try {
            const response = await fetch(`${apiUrl}/users/guest-login`, {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error('Failed to connect to server');
            }

            const sessionData = await response.json();
            console.log('Session Data:', sessionData);

            if (sessionData && sessionData.user && sessionData.user.id) {
                await AsyncStorage.setItem('userSession', JSON.stringify(sessionData.user));
                onLoginSuccess();
            } else {
                throw new Error('Session creation failed');
            }
        } catch (e) {
            console.error('Failed to set guest session:', e);
            alert('로그인 실패: ' + e.message);
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
                <View style={styles.innerContainer}>
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
                        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
                            <Text style={styles.buttonText}>{loading ? '로그인 중...' : '로그인'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                            <Text style={styles.linkText}>회원가입</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleGuestLogin}>
                            <Text style={styles.linkText}>비회원 로그인</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    innerContainer: {
        flex: 1,
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
        marginTop: 10,
    },
    button: {
        width: '100%',
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
    },
    logoImage: {
        width: 70,
        height: 70,
    },
});

export default LoginScreen;
