import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import moment from 'moment';
import { CommentsContext } from './CommentsContext';

export default function PostDetail({ route, navigation }) {
  const { post } = route.params;
  const { comments, setComments } = useContext(CommentsContext);
  const postId = post.id;

  const [newComment, setNewComment] = useState('');
  const [imageAspectRatio, setImageAspectRatio] = useState(1); // 기본 비율 설정

  // 이미지 비율 동적 계산
  useEffect(() => {
    if (post.image) {
      Image.getSize(post.image, (width, height) => {
        setImageAspectRatio(width / height);  // 가로/세로 비율 설정
      }, (error) => {
        console.error("Image load error: ", error);
        Alert.alert("이미지를 로드할 수 없습니다.");
      });
    }
  }, [post.image]);

  const postComments = comments[postId] || [];

  const handleDelete = () => {
    Alert.alert(
      "글 삭제",
      "정말로 이 글을 삭제하시겠습니까?",
      [
        { text: "취소", style: "cancel" },
        {
          text: "삭제", onPress: () => {
            // 글 삭제 로직 추가
            navigation.goBack();
          }
        },
      ],
      { cancelable: false }
    );
  };

  const handleCommentSubmit = () => {
    if (newComment.trim()) {
      const newComments = {
        ...comments,
        [postId]: [
          ...postComments,
          { text: newComment, timestamp: new Date().toISOString() } // ISO 형식으로 저장
        ]
      };
      setComments(newComments);
      setNewComment('');
    } else {
      Alert.alert("댓글을 입력해주세요.");
    }
  };

  const handleCommentDelete = (index) => {
    const newComments = postComments.filter((_, i) => i !== index);
    setComments({
      ...comments,
      [postId]: newComments
    });
  };

  const renderRightActions = (index) => (
    <TouchableOpacity onPress={() => handleCommentDelete(index)} style={styles.deleteButton}>
      <MaterialIcons name="delete" size={24} color="white" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <MaterialIcons name="keyboard-arrow-left" size={30} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>{post.title}</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => {/* 글 수정 로직 추가 */ }} style={styles.iconButton}>
            <MaterialIcons name="edit" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.iconButton}>
            <MaterialIcons name="delete" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.headerSeparator}></View>
      <ScrollView style={styles.content}>
        <Text style={styles.timestamp}>
          {moment(post.timestamp).format('YYYY.MM.DD A hh:mm')}
        </Text>
        <Text style={styles.timestamp}>
          작성자: {post.user_nickname} {/* 작성자 닉네임 표시 */}
        </Text>



        {/* 본문에서만 이미지가 보이게 렌더링 */}
        {post.image && (
          <Image
            source={{ uri: post.image }}
            style={[styles.postImage, { aspectRatio: imageAspectRatio }]}  // 동적 비율 적용
            resizeMode="contain"
            onError={(error) => {
              console.error("Image load error: ", error);
              Alert.alert("이미지를 로드할 수 없습니다.");
            }}
          />
        )}

        <Text style={styles.postText}>{post.message}</Text>
        <View style={styles.separator}></View>
        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>댓글</Text>
          {postComments.map((comment, index) => (
            <Swipeable
              key={index}
              renderRightActions={() => renderRightActions(index)}
            >
              <View style={styles.commentContainer}>
                <Text style={styles.comment}>{comment.text}</Text>
                <Text style={styles.commentTimestamp}>{moment(comment.timestamp).format('YYYY.MM.DD A hh:mm')}</Text>
              </View>
            </Swipeable>
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
    flex: 1,
    textAlign: 'center',
  },
  iconButton: {
    padding: '2%',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerSeparator: {
    height: 1,
    backgroundColor: '#ddd',
    width: '100%',
  },
  content: {
    flex: 1,
    paddingHorizontal: '5%',
  },
  postText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
  },
  postImage: {
    width: '100%',
    aspectRatio: 1,  // 1:1 비율 (정사각형 이미지를 위해 설정)
    resizeMode: 'contain',  // 이미지 비율 유지
    borderRadius: 10,
    marginBottom: 20,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 3,
    // marginVertical: 10,
  },
  separator: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 10,
  },
  commentsSection: {
    marginTop: 20,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  commentContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  comment: {
    fontSize: 16,
    color: '#333',
  },
  commentTimestamp: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 5,
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
  deleteButton: {
    backgroundColor: '#ff0000',
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: '100%',
  },
});
