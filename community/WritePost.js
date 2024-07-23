import React, { useState, useContext } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { PostContext } from './PostContext'; // PostContext를 통해 글 데이터 관리

export default function WritePost({ navigation }) {
  const { addPost } = useContext(PostContext); // 글 추가 함수
  const [selectedCategory, setSelectedCategory] = useState(null); // 선택된 카테고리 상태
  const [postTitle, setPostTitle] = useState(''); // 글 제목 상태
  const [postContent, setPostContent] = useState(''); // 글 내용 상태

  // 카테고리 선택 핸들러
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  // 글 작성 완료 핸들러
  const handlePostSubmit = () => {
    // 선택된 카테고리에 따라 데이터베이스에 저장
    if (selectedCategory) {
      addPost(selectedCategory, postTitle, postContent);
      // 저장 후 제목과 내용 초기화
      setPostTitle('');
      setPostContent('');
      // 작성 완료 후 홈 화면으로 이동
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="keyboard-arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>글 등록하기</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {/* 카테고리 선택 */}
        <View style={styles.categoryContainer}>
          <Text style={styles.label}>카테고리</Text>
          <View style={styles.categories}>
            {['교통', '시위', '재해', '주의'].map((category, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.categoryButton, selectedCategory === category && styles.selectedCategoryButton]}
                onPress={() => handleCategorySelect(category)}
              >
                <Text style={[styles.categoryText, selectedCategory === category && styles.selectedCategoryText]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 글 제목 입력란 */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>제목</Text>
          <TextInput
            style={styles.input}
            placeholder="제목을 입력하세요."
            value={postTitle}
            onChangeText={setPostTitle}
          />
        </View>

        {/* 글 내용 입력란 */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>내용</Text>
          <TextInput
            style={[styles.input, { height: 100 }]}
            multiline
            placeholder="내용을 입력하세요."
            value={postContent}
            onChangeText={setPostContent}
          />
        </View>

        {/* 작성 완료 버튼 */}
        <TouchableOpacity style={styles.addButton} onPress={handlePostSubmit}>
          <Text style={styles.buttonText}>작성 완료</Text>
        </TouchableOpacity>
      </View>
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
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  iconButton: {
    padding: '2%',
  },
  placeholder: {
    width: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: '5%',
    paddingTop: '5%',
  },
  categoryContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  categoryButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
    margin: 5,
  },
  selectedCategoryButton: {
    backgroundColor: '#556D6A',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
    fontWeight: 'bold',
  },
  selectedCategoryText: {
    color: '#ddd',
    fontWeight: 'bold',
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    height: 40,
  },
  addButton: {
    backgroundColor: '#556D6A',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ddd',
  },
});
