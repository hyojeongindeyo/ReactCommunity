import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert, Modal, TextInput, TouchableWithoutFeedback } from 'react-native';
import { MaterialIcons, Entypo } from '@expo/vector-icons';
import BottomTabBar from '../BottomTabBar';

export default function NearbySafety({ navigation, route }) {
  const { filter } = route.params || { filter: '전체' };  // Community.js에서 전달된 필터 값
  const [selectedCategory, setSelectedCategory] = useState(filter);
  const [draftPost, setDraftPost] = useState('');
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);

  const posts = [
    { category: 'HOT', message: '2호선 강남역 근처에서 시위 때문에 교통정체가 심하니 다들 참고 하세요 !!!', timestamp: '2024.07.24 pm 15:33' },
    { category: '교통', message: '3호선 서울역에서 승객 수가 많아서 혼잡할 수 있습니다.', timestamp: '2024.07.24 pm 15:30' },
    { category: '시위', message: '시민들이 시위를 벌이고 있습니다. 주의하시기 바랍니다.', timestamp: '2024.07.24 pm 15:20' },
    { category: '재해', message: '비가 오고 있어서 길이 미끄럽습니다. 운전에 주의하세요.', timestamp: '2024.07.24 pm 15:10' },
    { category: '주의', message: '해수욕장에서 물때가 높습니다. 안전을 위해 신호를 따르세요.', timestamp: '2024.07.24 pm 15:00' },
  ];

  const categories = ['전체', 'HOT', '교통', '시위', '재해', '주의'];

  // 선택된 카테고리에 따라 필터링된 글 목록 반환
  const filteredPosts = selectedCategory === '전체' ? posts : posts.filter(post => post.category === selectedCategory);

  // 글 작성 화면으로 이동
  const navigateToWritePost = () => {
    navigation.navigate('WritePost');
  };

  // 글 작성 완료 시 팝업창 띄우기
  const handleWritePost = () => {
    if (draftPost.trim() === '') {
      Alert.alert(
        '작성된 내용이 없습니다.',
        '글 작성을 취소하시겠습니까?',
        [
          {
            text: '아니요',
            style: 'cancel',
          },
          {
            text: '네',
            onPress: () => {
              setDraftPost(''); // 작성된 내용 초기화
            },
          },
        ],
      );
    } else {
      Alert.alert(
        '게시판에 글을 등록하시겠습니까?',
        '',
        [
          {
            text: '아니요',
            style: 'cancel',
          },
          {
            text: '네',
            onPress: () => {
              setDraftPost(''); // 작성된 내용 초기화
              Alert.alert('글이 성공적으로 등록되었습니다.');
            },
          },
        ],
        { cancelable: false }
      );
    }
  };

  useEffect(() => {
    if (filter) {
      setSelectedCategory(filter);
    }
  }, [filter]);

  const handleSearch = () => {
    if (searchQuery.trim() !== '') {
      setSearchHistory(prevHistory => [searchQuery, ...prevHistory]);
      setSearchQuery('');
    }
  };

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

      {/* [HOT] 박스 */}
      <View style={styles.hotBox}>
        <Text style={styles.hotTitle}>[HOT]</Text>
        <Text style={styles.hotMessage}>2호선 강남역 근처에서 시위 때문에 교통정체가 심하니 다들 참고 하세요!!!</Text>
        <Text style={styles.hotTimestamp}>2분 전</Text>
      </View>

      {/* 카테고리 버튼들 */}
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

      {/* 카테고리 버튼 아래 선 */}
      <View style={styles.horizontalLine}></View>

      <ScrollView style={styles.content}>
        {/* 선택된 카테고리에 따른 글 목록 */}
        {filteredPosts.map((post, index) => (
          <View key={index} style={styles.postContainer}>
            <Text style={styles.postText}>
              [{post.category}] {post.message} 
            </Text>
            <Text style={styles.timestamp}>{post.timestamp}</Text>
          </View>
        ))}

        {/* 카테고리에 해당하는 글이 없는 경우 메시지 표시 */}
        {filteredPosts.length === 0 && (
          <View style={styles.alertBox}>
            <Text style={styles.message}>해당 카테고리에 대한 소식이 없습니다.</Text>
          </View>
        )}
      </ScrollView>

      {/* + 버튼으로 글 작성하기 */}
      <TouchableOpacity style={styles.addButton} onPress={navigateToWritePost}>
        <Entypo name="plus" size={30} color="black" />
      </TouchableOpacity>

      <BottomTabBar navigation={navigation} />

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
                      <Text style={styles.historyText}>{item}</Text>
                      <TouchableOpacity onPress={() => deleteSearchHistoryItem(index)}>
                        <Text style={styles.deleteText}>X</Text>
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
    borderBottomWidth: 2, // 추가된 선
    borderBottomColor: '#000', // 추가된 선 색상
  },
  horizontalLine: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 10,
    width: '100%', // 선을 가로로 꽉 채우기 위해 추가
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
    textAlign: 'left', // 타임스탬프를 왼쪽 정렬
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
    bottom: 100, // Move the button up
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
    zIndex: 1000, // Ensure button is above other elements
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
    height: '100%', // 전체 높이를 차지하도록 설정
    justifyContent: 'flex-start', // 상단 정렬
    alignItems: 'center',
    paddingTop: 60, // 상단 여백 추가
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%', // 전체 너비를 차지하도록 설정
    marginTop: 20, // 상단 여백 추가
  },
  backButton: {
    marginRight: 10, // 검색창과 버튼 사이 여백 추가
  },
  searchInput: {
    borderBottomWidth: 1,
    borderColor: '#ddd',
    flex: 1, // 남은 공간을 차지하도록 설정
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  searchButton: {
    backgroundColor: '#556D6A',
    padding: 10,
    borderRadius: 5,
    marginLeft: 10, // 검색창과 버튼 사이 여백 추가
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  historyContainer: {
    width: '100%',
    marginTop: 20, // History list spacing from the search bar
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
  },
  historyText: {
    fontSize: 16,
  },
  deleteText: {
    fontSize: 16,
    color: '#ff0000',
  },
});
