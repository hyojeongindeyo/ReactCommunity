import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Dimensions, Image, TextInput, TouchableOpacity } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const LoginScreen = ({ navigation }) => {
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        console.log('아이디:', id);
        console.log('비밀번호:', password);
        // 로그인 처리 로직 추가 후 MainScreen으로 이동
        // navigation.navigate('Home');
    };

    return (
        <View style={styles.container}>
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
                <TouchableOpacity style={styles.button} onPress={handleLogin}>
                    <Text style={styles.buttonText}>로그인</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                    <Text style={styles.linkText}>회원가입</Text>
                </TouchableOpacity>
            </View>
            <StatusBar style="auto" />
        </View>
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
        width: '80%', // 폼 컨테이너의 너비를 전체 화면의 80%로 설정
        alignItems: 'center', // 폼 컨테이너 내부의 요소를 수평으로 가운데 정렬
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        backgroundColor: '#F3F3F3',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 10,
        width: '100%', // 입력 필드 너비를 폼 컨테이너에 맞추기 위해 100%로 설정
        marginTop: 10,
    },
    button: {
        width: '100%', // 버튼의 너비를 폼 컨테이너의 너비에 맞추기 위해 100%로 설정
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
    logoImage: {
        width: 70, // 로고 이미지의 너비
        height: 70, // 로고 이미지의 높이
        marginBottom: 20, // 로고 이미지와 폼 컨테이너 간의 간격
    },
});

export default LoginScreen;
