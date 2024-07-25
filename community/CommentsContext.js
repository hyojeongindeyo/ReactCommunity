import React, { createContext, useState } from 'react';

export const CommentsContext = createContext();

export const CommentsProvider = ({ children }) => {
  const [comments, setComments] = useState({
    // 예제 데이터
    1: [{ text: '첫 댓글입니다.', timestamp: '2024.07.24 15:40 PM' }],
    2: [{ text: '두 번째 댓글입니다.', timestamp: '2024.07.24 15:35 PM' }],
  });

  return (
    <CommentsContext.Provider value={{ comments, setComments }}>
      {children}
    </CommentsContext.Provider>
  );
};
