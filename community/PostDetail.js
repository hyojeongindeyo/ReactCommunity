import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Keyboard, TextInput, ScrollView, Alert, Image, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome } from '@expo/vector-icons';
// import { Swipeable } from 'react-native-gesture-handler';
import * as Location from 'expo-location';
import moment from 'moment';
import { CommentsContext } from './CommentsContext';
import axios from 'axios';
import config from '../config';
import CustomModal from '../CustomModal'; // 모달 컴포넌트 import


export default function PostDetail({ route, navigation }) {
  const { post } = route.params;
  const { comments, setComments } = useContext(CommentsContext);
  const [userData, setUserData] = useState(null);
  const postId = post.id;
  const [isScraped, setIsScraped] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [imageAspectRatio, setImageAspectRatio] = useState(1); // 기본 비율 설정
  const [scrapCount, setScrapCount] = useState(0); // 스크랩 수 상태 변수 추가
  const [location, setLocation] = useState(null);
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [imageWidth, setImageWidth] = useState(null);
  const [imageHeight, setImageHeight] = useState(null);
  const [replyComment, setReplyComment] = useState(''); // 대댓글 입력 상태
  const [replyToCommentId, setReplyToCommentId] = useState(null); // 대댓글을 달고자 하는 댓글 ID
  const [selectedCommentId, setSelectedCommentId] = useState(null); // 댓글 또는 대댓글을 다는 댓글 ID



  useEffect(() => {
    console.log("수정된 데이터:", post);
  }, [post]);

  // 이미지 비율 동적 계산
  useEffect(() => {
    if (post.image) {
      Image.getSize(
        post.image,
        (width, height) => {
          const screenWidth = Dimensions.get("window").width;
          const aspectRatio = width / height;
          setImageWidth(screenWidth);
          setImageHeight(screenWidth / aspectRatio);  // 화면 너비에 맞춰 높이 조절
        },
        (error) => {
          console.error("Image load error: ", error);
          Alert.alert("이미지를 로드할 수 없습니다.");
        }
      );
    }
  }, [post.image]);

  useEffect(() => {
    fetchUserSession();
    checkIfScraped(); // 스크랩 상태 확인
    fetchScrapCount();
    increaseViews();  // 게시물 열릴 때 조회수 증가
  }, []);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axios.get(`${config.apiUrl}/comments/${post.id}`);
        console.log("Fetched comments:", response.data); // 받아온 댓글 데이터를 확인

        setComments({
          ...comments,
          [postId]: response.data
        });
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };

    fetchComments();
  }, [post.id]);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.error('Location permission not granted');
          return;
        }

        let loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        let address = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });

        if (address.length > 0) {
          setCity(address[0].city || '');
          setDistrict(address[0].district || '');
        }
      } catch (error) {
        console.error('Error fetching location:', error);
      }
    };

    fetchLocation(); // 컴포넌트가 마운트될 때 위치 정보 가져오기
  }, []);

  const increaseViews = async () => {
    try {
      await axios.post(`${config.apiUrl}/posts/${post.id}/increaseViews`);
    } catch (error) {
      console.error('조회수 증가 실패:', error);
    }
  };

  const fetchUserSession = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/users/session`, { withCredentials: true });
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
              await axios.delete(`${config.apiUrl}/posts/delete/${postId}`, { withCredentials: true });
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
      postComment(newComment, userData.id); // 새 댓글과 사용자 ID를 전달

      // 댓글 작성 후 다시 댓글 목록을 가져옴
      axios.get(`${config.apiUrl}/comments/${post.id}`)
        .then(response => {
          console.log("최신 댓글을 가져왔습니다:", response.data); // 최신 댓글 로그

          // 댓글 상태를 다시 업데이트
          setComments({
            ...comments,
            [postId]: response.data
          });
        })
        .catch(error => {
          console.error('최신 댓글 가져오기 오류:', error);
        });

      setNewComment(''); // 입력란 비우기
    }
  };
  const postComment = async (commentText, userId) => {
    try {
      // 댓글 작성 API 호출
      const commentResponse = await axios.post(`${config.apiUrl}/comments`, {
        post_id: post.id,
        comment_text: commentText,
      }, { withCredentials: true });

      console.log("댓글이 작성되었습니다:", commentResponse.data);

      // 미션 완료 여부 확인
      const missionStatusResponse = await axios.get(`${config.apiUrl}/missions/user/${userId}`);
      const isMissionCompleted = missionStatusResponse.data.missions.includes(1); // 댓글 작성 미션 ID가 1인 경우

      if (!isMissionCompleted) {
        // 미션 완료 API 호출
        const completeMissionResponse = await axios.post(`${config.apiUrl}/missions/complete-mission`, {
          userId: userId,
          missionId: 1 // 댓글 작성 미션 ID
        });

        console.log(completeMissionResponse.data.message); // 미션 완료 메시지

        // 모달 표시
        setModalVisible(true);
      } else {
        console.log("이미 미션이 완료되었습니다.");
      }

    } catch (error) {
      console.error('오류 발생:', error.response ? error.response.data : error);
    }
  };

  const handleReply = (commentId) => {
    if (replyToCommentId === commentId) {
      // 이미 선택한 댓글이면 대댓글 입력창을 닫고 댓글 입력창으로 돌아감
      setReplyToCommentId(null);
      setReplyComment(""); // 대댓글 상태 초기화
    } else {
      // 대댓글을 작성할 댓글을 선택
      setReplyToCommentId(commentId);
      setReplyComment(""); // 기존 대댓글 초기화
    }
  };
  
  const fetchComments = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/comments/${post.id}`);
      setComments({
        ...comments,
        [postId]: response.data
      });
    } catch (error) {
      console.error('댓글 목록 업데이트 오류:', error);
    }
  };

  const handleReplySubmit = async () => {
    console.log("입력된 대댓글:", replyComment); // 대댓글 내용 확인

    if (replyComment.trim()) {
      // 대댓글 작성
      await postReplyComment(replyComment, userData.id, replyToCommentId);
      setReplyComment(''); // 입력 필드 초기화
      setReplyToCommentId(null); // 대댓글 대상 초기화

      // 대댓글 작성 후 댓글 목록 새로 고침
      fetchComments();
    }
  };


  // 대댓글 작성 API 호출
  const postReplyComment = async (replyComment, userId, commentId) => {
    console.log("대댓글 내용:", replyComment, "작성자 ID:", userId, "댓글 ID:", commentId);
    try {
      const response = await axios.post(`${config.apiUrl}/comments/reply`, {
        post_id: post.id,
        parent_comment_id: commentId,
        comment_text: replyComment,
      }, { withCredentials: true });

      console.log("대댓글 작성 성공:", response.data);
    } catch (error) {
      console.error('대댓글 작성 오류:', error.response ? error.response.data : error);
    }
  };

  const handleReplyDelete = (replyId) => {
    Alert.alert(
      "대댓글 삭제",
      "정말로 이 대댓글을 삭제하시겠습니까?",
      [
        { text: "취소", style: "cancel" },
        {
          text: "삭제", onPress: async () => {
            try {
              // 서버에 대댓글 삭제 요청 보내기
              await axios.delete(`${config.apiUrl}/comments/${replyId}`, { withCredentials: true });

              // 삭제된 대댓글을 상태에서 제거
              const updatedComments = postComments.map(comment => {
                if (comment.parent_comment_id === null) { // 부모 댓글만 필터링
                  return {
                    ...comment,
                    replies: comment.replies ? comment.replies.filter(reply => reply.id !== replyId) : [] // replies가 없으면 빈 배열로 처리
                  };
                }
                return comment;
              });
              

              setComments({
                ...comments,
                [postId]: updatedComments
              });

              Alert.alert("삭제 완료", "대댓글이 삭제되었습니다.");
              fetchComments();
            } catch (error) {
              console.error('대댓글 삭제 오류:', error);
              Alert.alert("삭제 실패", "대댓글 삭제에 실패했습니다.");
            }
          }
        },
      ],
      { cancelable: false }
    );
  };


  const handleClose = () => {
    setModalVisible(false);
  };

  const handleConfirm = () => {
    console.log("사용자가 '네'를 선택했습니다.");
    handleClose();
    navigation.replace('HomeScreen', { showModal: true });
  };


  const handleCommentOptions = (commentId) => {
    Alert.alert(
      "댓글 옵션",
      "이 댓글을 삭제하시겠습니까?",
      [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          onPress: () => handleCommentDelete(commentId),
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  const handleCommentDelete = (commentId) => {
    Alert.alert(
      "댓글 삭제",
      "정말로 이 댓글을 삭제하시겠습니까?",
      [
        { text: "취소", style: "cancel" },
        {
          text: "삭제", onPress: async () => {
            try {
              // 서버에 삭제 요청 보내기
              await axios.delete(`${config.apiUrl}/comments/${commentId}`, { withCredentials: true });

              // 삭제된 댓글을 상태에서 제거
              const updatedComments = postComments.filter(comment => comment.id !== commentId);
              setComments({
                ...comments,
                [postId]: updatedComments
              });

              Alert.alert("삭제 완료", "댓글이 삭제되었습니다.");
            } catch (error) {
              console.error('댓글 삭제 오류:', error);
              Alert.alert("삭제 실패", "댓글 삭제에 실패했습니다.");
            }
          }
        },
      ],
      { cancelable: false }
    );
  };

  const renderRightActions = (commentId) => (
    <TouchableOpacity onPress={() => handleCommentDelete(commentId)} style={styles.deleteButton}>
      <MaterialIcons name="delete" size={24} color="white" />
    </TouchableOpacity>
  );

  const checkIfScraped = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/scraps/${post.id}`, { withCredentials: true });
      setIsScraped(response.data.isScraped);
    } catch (error) {
      console.error('스크랩 상태 조회 오류:', error);
    }
  };

  // 스크랩 수 조회 함수
  const fetchScrapCount = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/scraps/count/${postId}`);
      setScrapCount(response.data.scrapCount);
    } catch (error) {
      console.error('스크랩 수 조회 오류:', error);
    }
  };

  const handleScrap = async () => {
    try {
      if (isScraped) {
        await axios.delete(`${config.apiUrl}/scraps/${postId}`, { withCredentials: true });
        setIsScraped(false);
        setScrapCount(scrapCount - 1); // 스크랩 수 감소
      } else {
        await axios.post(`${config.apiUrl}/scraps`, { post_id: postId }, { withCredentials: true });
        setIsScraped(true);
        setScrapCount(scrapCount + 1); // 스크랩 수 증가
      }
    } catch (error) {
      // 서버로부터의 오류 메시지 확인
      const errorMessage = error.response?.data?.error;
      if (errorMessage === '자신이 작성한 글은 스크랩할 수 없습니다.') {
        Alert.alert("알림", "내가 작성한 글은 스크랩할 수 없습니다."); // 사용자에게 안내 메시지 표시
      } else {
        console.error('스크랩 오류:', error);
      }
    }
  };


  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}  // Offset value
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <MaterialIcons name="keyboard-arrow-left" size={30} color="black" />
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.location}>
            {post.location_address} 안전 소식
          </Text>
          <Text style={styles.timestamp}>
            {moment(post.timestamp).format('YY/MM/DD HH:mm')}
          </Text>
          <Text style={styles.timestamp}>{post.user_nickname}</Text>
        </View>

        <TouchableOpacity onPress={handleScrap} style={styles.scrapButton}>
          <FontAwesome name={isScraped ? 'star' : 'star-o'} size={20} color={isScraped ? 'gold' : 'black'} />
          <Text style={{ marginLeft: 3 }}>{scrapCount}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.headerSeparator}></View>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        style={styles.content}
        ref={(ref) => (this.scrollView = ref)}
      >
        <CustomModal
          visible={modalVisible}
          onClose={handleClose}
          onConfirm={handleConfirm}
        />
        <Text style={styles.title}>{post.title}</Text>
        <Text style={styles.postText}>{post.message}</Text>

        {post.image && imageWidth && imageHeight ? (
          <Image
            source={{ uri: post.image }}
            style={{
              width: imageWidth * 0.9,
              height: imageHeight * 0.9,
              resizeMode: 'contain',
              marginVertical: 10,
              borderRadius: 10,
            }}
            onError={(error) => {
              console.error("Image load error: ", error);
              Alert.alert("이미지를 로드할 수 없습니다.");
            }}
          />
        ) : null}

        {userData && userData.email === post.user_email && (
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity style={styles.udButton} onPress={handleDelete}>
              <Text style={styles.udText}>삭제</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.replace('UpdatePost', { post })}
              style={[styles.udButton, { marginLeft: 5 }]}
            >
              <Text style={styles.udText}>수정</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.separator}></View>

        <View style={styles.commentsSection}>
          <View style={styles.commentsHeader}>
            <Text style={styles.commentsTitle}>댓글</Text>
            <View style={styles.commentCountContainer}>
              <Ionicons name="chatbubble-outline" size={16} color="#666" />
              <Text style={styles.commentCountText}>{postComments.length || 0}</Text>
            </View>
          </View>

          {postComments
            .filter(comment => comment.parent_comment_id === null) // 부모 댓글만 필터링
            .map((comment, index) => (
              <View key={index} style={styles.commentContainer}>
                <Text style={styles.commentAuthor}>{comment.user_nickname || comment.nickname}</Text>
                <Text style={styles.comment}>{comment.text || comment.comment_text}</Text>
                <Text style={styles.commentTimestamp}>{moment(comment.timestamp).format('YY/MM/DD HH:mm')}</Text>

                <TouchableOpacity
                  onPress={() => handleReply(comment.id)} // 대댓글 작성
                  style={styles.replyButton}
                >
                  <MaterialIcons name="reply" size={20} color="gray" />
                </TouchableOpacity>

                {userData && comment.user_id === userData.id && (
                  <TouchableOpacity onPress={() => handleCommentOptions(comment.id)} style={styles.optionsButton}>
                    <MaterialIcons name="more-vert" size={20} color="gray" />
                  </TouchableOpacity>
                )}

                {/* 부모 댓글 아래에 해당하는 자식 댓글을 표시 */}
                {postComments
                  .filter(reply => reply.parent_comment_id === comment.id) // 현재 부모 댓글에 해당하는 자식 댓글만 필터링
                  .map((reply, replyIndex) => (
                    <View key={replyIndex} style={styles.replyContainer}>
                      <Text style={styles.commentAuthor}>{reply.user_nickname || reply.nickname}</Text>
                      <Text style={styles.comment}>{reply.text || reply.comment_text}</Text>
                      <Text style={styles.commentTimestamp}>{moment(reply.timestamp).format('YY/MM/DD HH:mm')}</Text>
                      {userData && reply.user_id === userData.id && (
                        <TouchableOpacity onPress={() => handleReplyDelete(reply.id)} style={styles.optionsButton}>
                          <MaterialIcons name="more-vert" size={20} color="gray" />
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
              </View>
            ))}


        </View>
      </ScrollView>

      {/* Fixed comment input box at the bottom */}
      <View style={styles.commentInputContainer}>
        <TextInput
          style={styles.commentInput}
          placeholder={replyToCommentId ? "대댓글을 입력하세요" : "댓글을 입력하세요"} // 조건에 따라 placeholder 변경
          value={replyToCommentId ? replyComment : newComment} // 대댓글일 경우 replyComment, 일반 댓글일 경우 newComment
          onChangeText={replyToCommentId ? setReplyComment : setNewComment} // 상태 업데이트 함수 변경
        />


        <TouchableOpacity
          onPress={() => {
            if (replyToCommentId) {
              // 대댓글인 경우
              handleReplySubmit(); // 대댓글 등록
            } else {
              // 댓글인 경우
              handleCommentSubmit(); // 댓글 등록
            }
            Keyboard.dismiss();
            setTimeout(() => this.scrollView.scrollToEnd({ animated: true }), 200);
          }}
          style={styles.commentSubmitButton}
        >
          <Text style={styles.commentSubmitButtonText}>등록</Text>
        </TouchableOpacity>

      </View>
    </KeyboardAvoidingView>
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginBottom: 80,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: '5%',
    paddingTop: '10%',
    paddingBottom: '3%',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    // textAlign: 'center',
    // marginTop: 5,
    paddingBottom: '5%'
  },
  location: {
    fontSize: 16,
    color: '#565656',
    textAlign: 'center',
    paddingTop: 10,
    paddingBottom: 2,
    fontWeight: '600'
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
    paddingTop: '5%',
    paddingHorizontal: '5%',
    // marginBottom: 10,
    // marginBottom: 4,

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
  scrapButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 12,
    color: '#8E8E8E',
    fontWeight: '600',
    paddingTop: 1,
    // marginTop: 3,
    // marginVertical: 10,
  },
  separator: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 10,
  },
  commentsSection: {
    marginTop: 20,
    marginBottom: 30, // 입력창 높이만큼 공간을 남겨둠

  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: 'bold',

  },
  commentContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333', // 작성자 닉네임 색상
    marginBottom: 3, // 댓글 본문과의 간격 조절
  },
  comment: {
    fontSize: 16,
    color: '#333',
  },
  commentTimestamp: {
    fontSize: 12,
    color: '#999',
    textAlign: 'left',
    marginTop: 5,
  },
  commentInputContainer: {
    // position: 'absolute', // 화면 하단에 고정
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
    paddingLeft: 10,
    paddingBottom: 10,
    backgroundColor: 'white', // 배경색을 설정하여 입력창이 잘 보이게

  },

  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#F8F8F8',
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
  optionsButton: {
    position: 'absolute',
    right: 10,
    top: 10,
  },
  replyButton: {
    position: 'absolute',
    right: 30,
    top: 10,
  },
  // deleteButton: {
  //   backgroundColor: 'red',
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   width: 70,
  //   height: '100%',
  // },
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
  },
  commentCountContainer: {
    flexDirection: 'row',  // 한 줄로 배치
    alignItems: 'center',  // 수직 중앙 정렬
    // 간격 조절
  },
  commentCountText: {
    fontSize: 14,          // 댓글 수의 글씨 크기를 12로 설정
    color: '#666',
    marginLeft: 3,         // 말풍선 아이콘과 댓글 수 텍스트 사이의 간격
  },
  commentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between', // 양쪽 끝에 요소 배치
    alignItems: 'center',            // 수직 중앙 정렬
    marginBottom: 10,
  },
  replyContainer: {
    marginLeft: 20,          // 부모 댓글로부터 들여쓰기
    padding: 10,
    paddingVertical: 5,      // 위아래 패딩 추가
    // borderLeftWidth: 2,      // 왼쪽에 선 추가해서 구분감 줌
    // borderLeftColor: '#ccc', // 선 색상 설정
    backgroundColor: '#f5f5f5', // 배경색 설정 (부드러운 회색)
    marginTop: 5,
  },
});