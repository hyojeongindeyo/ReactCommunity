import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const CommentsContext = createContext();

export const CommentsProvider = ({ children }) => {
  const [comments, setComments] = useState({});

  useEffect(() => {
    const loadComments = async () => {
      try {
        const storedComments = await AsyncStorage.getItem('comments');
        if (storedComments) {
          setComments(JSON.parse(storedComments));
        }
      } catch (error) {
        console.error("Failed to load comments from storage", error);
      }
    };

    loadComments();
  }, []);

  const saveComments = async (newComments) => {
    try {
      await AsyncStorage.setItem('comments', JSON.stringify(newComments));
      setComments(newComments);
    } catch (error) {
      console.error("Failed to save comments to storage", error);
    }
  };

  return (
    <CommentsContext.Provider value={{ comments, setComments: saveComments }}>
      {children}
    </CommentsContext.Provider>
  );
};
