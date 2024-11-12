import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

const MenuPage = ({ navigation }) => {
    const [selectedFilter, setSelectedFilter] = useState('전체');
    const [safetyInfos, setSafetyInfos] = useState([]);

    const filteredInfos = selectedFilter === '전체' ? safetyInfos : safetyInfos.filter(info => info.category === selectedFilter);

    // 카테고리 데이터 설정 (객체)
    const categoriesData = {
        NearbySafety: ['내 주변 안전소식', '전체', '교통', '화재', '재해', '주의'],
        SafetyInfo: ['안전 정보', '전체', '재해', '화재', '생활', '주의'],
    };
 
    // 메뉴 아이템 생성 함수
    const generateMenuItems = () => {
        let menuId = 1;
        const items = [];

        Object.entries(categoriesData).forEach(([navigateTo, titles]) => {
            titles.forEach((title, index) => {
                items.push({
                    id: menuId.toString(),
                    title: title,
                    navigateTo: navigateTo, // NearbySafety 또는 SafetyInfo로 이동
                    filter: title, // 필터값 (교통, 화재, 재해 등)
                });
                menuId++;
            });
        });

        return items;
    };
    const menuItems = generateMenuItems();

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.menuItemsContainer}>
                <TouchableOpacity onPress={() => navigation.navigate('HomeScreen')}>
                    <Text style={styles.boldText}>메인페이지</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Shelter')}>
                    <Text style={styles.boldText}>내 주변 대피소</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Camera')}>
                    <Text style={styles.boldText}>균열 카메라</Text>
                </TouchableOpacity>

                {menuItems.map(item => (
    item.title === '내 주변 안전소식' || item.title === '안전 정보' ? (
        // '내 주변 안전소식'과 '안전 정보'는 클릭 불가능한 텍스트로 처리
        <Text key={item.id} style={styles.boldText}>
            {item.title}
        </Text>
    ) : (
        // 나머지 항목은 클릭 가능한 TouchableOpacity로 처리
        <TouchableOpacity
            key={item.id}
            onPress={() => {
                if (item.navigateTo === 'NearbySafety') {
                    // 'NearbySafety' 클릭 시, 스택을 새로 설정
                    navigation.reset({
                        index: 0,
                        routes: [
                            {
                                name: 'Community',
                                params: {
                                    screen: 'NearbySafety',
                                    params: { filter: item.filter }, // 필터값을 파라미터로 전달
                                },
                            },
                        ],
                    });
                } else if (item.navigateTo === 'SafetyInfo') {
                    // 'SafetyInfo' 클릭 시, 스택을 새로 설정
                    navigation.reset({
                        index: 0,
                        routes: [
                            {
                                name: 'Community',
                                params: {
                                    screen: 'SafetyInfo',
                                    params: { filter: item.filter }, // 필터값을 파라미터로 전달
                                },
                            },
                        ],
                    });
                }
            }}
        >
            <Text style={styles.menuText}>
                {item.title}
            </Text>
        </TouchableOpacity>
    )
))}



                {/* "내 평안" 항목을 메뉴의 마지막에 추가 */}
                <TouchableOpacity onPress={() => navigation.navigate('Mypage')}>
                    <Text style={styles.boldText}>{'내 평안'}</Text>
                </TouchableOpacity>
            </ScrollView>

            <View style={styles.footerMenu}>
                <TouchableOpacity onPress={() => navigation.jumpTo('Home')}>
                    <Text style={styles.footerText}>홈</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.jumpTo('Shelter')}>
                    <Text style={styles.footerText}>대피소</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.jumpTo('Camera')}>
                    <Text style={styles.footerText}>카메라</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.jumpTo('Community')}>
                    <Text style={styles.footerText}>커뮤니티</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 60, // 상단 여백을 늘려서 시작점을 아래로 내림
        backgroundColor: 'white',
    },
    menuItemsContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    menuText: {
        fontSize: 16,
        paddingVertical: 8,
    },
    boldText: {
        fontWeight: 'bold',
        fontSize: 18,
        paddingTop: 20,
        paddingBottom: 5,
    },
    footerMenu: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        paddingVertical: 10,
    },
    footerText: {
        fontSize: 14,
    },
});

export default MenuPage;
