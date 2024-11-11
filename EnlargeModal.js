// EnlargeModal.js
import React from 'react';
import { Modal, View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';

const EnlargeModal = ({ enlargeModalVisible, setEnlargeModalVisible, selectedImage, handleCloseEnlargeModal }) => {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={enlargeModalVisible}
            onRequestClose={() => setEnlargeModalVisible(false)}
        >
            <View style={styles.enlargeModalContainer}>
                <View style={styles.enlargeModalContent}>
                    <TouchableOpacity onPress={() => setEnlargeModalVisible(false)} style={styles.enlargeCloseButton}>
                        <Text style={styles.closeButtonText}>닫기</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleCloseEnlargeModal} style={styles.enlargebackButton}>
                        <Text style={styles.backButtonText}>뒤로 가기</Text>
                    </TouchableOpacity>
                    <View style={styles.imageContainer}>
                        {selectedImage && (
                            <Image source={selectedImage} style={styles.enlargedImage} />
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
};


const styles = StyleSheet.create({
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 10,
    },
    missionContainer: {
        width: 60,
        height: 60,
    },
    enlargeModalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.55)', // 배경 반투명

    },
    enlargeModalContent: {
        width: 300,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
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
        height: 300,
    },
    enlargedImage: {
        width: 100, // 기본 이미지 크기
        height: 100,
        resizeMode: 'contain', // 이미지를 컨테이너 내에 맞게 조정
    },
    enlargeCloseButton: {
        position: 'absolute',
        top: 20,
        right: 20
    },
    closeButtonText: {
        backgroundColor: 'white',
        fontSize: 18
    },
    imageContainer: {
        flex: 1,
        justifyContent: 'center', // 이미지만 수직 중앙 정렬
        alignItems: 'center', // 이미지만 수평 중앙 정렬
    },
    enlargedImage: {
        width: 100, // 기본 이미지 크기
        height: 100,
        resizeMode: 'contain', // 이미지를 컨테이너 내에 맞게 조정
    },
})


export default EnlargeModal; // 기본 내보내기 추가
