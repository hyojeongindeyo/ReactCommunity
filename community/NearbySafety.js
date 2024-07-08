import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { MaterialIcons, Entypo } from '@expo/vector-icons';
import BottomTabBar from '../BottomTabBar';

export default function NearbySafety({ navigation }) {
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [draftPost, setDraftPost] = useState('');

  const posts = [
    { category: 'HOT', message: '2호선 강남역 근처에서 시위 때문에 교통정체가 심하니 다들 참고 하세요 !!!', timestamp: '2분전' },
    { category: '교통', message: '3호선 서울역에서 승객 수가 많아서 혼잡할 수 있습니다.', timestamp: '5분전' },
    { category: '시위', message: '시민들이 시위를 벌이고 있습니다. 주의하시기 바랍니다.', timestamp: '10분전' },
    { category: '재해', message: '비가 오고 있어서 길이 미끄럽습니다. 운전에 주의하세요.', timestamp: '15분전' },
    { category: '주의', message: '해수욕장에서 물때가 높습니다. 안전을 위해 신호를 따르세요.', timestamp: '20분전' },
  ];

  const categories = ['전체', 'HOT', '교통', '시위', '재해', '주의'];

  // HOT 관련 글 필터링
  const hotPosts = posts.filter(post => post.category === 'HOT');

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
              // 여기서 실제로 글을 등록하는 로직을 추가할 수 있습니다.
              // 예를 들어, 서버에 저장하거나 상태에 추가하는 등의 작업을 수행할 수 있습니다.
              setDraftPost(''); // 작성된 내용 초기화
              Alert.alert('글이 성공적으로 등록되었습니다.');
            },
          },
        ],
        { cancelable: false }
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="keyboard-arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>내 주변 안전 소식</Text>
        <TouchableOpacity style={styles.iconButton}>
          <MaterialIcons name="search" size={24} color="black" />
        </TouchableOpacity>
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

      <ScrollView style={styles.content}>
        {/* HOT 관련 글 */}
        {hotPosts.map((post, index) => (
          <View key={index} style={styles.alertBox}>
            <Text style={styles.hotLabel}>[{post.category}]</Text>
            <Text style={styles.message}>{post.message}</Text>
            <Text style={styles.timestamp}>{post.timestamp}</Text>
          </View>
        ))}

        {/* 선택된 카테고리에 따른 글 목록 */}
        {filteredPosts.map((post, index) => (
          <View key={index} style={styles.postContainer}>
            <Text style={styles.categoryText}>[{post.category}]</Text>
            <Text style={styles.message}>{post.message}</Text>
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
    paddingTop: '15%',
    paddingBottom: '5%',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  iconButton: {
    padding: '2%',
  },
  categoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f0f0f0',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingVertical: 10,
  },
  categoryButton: {
    paddingHorizontal: 10,
  },
  categoryText: {
    fontSize: 16,
    color: '#999',
  },
  selectedCategoryText: {
    fontWeight: 'bold',
    color: '#000',
  },
  content: {
    flex: 1,
    paddingHorizontal: '5%',
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
  hotLabel: {
    color: 'red',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
  },
  pageNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 20,
  },
  addButton: {
    position: 'absolute',
    bottom: 100,  // 페이지 하단 바 위에 위치하도록 수정
    right: 20,
    backgroundColor: 'lightblue',
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
  },
});