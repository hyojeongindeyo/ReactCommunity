import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

const MenuPage = ({ navigation }) => {
    const categoriesData = {
        NearbySafety: ['전체', '교통', '화재', '재해', '주의'],
        SafetyInfo: ['전체', '재해', '화재', '생활', '주의'],
    };

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
                {menuItems.map(item => (
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
                        <Text style={styles.menuText}>{item.title}</Text>
                    </TouchableOpacity>
                ))}
                <TouchableOpacity onPress={() => navigation.jumpTo('Camera')}>
                    <Text style={styles.cameraText}>카메라</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.jumpTo('Mypage')}>
                    <Text style={styles.cameraText}>내 평안</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 20,
        backgroundColor: 'white',
    },
    menuItemsContainer: {
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    menuItem: {
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    menuText: {
        fontSize: 18,
    },
    cameraText: {
        fontSize: 18,
        color: 'blue',
    },
});

export default MenuPage;
