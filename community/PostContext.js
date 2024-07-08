import React, { createContext, useState } from 'react';

// 초기 상태와 함께 Context를 생성합니다.
export const PostContext = createContext({
  posts: [],
  addPost: () => {},
});

// Provider 컴포넌트를 정의합니다.
export const PostProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);

  // 글을 추가하는 함수
  const addPost = (category, title, content) => {
    const newPost = { category, title, content };
    setPosts([...posts, newPost]);
  };

  return (
    <PostContext.Provider value={{ posts, addPost }}>
      {children}
    </PostContext.Provider>
  );
};