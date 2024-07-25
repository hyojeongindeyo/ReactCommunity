import React, { createContext, useState } from 'react';

export const PostContext = createContext();

export const PostProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);

  const addPost = (category, title, content, image) => {
    const newPost = {
      id: posts.length + 1,
      category,
      title,
      content,
      image,
      timestamp: new Date().toLocaleString(),
    };
    setPosts([newPost, ...posts]);
  };

  return (
    <PostContext.Provider value={{ posts, addPost }}>
      {children}
    </PostContext.Provider>
  );
};
