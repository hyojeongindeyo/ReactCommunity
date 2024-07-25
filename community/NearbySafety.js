import React, { useContext } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons, Entypo } from '@expo/vector-icons';
import BottomTabBar from '../BottomTabBar';
import { PostsContext } from './PostsContext';

export default function NearbySafety({ navigation, route }) {
  const { filter } = route.params || { filter: '전체' };
  const { posts } = useContext(PostsContext);
  const [selectedCategory, setSelectedCategory] = React.useState(filter);

  const categories = ['전체', 'HOT', '교통', '시위', '재해', '주의'];

  const filteredPosts = selectedCategory === '전체' ? posts : posts.filter(post => post.category === selectedCategory);

  const navigateToWritePost = () => {
    navigation.navigate('WritePost');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="keyboard-arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>내 주변 안전 소식</Text>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('CommunitySearch')}>
          <MaterialIcons name="search" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <View style={styles.hotBox}>
        <Text style={styles.hotTitle}>[HOT]</Text>
        <Text style={styles.hotMessage}>2호선 강남역 근처에서 시위 때문에 교통정체가 심하니 다들 참고 하세요!!!</Text>
        <Text style={styles.hotTimestamp}>2분 전</Text>
      </View>

      <View style={styles.categoryContainer}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            onPress={() => setSelectedCategory(category)}
            style={styles.categoryButton}
          >
            <Text style={[styles.categoryText, selectedCategory === category && styles.selectedCategoryText]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.horizontalLine}></View>

      <ScrollView style={styles.content}>
        {filteredPosts.map((post, index) => (
          <TouchableOpacity key={index} style={styles.postContainer} onPress={() => navigation.navigate('PostDetail', { post })}>
            <Text style={styles.postText}>
              [{post.category}] {post.message}
            </Text>
            <Text style={styles.timestamp}>{post.timestamp}</Text>
          </TouchableOpacity>
        ))}

        {filteredPosts.length === 0 && (
          <View style={styles.alertBox}>
            <Text style={styles.message}>해당 카테고리에 대한 소식이 없습니다.</Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.addButton} onPress={navigateToWritePost}>
        <Entypo name="plus" size={30} color="black" />
      </TouchableOpacity>

      <BottomTabBar navigation={navigation} />
    </View>
  );
}

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
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  iconButton: {
    padding: '2%',
  },
  hotBox: {
    backgroundColor: '#F3F3F3',
    borderRadius: 10,
    marginHorizontal: '5%',
    marginBottom: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  hotTitle: {
    color: '#A51919',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  hotMessage: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  hotTimestamp: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
  categoryContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: '5%',
  },
  categoryButton: {
    paddingHorizontal: 10,
  },
  categoryText: {
    fontSize: 16,
    color: '#999',
  },
  selectedCategoryText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    borderBottomWidth: 2,
    borderBottomColor: '#000',
  },
  horizontalLine: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 10,
    width: '100%',
  },
  content: {
    flex: 1,
    paddingHorizontal: '5%',
  },
  postContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 10,
  },
  postText: {
    fontSize: 16,
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    textAlign: 'left',
  },
  alertBox: {
    backgroundColor: '#fff3e0',
    borderRadius: 10,
    marginVertical: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    backgroundColor: '#fff',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
});
