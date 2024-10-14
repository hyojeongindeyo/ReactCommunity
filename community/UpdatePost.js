import React, { useState, useContext, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image, Alert, KeyboardAvoidingView, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import config from '../config';
import { PostsContext } from './PostsContext';
//import moment from 'moment-timezone';

export default function UpdatePost({ navigation, route }) {
    const { post } = route.params;
    const { posts } = useContext(PostsContext);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [postTitle, setPostTitle] = useState('');
    const [postContent, setPostContent] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [userNickname, setUserNickname] = useState('');
    // const [updatedTimestamp, setupdatedTimestamp] = useState('');

    useEffect(() => {
        console.log("전달된 포스트 데이터: ", route.params.post);
    }, [route.params.post]);

    useEffect(() => {
        setPostTitle(post.title);
        setPostContent(post.message);
        setSelectedCategory(post.category);
        setSelectedImage(post.image);
        setUserEmail(post.user_email); // 추가된 부분
        setUserNickname(post.user_nickname); // 추가된 부분
        // setupdatedTimestamp(post.updated_timestamp);
    }, [post]);


    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
        }
    };

    const handlePostUpdate = async () => {
        const postId = post.id;

        if (!selectedCategory || !postTitle.trim() || !postContent.trim()) {
            Alert.alert('모든 필드를 채워주세요');
            return;
        }

        setLoading(true);

        const formData = new FormData();
        formData.append('category', selectedCategory);
        formData.append('title', postTitle);
        formData.append('message', postContent);
        formData.append('user_email', userEmail); // 추가된 부분
        formData.append('user_nickname', userNickname); // 추가된 부분

        const Timestamp = post.timestamp; // 예: '2024-01-01 12:00:00'


        const updatedTimestamp = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ')
        formData.append('updated_timestamp', updatedTimestamp);

        // formData.append('timestamp', new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ')); // KST로 변환


        // 선택된 이미지가 기존 이미지와 다를 경우에만 새 이미지를 추가
        if (selectedImage && selectedImage !== post.image) {
            formData.append('image', {
                uri: selectedImage,
                name: selectedImage.split('/').pop(),
                type: 'image/jpeg',
            });
        }

        try {
            await axios.put(`${config.apiUrl}/posts/${postId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true,
            });

            // 업데이트된 포스트 정보를 생성
            const updatedPost = {
                id: postId,
                title: postTitle,
                message: postContent,
                category: selectedCategory,
                image: selectedImage || post.image,
                user_email: userEmail, // 추가된 부분
                user_nickname: userNickname, // 추가된 부분
                timestamp: Timestamp, // 작성 시간 유지
                updated_timestamp: updatedTimestamp,
            };

            // console.log('Updated Post:', updatedPost);

            navigation.replace('PostDetail', { post: updatedPost });

        } catch (error) {
            console.error('Error updating post:', error.response ? error.response.data : error.message);
            Alert.alert('Error', 'Failed to update post: ' + (error.response ? error.response.data.message : 'Unknown error'));
        } finally {
            setLoading(false);
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
                        <Text style={styles.title}>게시물 수정하기</Text>
                        <View style={styles.placeholder} />
                    </View>

                    <View style={styles.content}>
                        <View style={styles.categoryContainer}>
                            <Text style={styles.label}>카테고리</Text>
                            <View style={styles.categories}>
                                {['교통', '화재', '재해', '주의'].map((category, index) => (
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

                        <TouchableOpacity style={styles.addButton} onPress={handlePostUpdate} disabled={loading}>
                            <Text style={styles.buttonText}>{loading ? '수정 중...' : '수정 완료'}</Text>
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
        paddingBottom: 110,
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
        height: 300,
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
