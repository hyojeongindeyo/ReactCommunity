import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, Image, View, Dimensions, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';

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
                        placeholder="휴대폰 번호"
                        value={phone}
                        onChangeText={setPhone}
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
        justifyContent: 'center', // 수직 정렬
        alignItems: 'center', // 수평 정렬
    },
    formContainer: {
        width: '80%', // 폼 컨테이너의 너비를 화면 너비의 80%로 설정
        alignItems: 'center', // 폼 컨테이너 내부의 요소를 수평으로 가운데 정렬
    },
    inputContainer: {
        width: '100%', // 입력 필드의 너비를 폼 컨테이너에 맞게 설정
        marginVertical: 10,
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        backgroundColor: '#F3F3F3',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 10,
        width: '100%', // 입력 필드 너비를 폼 컨테이너에 맞추기 위해 100%로 설정
        marginTop: 18,
    },
    button: {
        width: '100%', // 버튼의 너비를 폼 컨테이너의 너비에 맞추기 위해 100%로 설정
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
        width: 70, // 로고 이미지의 너비
        height: 70, // 로고 이미지의 높이
    },
});

export default SignupScreen;
