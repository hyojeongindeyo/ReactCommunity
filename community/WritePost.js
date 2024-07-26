import React, { useState, useContext } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image, Alert, KeyboardAvoidingView, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { PostsContext } from './PostsContext';

export default function WritePost({ navigation }) {
  const { addPost } = useContext(PostsContext);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const handlePostSubmit = () => {
    if (selectedCategory && postTitle.trim() && postContent.trim()) {
      const newPost = {
        id: Date.now().toString(),
        category: selectedCategory,
        title: postTitle,
        message: postContent,
        image: selectedImage,
        timestamp: new Date().toISOString(), // ISO 형식으로 저장
      };
      addPost(newPost);
      setPostTitle('');
      setPostContent('');
      setSelectedImage(null);
      navigation.goBack();
    } else {
      Alert.alert('모든 필드를 채워주세요.');
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.uri);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
              <MaterialIcons name="keyboard-arrow-left" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.title}>글 등록하기</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.content}>
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

            <View style={styles.inputContainer}>
              <Text style={styles.label}>제목</Text>
              <TextInput
                style={styles.input}
                placeholder="제목을 입력하세요."
                value={postTitle}
                onChangeText={setPostTitle}
              />
            </View>

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

            <View style={styles.inputContainer}>
              <Text style={styles.label}>사진 첨부</Text>
              <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                <Text style={styles.imageButtonText}>사진 선택</Text>
              </TouchableOpacity>
              {selectedImage && <Image source={{ uri: selectedImage }} style={styles.selectedImage} />}
            </View>

            <TouchableOpacity style={styles.addButton} onPress={handlePostSubmit}>
              <Text style={styles.buttonText}>작성 완료</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'space-between',
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
  imageButton: {
    backgroundColor: '#556D6A',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 10,
    width: 120,
  },
  imageButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  selectedImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginTop: 10,
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
