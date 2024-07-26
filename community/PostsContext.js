import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const PostsContext = createContext();

export const PostsProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);

  const defaultPosts = [
    { id: '1', category: '교통', title: '교통사고 발생', message: '00사거리에 교통사고가 발생했어요.', timestamp: '2024-07-24T15:33:00', image: null },
    { id: '2', category: '시위', title: '시위 주의', message: '시위가 진행 중이니 주의하세요.', timestamp: '2024-07-24T15:30:00', image: null },
    { id: '3', category: '재해', title: '비 예보', message: '오늘 저녁부터 비가 올 예정이니 우산을 챙기세요.', timestamp: '2024-07-24T15:20:00', image: null },
    { id: '4', category: '주의', title: '폭염 주의', message: '외출을 삼가하세요.', timestamp: '2024-07-24T15:20:00', image: null },
  ];

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const storedPosts = await AsyncStorage.getItem('posts');
        if (storedPosts) {
          setPosts(JSON.parse(storedPosts));
        } else {
          setPosts(defaultPosts);
        }
      } catch (error) {
        console.error('Failed to load posts:', error);
        setPosts(defaultPosts);
      }
    };
    loadPosts();
  }, []);

  const savePosts = async (newPosts) => {
    try {
      await AsyncStorage.setItem('posts', JSON.stringify(newPosts));
      setPosts(newPosts);
    } catch (error) {
      console.error('Failed to save posts:', error);
    }
  };

  const addPost = (newPost) => {
    const updatedPosts = [...posts, { ...newPost, id: (posts.length + 1).toString() }];
    savePosts(updatedPosts);
  };

  const updatePost = (updatedPost) => {
    const updatedPosts = posts.map(post => 
      post.id === updatedPost.id ? updatedPost : post
    );
    savePosts(updatedPosts);
  };

  const deletePost = (postId) => {
    const updatedPosts = posts.filter(post => post.id !== postId);
    savePosts(updatedPosts);
  };

  return (
    <PostsContext.Provider value={{ posts, addPost, updatePost, deletePost }}>
      {children}
    </PostsContext.Provider>
  );
};
