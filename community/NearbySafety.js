import React, { useState, useContext, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Image, Modal, TextInput, TouchableWithoutFeedback } from 'react-native';
import { MaterialIcons, Entypo } from '@expo/vector-icons';
import BottomTabBar from '../BottomTabBar';
import { PostsContext } from './PostsContext';
import moment from 'moment';

export default function NearbySafety({ navigation, route }) {
  // 선택된 필터 설정
  const { filter } = route.params || { filter: '전체' };
  const { posts, loadPosts } = useContext(PostsContext); // PostsContext에서 posts를 가져옴
  const [selectedCategory, setSelectedCategory] = useState(filter);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);

  // 게시글 작성 후 게시글 목록을 다시 불러오는 useEffect
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadPosts();  // 게시글 작성 후 목록 다시 불러오기
    });
    return unsubscribe;
  }, [navigation, loadPosts]);

  // 카테고리 목록
  const categories = ['전체', 'HOT', '교통', '시위', '재해', '주의'];

  // 선택한 카테고리에 맞는 게시물 필터링
  const filteredPosts = selectedCategory === '전체' ? posts : posts.filter(post => post.category === selectedCategory);

  // 게시글 작성 페이지로 이동
  const navigateToWritePost = () => {
    navigation.navigate('WritePost');
  };

  // 날짜 포맷팅
  const formatDate = (date) => {
    return moment(date).format('YYYY.MM.DD A hh:mm');
  };

  // 검색 처리
  const handleSearch = () => {
    if (searchQuery.trim() !== '') {
      setSearchHistory(prevHistory => [searchQuery, ...prevHistory]);
      setSearchQuery('');
    }
  };

  // 검색 기록 삭제
  const deleteSearchHistoryItem = (index) => {
    setSearchHistory(prevHistory => prevHistory.filter((_, i) => i !== index));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="keyboard-arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>내 주변 안전 소식</Text>
        <TouchableOpacity style={styles.iconButton} onPress={() => setSearchModalVisible(true)}>
          <MaterialIcons name="search" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* HOT 게시물 상단 표시 */}
      <View style={styles.hotBox}>
        <Text style={styles.hotTitle}>[HOT]</Text>
        <Text style={styles.hotMessage}>2호선 강남역 근처에서 시위 때문에 교통정체가 심하니 다들 참고 하세요!!!</Text>
        <Text style={styles.hotTimestamp}>2분 전</Text>
      </View>

      {/* 카테고리 버튼 */}
      <View style={styles.categoryContainer}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            onPress={() => setSelectedCategory(category)} // 선택된 카테고리 설정
            style={styles.categoryButton}
          >
            <Text style={[styles.categoryText, selectedCategory === category && styles.selectedCategoryText]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.horizontalLine}></View>

      {/* 필터링된 게시물 목록 */}
      <ScrollView style={styles.content}>
        {filteredPosts.map((post, index) => (
          <TouchableOpacity key={index} style={styles.postContainer} onPress={() => navigation.navigate('PostDetail', { post })}>
            <Text style={styles.postText}>
              [{post.category}] {post.title}
            </Text>
            {/* {post.image && <Image source={{ uri: post.image }} style={styles.postImage} />} */}
            <Text style={styles.timestamp}>{formatDate(post.timestamp)}</Text>
          </TouchableOpacity>
        ))}

        {filteredPosts.length === 0 && (
          <View style={styles.alertBox}>
            <Text style={styles.message}>해당 카테고리에 대한 소식이 없습니다.</Text>
          </View>
        )}
      </ScrollView>


      {/* 게시물 작성 버튼 */}
      <TouchableOpacity style={styles.addButton} onPress={navigateToWritePost}>
        <Entypo name="plus" size={30} color="black" />
      </TouchableOpacity>

      {/* 하단 탭 바 */}
      <BottomTabBar navigation={navigation} />

      {/* 검색 모달 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={searchModalVisible}
        onRequestClose={() => setSearchModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setSearchModalVisible(false)}>
          <View style={styles.searchModalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.searchModalContent}>
                <View style={styles.searchHeader}>
                  <TouchableOpacity onPress={() => setSearchModalVisible(false)} style={styles.backButton}>
                    <MaterialIcons name="keyboard-arrow-left" size={24} color="black" />
                  </TouchableOpacity>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="검색어를 입력하세요"
                    placeholderTextColor="#888888"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoFocus
                  />
                  <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                    <Text style={styles.searchButtonText}>검색</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView style={styles.historyContainer}>
                  {searchHistory.map((item, index) => (
                    <View key={index} style={styles.historyItem}>
                      <View style={styles.historyIconContainer}>
                        <MaterialIcons name="history" size={24} color="black" />
                      </View>
                      <Text style={styles.historyText}>{item}</Text>
                      <TouchableOpacity onPress={() => deleteSearchHistoryItem(index)}>
                        <MaterialIcons name="close" size={24} color="black" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  // 스타일 정의
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingBottom:80,
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
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 10,
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
  searchModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchModalContent: {
    backgroundColor: 'white',
    padding: 20,
    width: '100%',
    height: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 60,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
  },
  backButton: {
    marginRight: 10,
  },
  searchInput: {
    borderBottomWidth: 1,
    borderColor: '#ddd',
    flex: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  searchButton: {
    backgroundColor: '#556D6A',
    padding: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  historyContainer: {
    width: '100%',
    marginTop: 20,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    marginHorizontal: 10,
  },
  historyIconContainer: {
    marginRight: 10,
  },
  historyText: {
    fontSize: 16,
    flex: 1,
  },
});
