// MenuPage.js
import React, { useState, useEffect } from 'react';
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
              navigateTo: navigateTo,
              filter: index === 0 ? null : title, // 첫 번째 항목의 필터는 null
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
                            
                            if (item.filter === null) {
                                navigation.navigate(item.navigateTo);
                            } else {
                                navigation.navigate(item.navigateTo, { filter: item.filter });
                            }
                        }}
                    >
                        <Text style={[styles.menuText, (item.title === '내 근처 안전소식' || item.title === '안전 정보') && styles.boldText]}>
                            {item.title}
                        </Text>
                    </TouchableOpacity>
                ))}
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
    boldText: {
        fontWeight: 'bold',
    },
});

export default MenuPage;
