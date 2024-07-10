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



    return (
        <View style={styles.bottomBar}>
            <TouchableOpacity 
                style={styles.iconContainer} 
                onPress={() => {
                    // 홈 아이콘을 누르면 색상이 변경됨
                    setIconColors(prevColors => ({
                        ...prevColors,
                        home: '#92B2AE',
                        shelter: '#BDC3C7',
                        camera: '#BDC3C7',
                        talk: '#BDC3C7',
                        mypage: '#BDC3C7',
                    }));
                    navigation.navigate('Home');
                }}
            >
                <Entypo name="home" size={30} color={iconColors.home} />
                <Text style={[styles.iconText, { color: iconColors.home }]}>홈</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.iconContainer} 
                onPress={() => {
                    setIconColors(prevColors => ({
                        ...prevColors,
                        home: '#BDC3C7',
                        shelter: '#92B2AE',
                        camera: '#BDC3C7',
                        talk: '#BDC3C7',
                        mypage: '#BDC3C7',
                    }));
                    console.log("Shelter pressed");
                }}
            >
                <FontAwesome6 name="map-location-dot" size={30} color={iconColors.shelter} />
                <Text style={[styles.iconText, { color: iconColors.shelter }]}>대피소</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.iconContainer} 
                onPress={() => {
                    setIconColors(prevColors => ({
                        ...prevColors,
                        home: '#BDC3C7',
                        shelter: '#BDC3C7',
                        camera: '#92B2AE',
                        talk: '#BDC3C7',
                        mypage: '#BDC3C7',
                    }));
                    console.log("Camera pressed");
                    navigation.navigate('Camera');
                }}
            >
                <Entypo name="camera" size={30} color={iconColors.camera} />
                <Text style={[styles.iconText, { color: iconColors.camera }]}>카메라</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.iconContainer} 
                onPress={() => {
                    setIconColors(prevColors => ({
                        ...prevColors,
                        home: '#BDC3C7',
                        shelter: '#BDC3C7',
                        camera: '#BDC3C7',
                        talk: '#92B2AE',
                        mypage: '#BDC3C7',
                    }));
                    console.log("Talk pressed");
                    navigation.navigate('Community');
                }}
            >
                <MaterialCommunityIcons name="post-outline" size={30} color={iconColors.talk} />
                <Text style={[styles.iconText, { color: iconColors.talk }]}>커뮤니티</Text>
            </TouchableOpacity>

            
            <TouchableOpacity 
                style={styles.iconContainer} 
                onPress={() => {
                    setIconColors(prevColors => ({
                        ...prevColors,
                        home: '#BDC3C7',
                        shelter: '#BDC3C7',
                        camera: '#BDC3C7',
                        talk: '#BDC3C7',
                        mypage: '#92B2AE',
                    }));
                    console.log("Mypage pressed");
                    navigation.navigate('Mypage');
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
