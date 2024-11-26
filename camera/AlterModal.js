import React, { useState } from 'react';
import { Modal, StyleSheet, Text, Pressable, View, Animated, Easing, Linking, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AlterModal = ({ modalVisible, onClose, content, subContent, showReportLink }) => {
  const [fadeAnim] = useState(new Animated.Value(0));

  const openModal = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={modalVisible}
      onShow={openModal}
      onRequestClose={closeModal}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.modalView, { opacity: fadeAnim }]}>
          <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
            <Ionicons name="close" size={20} color="#4F4F4F" />
          </TouchableOpacity>
          <Text style={styles.modalText}>{content}</Text>
          {/* subContent 추가 */}
          {subContent && <Text style={styles.modalSubText}>{subContent}</Text>}
          {showReportLink && (
            <Pressable
              style={[styles.button, styles.buttonReport]}
              onPress={() => Linking.openURL("https://www.safetyreport.go.kr/#safereport/safereport")}>
              <Text style={styles.textStyle}>신고 바로가기</Text>
            </Pressable>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  modalView: {
    width: '80%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
    borderColor: 'white',
    borderWidth: 2,
    shadowColor: '#000', 
    shadowOffset: {
      width: 0,
      height: 2, 
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 2,
    right: 2,
  },
  button: {
    borderRadius: 15,
    paddingVertical: 12,
    paddingHorizontal: 20,
    elevation: 2,
  },
  buttonReport: {
    backgroundColor: '#6F1212',
    marginTop: -5,
    marginBottom:5,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  modalText: {
    marginTop: 10,
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalSubText: {
    fontSize: 14,
    color: 'gray',
    textAlign: 'center',
    marginTop:-10,
    marginBottom:15,
  },
});

export default AlterModal;
