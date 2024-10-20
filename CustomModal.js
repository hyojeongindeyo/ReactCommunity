import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const CustomModal = ({ visible, onClose, onConfirm }) => {
    return (
        <Modal
            transparent={true}
            animationType="slide"
            visible={visible}
            onRequestClose={onClose}
            style={styles.Modalstyle}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <Text style={styles.title}>
                        평안이의 가방에{'\n'}안전 물품이 채워졌어요!
                    </Text>
                    <Text style={styles.message}>평안이의 가방을 확인하러 가기</Text>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.noButton} onPress={onClose}>
                            <Text style={styles.buttonText}>아니오</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.yesButton} onPress={onConfirm}>
                            <Text style={styles.buttonText}>네</Text>
                        </TouchableOpacity>
                    </View>
                </View>
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
    modalContainer: {
        width: '80%',
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
        alignItems: 'center',
        borderColor: '#92B2AE',
        borderWidth: 2,
        // 그림자 스타일
        shadowColor: '#000', // 그림자 색상
        shadowOffset: {
            width: 0,
            height: 2, // 아래쪽으로 그림자 이동
        },
        shadowOpacity: 0.25, // 그림자 투명도
        shadowRadius: 3.5, // 그림자 퍼짐 정도
        elevation: 5, // 안드로이드에서 그림자 효과를 주기 위해 사용
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#6F8B87',

    },
    message: {
        marginVertical: 20,
        textAlign: 'center',
    },
    buttonContainer: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'center'
    },
    noButton: {
        borderBlockColor: 'black',
        width: '25%',
        padding: 10,
        borderRadius: 5,
        marginRight: 10,
        alignItems: 'center',
        borderWidth: 0.4, // 테두리 두께
        borderColor: 'gray', // 테두리 색상

    },
    yesButton: {
        backgroundColor: '#AAC5C2',
        width: '25%',
        padding: 10,
        borderRadius: 5,
        marginLeft: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: 'black',
        fontSize: 16,
        fontWeight: '500', // 중간 두께
    },
});

export default CustomModal;
