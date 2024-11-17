import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Keyboard, TextInput, ScrollView, Alert, Image, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome } from '@expo/vector-icons';
// import { Swipeable } from 'react-native-gesture-handler';
import * as Location from 'expo-location';
import moment from 'moment';
import { CommentsContext } from './CommentsContext';
import axios from 'axios';
import config from '../config';
import CustomModal from '../CustomModal'; // 모달 컴포넌트 import
import Toast from 'react-native-toast-message';


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
  const textInputRef = useRef(null);
  const scrollViewRef = useRef(null); // ScrollView 참조
  const [commentLayouts, setCommentLayouts] = useState([]);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [replyingVisible, setReplyingVisible] = useState(false);
  const { fromScrappedPosts } = route.params || {};
  const { fromMyPosts } = route.params || {};
  const { fromHome } = route.params || {};
  const {fromNearby} = route.param || {};
  const [optionsMenuVisible, setOptionsMenuVisible] = useState(false);


  const handleOptionsPress = () => {
    setOptionsMenuVisible((prevState) => !prevState); // 현재 상태를 반전
  };

  const handleBackPress = () => {
    if (fromScrappedPosts) {
      navigation.navigate('ScrappedPosts');
    } else if (fromMyPosts) {
      navigation.navigate('MyPosts');
    } else if (fromHome){
      navigation.navigate('Home');
    }else if(fromNearby){
      navigation.navigate('NeabySafety')
    } else {
      navigation.goBack();
    }
  };


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

  useEffect(() => {
    // 화면을 벗어나거나 돌아올 때 상태 초기화
    const unsubscribe = navigation.addListener('blur', () => {
      setReplyToCommentId(null); // 대댓글 상태 초기화
      setReplyComment(''); // 대댓글 입력 내용 초기화
    });

    return unsubscribe;
  }, [navigation]);

  const handleCommentLayout = (event, index) => {
    const layout = event.nativeEvent.layout;
    setCommentLayouts((prevLayouts) => {
      const newLayouts = [...prevLayouts];
      newLayouts[index] = layout.y;  // 댓글의 Y 위치 저장
      return newLayouts;
    });
  };

  const handleCommentSubmit = () => {
    const userRole = userData.role; // userData 객체에 롤 정보가 있다고 가정

    if (userRole === 'guest') {
      Toast.show({
        type: 'info',
        position: 'top',
        text1: '게스트는 댓글을 작성할 수 없습니다.',
        visibilityTime: 2000, // 2초 동안 표시
      });
      return; // 댓글 작성 중지
    }

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
    // 대댓글 모드가 아닐 때는 대댓글 모드로, 이미 대댓글 모드라면 일반 댓글 모드로 전환
    if (replyToCommentId === commentId) {
      setReplyToCommentId(null);  // 대댓글 모드 해제
      setReplyComment('');  // 대댓글 입력 초기화
    } else {
      setReplyToCommentId(commentId);  // 대댓글 모드 활성화
      setReplyComment('');
    }

    // 키보드 호출 (대댓글 입력창으로 포커스를 맞추기)
    setTimeout(() => {
      const parentCommentIndex = postComments.findIndex((c) => c.id === commentId);
      const parentCommentY = commentLayouts[parentCommentIndex];  // 부모 댓글의 Y 위치

      if (textInputRef.current) {
        textInputRef.current.focus();  // 대댓글 입력창에 포커스를 맞춤
      }

      // 대댓글 입력창으로 스크롤 이동
      if (scrollViewRef.current) {
        // 스크롤을 대댓글 입력창으로 이동시킴
        scrollViewRef.current.scrollTo({ x: 0, y: parentCommentY - 50, animated: true });  // 300은 스크롤 위치, 필요에 맞게 조정
      }
    }, 100);  // 딜레이 후 포커스 이동
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
    const userRole = userData.role; // userData 객체에 롤 정보가 있다고 가정

    if (userRole === 'guest') {
      Toast.show({
        type: 'info',
        position: 'top',
        text1: '게스트는 답글을 작성할 수 없습니다.',
        visibilityTime: 2000, // 2초 동안 표시
      });
      return; // 댓글 작성 중지
    }

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

  // const handleConfirm = () => {
  //   console.log("사용자가 '네'를 선택했습니다.");
  //   handleClose();
  //   navigation.replace('HomeScreen', { showModal: true });
  // };

  const handleConfirm = () => {
    console.log("사용자가 '네'를 선택했습니다.");
    handleClose(); // 모달 닫기
    navigation.navigate('Home', { screen: 'HomeScreen', params: { showModal: true } }); // Home 탭으로 이동
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
    const userRole = userData.role; // userData 객체에 롤 정보가 있다고 가정

    if (userRole === 'guest') {
      Toast.show({
        type: 'info',
        position: 'top',
        text1: '게스트는 스크랩할 수 없습니다.',
        visibilityTime: 2000, // 2초 동안 표시
      });
      return; // 작업 중지
    }
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
      const errorMessage = error.response?.data?.error;
      if (errorMessage === '자신이 작성한 글은 스크랩할 수 없습니다.') {
        Toast.show({
          type: 'error',
          position: 'top',
          text1: '알림',
          text2: '내가 작성한 글은 스크랩할 수 없습니다.',
          text1Style: { fontSize: 15, color: 'black' },
          text2Style: { fontSize: 13, color: 'black' },
          visibilityTime: 2000,
          autoHide: true,
        });
      } else {
        Toast.show({
          type: 'error',
          position: 'top',
          text1: '스크랩 실패',
          text2: '오류가 발생했습니다. 다시 시도해 주세요.',
          visibilityTime: 2000,
        });
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
        {/* 뒤로 가기 버튼 */}
        <TouchableOpacity onPress={() => handleBackPress()} style={styles.iconButton}>
          <MaterialIcons name="keyboard-arrow-left" size={30} color="black" />
        </TouchableOpacity>

        {/* 중앙 텍스트 (주소 및 시간 정보) */}
        <View style={styles.centerContent}>
          <Text style={styles.location}>
            {post.location_address} 안전 소식
          </Text>
          <View style={styles.timestampContainer}>
            <Text style={styles.timestampname}>{post.user_nickname}</Text>
            <Text style={styles.timestamp}>
              {moment(post.timestamp).format('YY/MM/DD HH:mm')}
            </Text>
          </View>
        </View>

        {/* 옵션 메뉴 또는 스크랩 버튼 */}
        {userData && userData.email === post.user_email ? (
          <View style={styles.optionsContainer}>
            <TouchableOpacity onPress={() => setOptionsMenuVisible(!optionsMenuVisible)} style={styles.optionsButton}>
              <MaterialIcons name="more-vert" size={20} color="gray" />
            </TouchableOpacity>
            {optionsMenuVisible && (
              <View style={styles.optionsMenu}>
                <TouchableOpacity
                  style={[styles.menuItem, { zIndex: 10 }]}
                  onPress={() => {
                    setOptionsMenuVisible(false);
                    // const { fromHome } = route.params;  // fromHome 값 받아오기
                    navigation.replace('UpdatePost', { 
                      post, 
                      // fromScreen: 'PostDetail', 
                      fromHome: fromHome === true  // fromHome이 true일 때만 전달
                    });
                  }}
                >
                  <MaterialIcons name="edit" size={20} color="#333" />
                  <Text style={styles.menuText}>수정</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.menuItem, { zIndex: 10 }]}
                  onPress={() => {
                    setOptionsMenuVisible(false);
                    handleDelete();
                  }}
                >
                  <MaterialIcons name="delete" size={20} color="#333" />
                  <Text style={styles.menuText}>삭제</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : (
          <TouchableOpacity onPress={handleScrap} style={styles.scrapButton}>
            <FontAwesome
              name={isScraped ? 'star' : 'star-o'}
              size={14}
              color={isScraped ? 'gold' : 'black'}
            />
            <Text style={styles.scrapCountText}>{scrapCount}</Text>
          </TouchableOpacity>
        )}
      </View>


      <View style={styles.headerSeparator}></View>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        style={styles.content}
        ref={scrollViewRef} // ScrollView에 ref 연결
      >
        <CustomModal
          visible={modalVisible}
          onClose={handleClose}
          onConfirm={handleConfirm}
        />
        <View style={styles.mainContent}>

          <Text style={styles.title}>{post.title}</Text>
          <Text style={styles.postText}>{post.message}</Text>
        </View>


        {post.image && imageWidth && imageHeight ? (
          <View style={{ alignItems: 'center', justifyContent: 'center', marginVertical: 10 }}>
            <Image
              source={{ uri: post.image }}
              style={{
                width: imageWidth * 0.9,
                height: imageHeight * 0.9,
                resizeMode: 'contain',
                borderRadius: 10,
              }}
              onError={(error) => {
                console.error("Image load error: ", error);
                Alert.alert("이미지를 로드할 수 없습니다.");
              }}
            />
          </View>
        ) : null}

        {/* {userData && userData.email === post.user_email && (
          <View style={{ flexDirection: 'row', marginTop: 15, marginBottom: 5 }}>
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
        )} */}



        <View style={styles.separator}></View>

        <View style={styles.commentsSection}>
          <View style={styles.commentsHeader}>
            <Text style={styles.commentsTitle}>댓글</Text>
            <View style={styles.commentScrapContainer}>
              <View style={styles.commentCountContainer}>
                <Ionicons name="chatbubble-outline" size={14} color="#666" />
                <Text style={styles.commentCountText}>{postComments.length || 0}</Text>
              </View>
              <TouchableOpacity onPress={handleScrap} style={styles.scrapButton}>
                <FontAwesome
                  name={isScraped ? 'star' : 'star-o'}
                  size={14} // 아이콘 크기를 줄임
                  color={isScraped ? 'gold' : 'black'}
                />
                <Text style={styles.scrapCountText}>{scrapCount}</Text>
              </TouchableOpacity>
            </View>
          </View>


          {postComments
            .filter(comment => comment.parent_comment_id === null) // 부모 댓글만 필터링
            .map((comment, index) => (
              <View
                key={index}
                style={[
                  styles.commentContainer,
                  // replyToCommentId === comment.id && styles.replyingComment,  // 대댓글 작성 중인 부모 댓글에 스타일 적용
                ]}
                onLayout={(event) => handleCommentLayout(event, index)} // onLayout 이벤트로 위치 추적
              >
                <View style={[styles.parentscomment, replyToCommentId === comment.id && styles.replyingComment,]}>
                  <Text style={styles.commentAuthor}>{comment.user_nickname || comment.nickname}</Text>
                  <Text style={styles.comment}>{comment.text || comment.comment_text}</Text>
                  <Text style={styles.commentTimestamp}>{moment(comment.timestamp).format('YY/MM/DD HH:mm')}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    handleReply(comment.id);
                    // 부모 댓글의 위치를 추적하여 해당 위치로 스크롤
                    const parentCommentIndex = postComments.findIndex((c) => c.id === comment.id);
                    const parentCommentY = commentLayouts[parentCommentIndex];  // 부모 댓글의 Y 위치
                    if (parentCommentY !== undefined) {
                      // 부모 댓글의 위치로 스크롤 (50px 만큼 위로 스크롤)
                      scrollViewRef.current.scrollTo({ x: 0, y: parentCommentY - 50, animated: true });
                    }
                  }}
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

      {/* replying */}
      {replyToCommentId && replyingVisible && (
        <View
          style={{
            position: 'absolute',
            bottom: keyboardHeight - 35,
            left: 0,
            right: 0,
            backgroundColor: 'white',
            padding: 10,
            borderTopWidth: 1,
            borderColor: '#ddd',
          }}
        >
          <Text style={{ fontWeight: 'bold', marginBottom: 15 }}>답글 달기 : </Text>
        </View>
      )}

      {/* Fixed comment input box at the bottom */}
      <View style={styles.commentInputContainer}>
        <TextInput
          ref={textInputRef}
          style={styles.commentInput}
          placeholder={replyToCommentId ? "대댓글을 입력하세요" : "댓글을 입력하세요"}
          value={replyToCommentId ? replyComment : newComment}
          onChangeText={replyToCommentId ? setReplyComment : setNewComment}
          onFocus={() => {
            setTimeout(() => {
              scrollViewRef.current.scrollToEnd({ animated: true });
            }, 100); // 키보드가 올라올 시간을 고려하여 약간의 지연을 줄 수 있음
          }}
        />
        <TouchableOpacity
          onPress={() => {
            if (replyToCommentId) {
              handleReplySubmit();
            } else {
              handleCommentSubmit();
            }
            Keyboard.dismiss();
            setTimeout(() => scrollViewRef.current.scrollToEnd({ animated: true }), 200);
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
  headerContent: {
    alignItems: 'center', // 텍스트를 가운데 정렬
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    // textAlign: 'center',
    // marginTop: 5,
    paddingBottom: '3%'
  },
  location: {
    flex: 1, // 가운데 정렬을 위한 유연한 공간 확보
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
    // paddingHorizontal: '5%',
    // marginBottom: 10,
    // marginBottom: 4,
  },
  mainContent: {
    // justifyContent: 'center', // 세로 가운데 정렬
    // alignItems: 'center',     // 가로 가운데 정렬
    marginHorizontal: 15, // 좌우 여백

  },
  postText: {
    fontSize: 17,
    color: '#333',
    marginBottom: 10,
  },
  timestampContainer: {
    flexDirection: 'row', // 가로 배열 설정
    alignItems: 'center', // 텍스트 세로 정렬
  },
  timestamp: {
    fontSize: 11,
    color: '#8E8E8E',
    fontWeight: '600',
    paddingTop: 1,
    marginTop: 2,
    // marginVertical: 10,
  },
  timestampname: {
    marginRight: 5,
    marginTop: 1,
    fontSize: 14,
    color: '#5E5E5E',
    fontWeight: '700',
  },
  separator: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 10,
  },
  commentsSection: {
    marginTop: 20,
    marginBottom: 30, // 입력창 높이만큼 공간을 남겨둠
    marginHorizontal: 10,

  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: 'bold',

  },
  commentContainer: {
    // padding: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',

  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333', // 작성자 닉네임 색상
    // marginBottom: 3, // 댓글 본문과의 간격 조절
    marginTop: 5,
    marginHorizontal: 10, // 좌우 여백

  },
  comment: {
    fontSize: 16,
    color: '#333',
    marginHorizontal: 10, // 좌우 여백
  },
  commentTimestamp: {
    fontSize: 12,
    color: '#999',
    textAlign: 'left',
    marginTop: 5,
    marginBottom: 5,
    marginHorizontal: 10, // 좌우 여백
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
  scrapButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrapCountText: {
    fontSize: 12,
    marginLeft: 3,
    color: '#666',
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
    borderRadius: 10,
    marginRight: 10,
    marginBottom: 5,
    // marginTop: 5,
  },
  parentscomment: {
    paddingBottom: 10,
    paddingVertical: 10, // 상하 여백

  },
  replyingComment: {
    backgroundColor: '#f0f8ff',  // 대댓글 작성 중인 부모 댓글의 배경색
    paddingBottom: 10,
  },
  moreOptionsButton: {
    padding: 5,
  },
  modalButtonText: {
    fontSize: 16,
    color: '#333',
  },
  optionsMenu: {
    position: 'absolute',
    top: 50, // 옵션바 아래로 약간 내려오도록 위치 조정
    right: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5, // Android 그림자 효과
    zIndex: 1000,
    marginTop: '10%'
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: 'white'
  },
  menuText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  commentScrapContainer: {
    flexDirection: 'row',

  },
  optionsContainer: {
    flexDirection: 'row', // 옵션 버튼 가로 정렬
    alignItems: 'center',

  },
  optionsButton: {
    paddingHorizontal: 5,
  },
  optionsMenu: {
    position: 'absolute',
    top: 40,
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    elevation: 5,
    padding: 10,
  },
  scrapButton: {
    flexDirection: 'row', // 아이콘과 텍스트 가로 정렬
    alignItems: 'center',
  },
  scrapCountText: {
    marginLeft: 5,
    fontSize: 14,
  },
  location: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  timestampContainer: {
    flexDirection: 'row',
    marginTop: 2,
  },
  timestampname: {
    fontSize: 12,
    color: '#666',
    marginRight: 5,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  centerContent: {
    flex: 1, // 중앙 컨텐츠가 가로 공간 차지
    alignItems: 'center', // 텍스트 가운데 정렬
  },
});