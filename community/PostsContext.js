import React, { createContext, useState } from 'react';

export const PostsContext = createContext();

export const PostsProvider = ({ children }) => {
  const [posts, setPosts] = useState([
    // 기존 글들
    { id: 1, category: '교통', title: '교통사고 발생', message: '00사거리에 교통사고가 발생했어요.', timestamp: '2024-07-24T15:33:00', image: null },
    { id: 2, category: '시위', title: '시위 주의', message: '시위가 진행 중이니 주의하세요.', timestamp: '2024-07-24T15:30:00', image: null },
    { id: 3, category: '재해', title: '비 예보', message: '오늘 저녁부터 비가 올 예정이니 우산을 챙기세요.', timestamp: '2024-07-24T15:20:00', image: null },
  ]);

  const addPost = (newPost) => {
    setPosts([...posts, { ...newPost, id: posts.length + 1 }]);
  };

  return (
    <PostsContext.Provider value={{ posts, addPost }}>
      {children}
    </PostsContext.Provider>
  );
};
