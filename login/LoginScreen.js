import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Dimensions, Image, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const LoginScreen = ({ navigation, onLoginSuccess }) => {
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        console.log('아이디:', id);
        console.log('비밀번호:', password);
        // 로그인 성공 처리 로직 후 onLoginSuccess 호출
        onLoginSuccess(); // App.js에서 전달받은 함수 호출
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
                        <TouchableOpacity style={styles.button} onPress={handleLogin}>
                            <Text style={styles.buttonText}>로그인</Text>
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
