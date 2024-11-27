import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const MenuPage = ({ navigation }) => {
    const [selectedFilter, setSelectedFilter] = useState('전체');
    const [safetyInfos, setSafetyInfos] = useState([]);

    const filteredInfos = selectedFilter === '전체' ? safetyInfos : safetyInfos.filter(info => info.category === selectedFilter);

    const categoriesData = {
        NearbySafety: ['내 주변 안전소식', '전체', '교통', '화재', '재해', '주의'],
        SafetyInfo: ['안전 정보', '전체', '재해', '화재', '생활', '주의'],
    };

    const generateMenuItems = () => {
        let menuId = 1;
        const items = [];

        Object.entries(categoriesData).forEach(([navigateTo, titles]) => {
            titles.forEach((title, index) => {
                items.push({
                    id: menuId.toString(),
                    title: title,
                    navigateTo: navigateTo,
                    filter: title,
                });
                menuId++;
            });
        });

        return items;
    };

    const menuItems = generateMenuItems();

    // 각 카테고리별 색상 설정
    const categoryColors = {
        교통: '#007BFF',  // 더 진한 파란색 (교통)
        화재: '#FF4C4C',   // 강렬한 빨간색 (화재)
        재해: '#28A745',   // 진한 초록색 (재해)
        주의: '#FFA500',   // 선명한 주황색 (주의)
        생활: '#800080',   // 진한 보라색 (생활)
        전체: '#808080',   // 중간 회색 (전체)
    };

    return (
        <View style={styles.container}>
            {/* 왼쪽 상단 뒤로가기 아이콘 */}
            <TouchableOpacity onPress={() =>{
                const state = navigation.getState()

                if(state.routeNames.includes("CommunityHome")){
                    navigation.navigate('CommunityHome');
                } else {
                    navigation.navigate('HomeScreen');
                }

                }} style={styles.backButton}>
                <MaterialIcons name="keyboard-arrow-left" size={30} color="black" />
            </TouchableOpacity>

            <View style={styles.menuItemsContainer}>
                <TouchableOpacity onPress={() => navigation.navigate('HomeScreen')}>
                    <Text style={styles.boldText}>메인페이지</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Shelter')}>
                    <Text style={styles.boldText}>내 주변 대피소</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Camera')}>
                    <Text style={styles.boldText}>균열 카메라</Text>
                </TouchableOpacity>

                {/* 카테고리 부분만 두 개씩 배치 */}
                <View style={styles.categoriesContainer}>
                    {menuItems.map(item => (
                        item.title === '내 주변 안전소식' || item.title === '안전 정보' ? (
                            <View key={item.id} style={styles.singleItem}>
                                <Text style={styles.boldText}>{item.title}</Text>
                            </View>
                        ) : (
                            <TouchableOpacity
                                key={item.id}
                                onPress={() => {
                                    const state = navigation.getState()
                                    if (item.navigateTo === 'NearbySafety') {
                                        navigation.navigate('NearbySafety',{ filter: item.filter });
                                    } else if (item.navigateTo === 'SafetyInfo') {
                                        navigation.navigate('SafetyInfo',{ filter: item.filter });
                                    }
                                }}
                            >
                                <View style={styles.menuItem}>
                                    <Icon
                                        name={item.filter === '교통' ? 'car' : item.filter === '화재' ? 'fire' : item.filter === '재해' ? 'exclamation-circle' : item.filter === '주의' ? 'exclamation-triangle' : 'home'}
                                        size={28} // 아이콘 크기 조정
                                        color={categoryColors[item.filter] || '#000'} // 각 카테고리 색상 적용
                                        style={styles.icon}
                                    />
                                    <Text style={styles.menuText}>{item.title}</Text>
                                </View>
                            </TouchableOpacity>
                        )
                    ))}
                </View>

                <TouchableOpacity onPress={() => navigation.navigate('Mypage')}>
                    <Text style={styles.boldText}>내 평안</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 80,
        backgroundColor: 'white',
    },
    backButton: {
        position: 'absolute',
        top: 35, // 아이콘을 더 아래로 내리기 위해 top 값을 증가시킴
        left: 10,
        zIndex: 1, // zIndex로 다른 요소 위에 배치
        padding: 10, // 터치 영역 확대
    },
    menuItemsContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    categoriesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    singleItem: {
        width: '100%',
        marginBottom: 10,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '48%',
        marginBottom: 10,
    },
    icon: {
        marginRight: 10,
        borderRadius: 12,
        padding: 8,
        width: 80,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuText: {
        fontSize: 16,
    },
    boldText: {
        fontWeight: 'bold',
        fontSize: 18,
        paddingTop: 20,
        paddingBottom: 5,
    },
});

export default MenuPage;
