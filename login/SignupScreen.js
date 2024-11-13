import 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
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
        // 입력 필드가 하나라도 비어있는지 체크
        if (!id || !password || !confirmPassword || !email || !nickname) {
            Toast.show({
                type: 'error',
                text1: '필수 정보',
                text2: '모든 정보를 입력해 주세요.',
                text1Style: { fontSize: 15, color: 'black' },
                text2Style: { fontSize: 13, color: 'black' },
                visibilityTime: 2000, // 2초 후 자동 사라짐
            });
            return;  // 하나라도 비어 있으면 함수 종료
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.(com|net|org|gov|edu|info|biz|co|int|mil)$/;
        const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;


        if (!passwordPattern.test(password)) {
            Toast.show({
                type: 'error',
                text1: '비밀번호 형식 오류',
                text2: '비밀번호는 8자리 이상, 영어, 숫자, 특수문자(@$!%*#?&)를 포함해야 합니다.',
                text1Style: { fontSize: 15, color: 'black' },
                text2Style: { fontSize: 13, color: 'black' },
                visibilityTime: 2000,
            });
            return;
        }

        if (password !== confirmPassword) {
            Toast.show({
                type: 'error',
                text1: '비밀번호 확인 오류',
                text2: '비밀번호가 다릅니다.',
                text1Style: { fontSize: 15, color: 'black' },
                text2Style: { fontSize: 13, color: 'black' },
                visibilityTime: 2000,
            });
            return;
        }
        if (!emailPattern.test(email)) {
            Toast.show({
                type: 'error',
                text1: '이메일 형식 오류',
                text2: '유효한 이메일 형식을 입력해주세요',
                text1Style: { fontSize: 15, color: 'black' },
                text2Style: { fontSize: 13, color: 'black' },
                visibilityTime: 2000,
            });
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
                Toast.show({
                    type: 'success',
                    text1: '회원가입 성공',
                    // text2: '유효한 이메일 형식을 입력해주세요',
                    text1Style: { fontSize: 15, color: 'black' },
                    text2Style: { fontSize: 13, color: 'black' },
                    visibilityTime: 2000,
                });
                navigation.navigate('Login');
            }
        } catch (error) {
            if (error.response) {
                // 서버가 응답했지만 상태 코드가 2xx가 아닌 경우
                console.error('서버 응답 오류:', error.response.data);
                console.log('회원가입 실패', `오류: ${error.response.data.error}`);
            } else if (error.request) {
                // 요청이 서버로 전송되었으나 응답을 받지 못한 경우
                console.error('요청 오류:', error.request);
                console.log('회원가입 실패', '서버가 응답하지 않습니다.');
            } else {
                // 오류가 발생한 이유가 설정된 요청이 아닌 경우
                console.error('설정 오류:', error.message);
                console.log('회원가입 실패', '회원가입 처리 중 오류가 발생했습니다.');
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
