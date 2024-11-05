import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Dimensions, Image, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Alert } from 'react-native';
import axios from 'axios'; // axios 추가
import config from '../config';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const LoginScreen = ({ navigation, onLoginSuccess }) => {
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const apiUrl = config.apiUrl;

    const handleLogin = async () => {
        if (id.trim() === '' || password.trim() === '') {
            Alert.alert('입력 오류', '아이디와 비밀번호를 모두 입력해 주세요.');
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(`${apiUrl}/users/login`, {
                id,
                password
            });

            if (response.status === 200) {
                Alert.alert('로그인 성공', response.data.message);
                onLoginSuccess(); // 로그인 성공 시 onLoginSuccess 호출
                
            } else {
                Alert.alert('로그인 실패', '올바르지 않은 로그인 정보입니다.');
            }
        } catch (error) {
            if (error.response) {
                console.error('서버 응답 오류:', error.response.data);
                Alert.alert('로그인 실패', `오류: ${error.response.data.error}`);
            } else if (error.request) {
                console.error('요청 오류:', error.request);
                Alert.alert('로그인 실패', '서버가 응답하지 않습니다.');
            } else {
                console.error('설정 오류:', error.message);
                Alert.alert('로그인 실패', '로그인 처리 중 오류가 발생했습니다.');
            }
        } finally {
            setLoading(false);
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
                    </View>
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
