import React, { useState } from 'react';
import { TouchableOpacity, View, StyleSheet, Text } from 'react-native';
import { Entypo, FontAwesome6, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native'; // 내비게이션 훅 import

export default function BottomTabBar() {
    const navigation = useNavigation(); // 내비게이션 훅 사용

    // 아이콘과 텍스트의 색상을 관리하는 상태 변수
    const [iconColors, setIconColors] = useState({
        home: '#92B2AE',
        shelter: '#BDC3C7',
        camera: '#BDC3C7',
        talk: '#BDC3C7',
        mypage: '#BDC3C7',
    });

    const resetNavigation = (screenName) => {
        setIconColors(prevColors => ({
            home: screenName === 'Home' ? '#92B2AE' : '#BDC3C7',
            shelter: screenName === 'Shelter' ? '#92B2AE' : '#BDC3C7',
            camera: screenName === 'Camera' ? '#92B2AE' : '#BDC3C7',
            talk: screenName === 'Community' ? '#92B2AE' : '#BDC3C7',
            mypage: screenName === 'Mypage' ? '#92B2AE' : '#BDC3C7',
        }));

        navigation.reset({
            index: 0,
            routes: [{ name: screenName }],
        });
    };

    return (
        <View style={styles.bottomBar}>
            <TouchableOpacity 
                style={styles.iconContainer} 
                onPress={() => {
                    resetNavigation('Home'); // 홈 화면으로 리셋
                }}
            >
                <Entypo name="home" size={30} color={iconColors.home} />
                <Text style={[styles.iconText, { color: iconColors.home }]}>홈</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.iconContainer} 
                onPress={() => {
                    resetNavigation('Shelter'); // 대피소 화면으로 리셋
                }}
            >
                <FontAwesome6 name="map-location-dot" size={30} color={iconColors.shelter} />
                <Text style={[styles.iconText, { color: iconColors.shelter }]}>대피소</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.iconContainer} 
                onPress={() => {
                    resetNavigation('Camera'); // 카메라 화면으로 리셋
                }}
            >
                <Entypo name="camera" size={30} color={iconColors.camera} />
                <Text style={[styles.iconText, { color: iconColors.camera }]}>카메라</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.iconContainer} 
                onPress={() => {
                    resetNavigation('Community'); // 커뮤니티 화면으로 리셋
                }}
            >
                <MaterialCommunityIcons name="post-outline" size={30} color={iconColors.talk} />
                <Text style={[styles.iconText, { color: iconColors.talk }]}>커뮤니티</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.iconContainer} 
                onPress={() => {
                    resetNavigation('Mypage'); // 내 평안 화면으로 리셋
                }}
            >
                <Ionicons name="person" size={30} color={iconColors.mypage} />
                <Text style={[styles.iconText, { color: iconColors.mypage }]}>내 평안</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    bottomBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        height: 80,
        backgroundColor: '#fff',
        position: 'absolute',
        bottom: 0,
    },
    iconContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconText: {
        marginTop: 5,
        fontSize: 12,
        fontWeight: 'bold',
    },
});
