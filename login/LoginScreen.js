import 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, Image, View, Dimensions, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import axios from 'axios'; // axios를 사용하여 API 호출
import config from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage'; // AsyncStorage import


const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const LoginScreen = ({ navigation, onLoginSuccess }) => {
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const apiUrl = config.apiUrl;

    // 앱 시작 시 AsyncStorage에서 토큰을 불러와 자동 로그인 시도
    useEffect(() => {
        const checkToken = async () => {
            const token = await AsyncStorage.getItem('userToken');
            if (token) {
                try {
                    // 토큰을 사용하여 백엔드에서 세션 확인
                    const response = await axios.get(`${apiUrl}/users/check`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (response.data.loggedIn) {
                        onLoginSuccess();
                    }
                } catch (error) {
                    console.error('세션 확인 오류:', error);
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
                visibilityTime: 2000, // 2초 후 자동 사라짐
            });
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(`${apiUrl}/users/login`, {
                id,
                password
            });

            if (response.status === 200) {
                const token = response.data.token;
    
                if (token) {
                    await AsyncStorage.setItem('userToken', token); // 토큰 저장
                    onLoginSuccess();
                } else {
                    Alert.alert('로그인 실패', '서버에서 토큰을 받지 못했습니다.');
                }
            } else {
                // 로그인 실패 메시지
                Toast.show({
                    type: 'error',
                    text1: '로그인 실패',
                    text2: '로그인 정보가 일치하지 않습니다.',
                    text1Style: { fontSize: 15, color: 'black' },
                    text2Style: { fontSize: 13, color: 'black' },
                    visibilityTime: 2000, // 2초 후 자동 사라짐
                });
            }
        } catch (error) {
            // 서버 응답에서 구체적인 오류 정보가 없어도 일관된 메시지 출력
            Toast.show({
                type: 'error',
                text1: '로그인 실패',
                text2: '로그인 정보가 일치하지 않습니다.',
                text1Style: { fontSize: 15, color: 'black' },
                text2Style: { fontSize: 13, color: 'black' },
                visibilityTime: 2000, // 2초 후 자동 사라짐
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
            console.log('Session Data:', sessionData);  // 응답 확인 로그
    
            // 서버 응답에서 user.id를 확인하도록 수정
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
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
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
        elevation: 3, // Android에서 그림자 효과
        shadowColor: '#000', // iOS에서 그림자 효과
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
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
    logoImage: {
        width: 70,
        height: 70,
    },
});

export default LoginScreen;
