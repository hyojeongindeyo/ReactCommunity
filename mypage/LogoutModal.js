import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons from expo

export default function LogoutModal({ visible, onClose, onLogout }) {
  const [selectedButton, setSelectedButton] = useState('yes');

  const handleButtonPress = (buttonType) => {
    setSelectedButton(buttonType);
    if (buttonType === 'yes') {
      onLogout();
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
          <Text style={styles.modalText}>로그아웃을 하시겠습니까?</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.button,
                selectedButton === 'yes' ? styles.selectedButton : styles.unselectedButton,
              ]}
              onPress={() => handleButtonPress('yes')}
            >
              <Text
                style={[
                  styles.buttonText,
                  selectedButton === 'yes' ? styles.selectedButtonText : styles.unselectedButtonText,
                ]}
              >
                네
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                selectedButton === 'no' ? styles.selectedButton : styles.unselectedButton,
              ]}
              onPress={() => handleButtonPress('no')}
            >
              <Text
                style={[
                  styles.buttonText,
                  selectedButton === 'no' ? styles.selectedButtonText : styles.unselectedButtonText,
                ]}
              >
                아니오
              </Text>
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
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: 'bold',
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
    backgroundColor: '#F3F3F3',
  },
  unselectedButton: {
    borderColor: '#F3F3F3',
    borderWidth: 1,
    borderWeight:"bold",
  },
  buttonText: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  selectedButtonText: {
    color: '#000',
  },
  unselectedButtonText: {
    color: '#000',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
});