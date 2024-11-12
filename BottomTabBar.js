import React, { useState, useEffect } from 'react';
import { TouchableOpacity, View, StyleSheet, Text } from 'react-native';
import { Entypo, FontAwesome6, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native'; // 내비게이션 훅 import

export default function BottomTabBar({ state }) {
    const navigation = useNavigation(); // 내비게이션 훅 사용

    // 아이콘과 텍스트의 색상을 관리하는 상태 변수
    const [iconColors, setIconColors] = useState({
        home: '#BDC3C7',
        shelter: '#BDC3C7',
        camera: '#BDC3C7',
        talk: '#BDC3C7',
        mypage: '#BDC3C7',
    });
    

    useEffect(() => {
        // 현재 활성화된 탭을 추적하여 색상 업데이트
        const activeRoute = state?.routes[state.index]?.name;
        setIconColors(prevColors => ({
            home: activeRoute === 'Home' ? '#92B2AE' : '#BDC3C7',
            shelter: activeRoute === 'Shelter' ? '#92B2AE' : '#BDC3C7',
            camera: activeRoute === 'Camera' ? '#92B2AE' : '#BDC3C7',
            talk: activeRoute === 'Community' ? '#92B2AE' : '#BDC3C7',
            mypage: activeRoute === 'Mypage' ? '#92B2AE' : '#BDC3C7',
            
        }));
        
    }, [state]); // `state`가 변경될 때마다 실행

    const navigateToScreen = (screenName) => {
        navigation.reset({
            index: 0, // 첫 번째 화면으로 리셋
            routes: [{ name: screenName }], // 해당 화면으로 이동
        });
    };

    
    

    return (
        <View style={styles.bottomBar}>
            <TouchableOpacity 
                style={styles.iconContainer} 
                onPress={() => navigateToScreen('Home')} // 홈 화면으로 이동
            >
                <Entypo name="home" size={30} color={iconColors.home} />
                <Text style={[styles.iconText, { color: iconColors.home }]}>홈</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.iconContainer} 
                onPress={() => navigateToScreen('Shelter')} // 대피소 화면으로 이동
            >
                <FontAwesome6 name="map-location-dot" size={30} color={iconColors.shelter} />
                <Text style={[styles.iconText, { color: iconColors.shelter }]}>대피소</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.iconContainer} 
                onPress={() => navigateToScreen('Camera')} // 카메라 화면으로 이동
            >
                <Entypo name="camera" size={30} color={iconColors.camera} />
                <Text style={[styles.iconText, { color: iconColors.camera }]}>카메라</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.iconContainer} 
                onPress={() => navigateToScreen('Community')} // 커뮤니티 화면으로 이동
            >
                <MaterialCommunityIcons name="post-outline" size={30} color={iconColors.talk} />
                <Text style={[styles.iconText, { color: iconColors.talk }]}>커뮤니티</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.iconContainer} 
                onPress={() => navigateToScreen('Mypage')} // 내 평안 화면으로 이동
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
