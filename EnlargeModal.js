// EnlargeModal.js
import React from 'react';
import { Modal, View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome } from '@expo/vector-icons';


const EnlargeModal = ({ enlargeModalVisible, setEnlargeModalVisible, selectedImage, handleCloseEnlargeModal, selectedName, selectedDescription }) => {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={enlargeModalVisible}
            onRequestClose={() => setEnlargeModalVisible(false)}
        >
            <View style={styles.enlargeModalContainer}>
                <View style={styles.enlargeModalContent}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={handleCloseEnlargeModal} style={styles.enlargebackButton}>
                            <MaterialIcons name="keyboard-arrow-left" size={30} color="black" />
                        </TouchableOpacity>

                        <Text style={styles.maintitle}>평안이의 가방 속</Text>
                        <TouchableOpacity onPress={() => setEnlargeModalVisible(false)} style={styles.enlargeCloseButton}>
                            <Text style={styles.closeButtonText}>X</Text>
                        </TouchableOpacity>


                    </View>

                    <View style={styles.imageContainer}>
                        {selectedImage && (
                            <>
                                <Text style={styles.enlargedtext}>{selectedName}</Text>
                                <Image source={selectedImage} style={styles.enlargedImage} />
                                <Text style={styles.enlargeddes}>{selectedDescription}</Text>
                            </>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
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
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.5,
        elevation: 5,
        height: 350,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between', // 버튼들을 양쪽 끝에 배치
        alignItems: 'center',    // 세로로 가운데 정렬
        // position: 'relative',    // 버튼을 화면에 위치시킬 수 있도록 설정
        // marginBottom: 20,        // 상단 여백을 주어 제목이 잘리지 않도록 설정
    },
    enlargeCloseButton: {
        padding: 10,
    },
    enlargebackButton: {
        padding: 10,
    },
    maintitle: {
        fontSize: 20,
        textAlign: 'center', // 가운데 정렬
        flex: 1, // 남은 공간을 차지하도록 설정
        color:'#6F8B87',
        fontWeight: "bold"
    },
    closeButtonText: {
        backgroundColor: 'white',
        fontSize: 20,
        fontWeight: '500'
    },
    backButtonText: {
        fontSize: 18,
    },
    imageContainer: {
        flex: 1,
        justifyContent: 'center', // 세로 중앙 정렬
        alignItems: 'center',      // 수평 중앙 정렬
    },
    
    enlargedImage: {
        width: 130, // 기본 이미지 크기
        height: 130,
        resizeMode: 'contain',
    },
    enlargedtext: {
        fontSize: 18,
        marginBottom: 20,
    },
    enlargeddes: {
        marginTop: 20,
    },
})


export default EnlargeModal; // 기본 내보내기 추가
