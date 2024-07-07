import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function DeleteAccountModal({ visible, onClose, onDelete }) {
  const [selectedButton, setSelectedButton] = useState('yes');

  const handleButtonPress = (buttonType) => {
    setSelectedButton(buttonType);
    if (buttonType === 'yes') {
      onDelete();
    } else {
      onClose();
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>탈퇴하시겠습니까?</Text>
          <Text style={styles.modalMessage}>탈퇴하시면 복구하실 수 없습니다.</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, selectedButton === 'yes' ? styles.selectedButton : styles.unselectedButton]}
              onPress={() => handleButtonPress('yes')}
            >
              <Text style={[styles.buttonText, selectedButton === 'yes' ? styles.selectedButtonText : styles.unselectedButtonText]}>네</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, selectedButton === 'no' ? styles.selectedButton : styles.unselectedButton]}
              onPress={() => handleButtonPress('no')}
            >
              <Text style={[styles.buttonText, selectedButton === 'no' ? styles.selectedButtonText : styles.unselectedButtonText]}>아니오</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
    color: '#6F1212',
  },
  modalMessage: {
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#C5C5C5',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  button: {
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    marginHorizontal: 10, // 여백을 줄임
    minWidth: 60,
    width: 100, // 버튼의 가로 크기를 고정
  },
  selectedButton: {
    backgroundColor: '#6F1212',
  },
  unselectedButton: {
    borderColor: '#6F1212',
    borderWidth: 1,
  },
  buttonText: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  selectedButtonText: {
    color: '#fff',
  },
  unselectedButtonText: {
    color: '#6F1212',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
});