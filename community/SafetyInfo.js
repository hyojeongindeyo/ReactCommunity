import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import BottomTabBar from '../BottomTabBar';

const SafetyInfo = ({ navigation, route }) => {
  const { filter } = route.params || { filter: '전체' };
  const [selectedCategory, setSelectedCategory] = useState(filter);

  const categories = ['전체', '자연', '사회', '생활'];

  const safetyInfos = [
    { id: 1, title: '화재 시 행동요령', date: '2024.07.01', category: '자연' },
    { id: 2, title: '태풍 시 행동요령', date: '2024.07.02', category: '자연' },
    { id: 3, title: '교통사고', date: '2024.07.03', category: '사회' },
    { id: 4, title: '심폐소생술', date: '2024.07.04', category: '생활' },
  ];

  const filteredInfos = selectedCategory === '전체' ? safetyInfos : safetyInfos.filter(info => info.category === selectedCategory);

  useEffect(() => {
    if (filter) {
      setSelectedCategory(filter);
    }
  }, [filter]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="keyboard-arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>안전 정보</Text>
        <TouchableOpacity style={styles.iconButton}>
          <MaterialIcons name="search" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.banner}>
        <View style={styles.bannerItem}>
          <Text style={styles.bannerText}>여름철 빈번하게 발생하는 폭우 시 예방수칙</Text>
        </View>
        <View style={styles.bannerItem}>
          <Text style={styles.bannerText}>화재 발생 시 대피요령</Text>
        </View>
      </ScrollView>

      <View style={styles.categoryContainer}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            onPress={() => setSelectedCategory(category)}
            style={[styles.categoryButton, selectedCategory === category && styles.selectedCategoryButton]}
          >
            <Text style={[styles.categoryText, selectedCategory === category && styles.selectedCategoryText]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.infoContainer}>
        {filteredInfos.map((info) => (
          <View key={info.id} style={styles.infoCard}>
            <Text style={styles.infoTitle}>{info.title}</Text>
            <Text style={styles.infoDate}>{info.date}</Text>
          </View>
        ))}
      </ScrollView>

      <BottomTabBar navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: '5%',
    paddingTop: '10%',
    paddingBottom: '5%',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  iconButton: {
    padding: 10,
  },
  banner: {
    height: 200,
    backgroundColor: '#e0e0e0',
  },
  bannerItem: {
    width: 360,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2f4f4f',
    marginHorizontal: 5,
    borderRadius: 10,
    padding: 20,
  },
  bannerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  categoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#f0f0f0',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  categoryButton: {
    paddingHorizontal: 10,
  },
  categoryText: {
    fontSize: 16,
    color: '#999',
  },
  selectedCategoryButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#000',
  },
  selectedCategoryText: {
    fontWeight: 'bold',
    color: '#000',
  },
  infoContainer: {
    paddingHorizontal: '5%',
  },
  infoCard: {
    backgroundColor: '#f9f9f9',
    padding: 20,
    borderRadius: 10,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  infoDate: {
    fontSize: 14,
    color: '#999',
  },
});

export default SafetyInfo;
