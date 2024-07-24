// PostDetail.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function PostDetail({ route, navigation }) {
  const { post } = route.params;

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  const handleDelete = () => {
    Alert.alert(
      "글 삭제",
      "정말로 이 글을 삭제하시겠습니까?",
      [
        { text: "취소", style: "cancel" },
        { text: "삭제", onPress: () => {
          // 글 삭제 로직 추가
          navigation.goBack();
        }},
      ],
      { cancelable: false }
    );
  };

  const handleCommentSubmit = () => {
    if (newComment.trim()) {
      setComments([...comments, newComment]);
      setNewComment('');
    } else {
      Alert.alert("댓글을 입력해주세요.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <MaterialIcons name="keyboard-arrow-left" size={30} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>{post.category} 글 상세보기</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => {/* 글 수정 로직 추가 */}} style={styles.iconButton}>
            <MaterialIcons name="edit" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.iconButton}>
            <MaterialIcons name="delete" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView style={styles.content}>
        <Text style={styles.postText}>{post.message}</Text>
        <Text style={styles.timestamp}>{post.timestamp}</Text>
        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>댓글</Text>
          {comments.map((comment, index) => (
            <Text key={index} style={styles.comment}>{comment}</Text>
          ))}
          <View style={styles.commentInputContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder="댓글을 입력하세요"
              value={newComment}
              onChangeText={setNewComment}
            />
            <TouchableOpacity onPress={handleCommentSubmit} style={styles.commentSubmitButton}>
              <Text style={styles.commentSubmitButtonText}>등록</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
    fontSize: 18,
    fontWeight: 'bold',
  },
  iconButton: {
    padding: '2%',
  },
  headerRight: {
    flexDirection: 'row',
  },
  content: {
    flex: 1,
    paddingHorizontal: '5%',
  },
  postText: {
    fontSize: 16,
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    textAlign: 'left',
    marginBottom: 20,
  },
  commentsSection: {
    marginTop: 20,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  comment: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
  },
  commentSubmitButton: {
    backgroundColor: '#556D6A',
    padding: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  commentSubmitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
