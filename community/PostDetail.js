import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import moment from 'moment';
import { CommentsContext } from './CommentsContext';
import axios from 'axios';
import config from '../config';

export default function PostDetail({ route, navigation }) {
  const { post } = route.params;
  const { comments, setComments } = useContext(CommentsContext);
  const [userData, setUserData] = useState(null);
  const postId = post.id;

  const [newComment, setNewComment] = useState('');
  const [imageAspectRatio, setImageAspectRatio] = useState(1); // 기본 비율 설정

  useEffect(() => {
    console.log("수정된 데이터:", post);
  }, [post]);

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

  useEffect(() => {
    fetchUserSession();
  }, []);

  const fetchUserSession = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/session`, { withCredentials: true });
      setUserData(response.data);
    } catch (error) {
      console.error('Error fetching user session:', error);
    }
  };

  const postComments = comments[postId] || [];

  const handleDelete = async () => {
    Alert.alert(
      "글 삭제",
      "정말로 이 글을 삭제하시겠습니까?",
      [
        { text: "취소", style: "cancel" },
        {
          text: "삭제", onPress: async () => {
            try {
              await axios.delete(`${config.apiUrl}/posts/${postId}`, { withCredentials: true });
              Alert.alert("삭제 완료", "게시물이 삭제되었습니다.");
              navigation.goBack(); // 삭제 후 이전 화면으로 돌아가기
            } catch (error) {
              console.error('Error deleting post:', error);
              Alert.alert("삭제 실패", "게시물 삭제에 실패했습니다.");
            }
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

        <View style={styles.iconhide}><MaterialIcons name="keyboard-arrow-left" size={30} color="black" /></View>
      </View>
      <View style={styles.headerSeparator}></View>
      <ScrollView style={styles.content}>
        <Text style={styles.timestamp}>
          작성 시간: {moment(post.timestamp).format('YYYY.MM.DD A hh:mm')}
        </Text>
        {post.updated_timestamp && ( // 수정 시간이 존재할 경우에만 표시
          <Text style={styles.timestamp}>
            수정 시간: {moment(post.updated_timestamp).format('YYYY.MM.DD A hh:mm')}
          </Text>
        )}
        <Text style={styles.timestamp}>
          작성자: {post.user_nickname} {/* 작성자 닉네임 표시 */}
        </Text>



        {post.image ? (
          <View>
            <Image
              source={{ uri: post.image }}
              style={{
                width: '100%',
                height: imageAspectRatio > 1 ? 200 : 250, // 가로 비율에 따라 높이 조정
                resizeMode: 'contain',
                marginTop: 10,
                marginBottom: 16, // 이미지 아래 간격 추가
              }}
              onError={(error) => {
                console.error("Image load error: ", error);
                Alert.alert("이미지를 로드할 수 없습니다.");
              }}
            />
          </View>
        ) : null}

        <Text style={styles.postText}>{post.message}</Text>

        {/* 삭제 버튼 */}
        {userData && userData.email === post.user_email && ( // 현재 사용자가 작성한 글인지 확인
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity style={styles.udButton} onPress={handleDelete}>
              <Text style={styles.udText}>삭제</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                console.log("수정할 데이터: ", post); // 수정할 데이터 로그
                navigation.replace('UpdatePost', { post });
              }}
              style={[styles.udButton, { marginLeft: 5 }]}
            >
              <Text style={styles.udText}>수정</Text>
            </TouchableOpacity>

          </View>

        )}



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
  iconhide: {
    opacity: 0
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
    fontSize: 17,
    color: '#333',
    marginBottom: 20,
  },
  // postImage: {
  //   width: '100%',
  //   resizeMode: 'contain',  // 이미지 비율 유지
  //   height: 280,
  //   borderRadius: 10,
  //   marginBottom: 20,
  // },
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
  udButton: {
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    width: 55,
    height: 25,
    borderRadius: 6,
  },
  udText: {
    fontWeight: 'bold',
  }

});
