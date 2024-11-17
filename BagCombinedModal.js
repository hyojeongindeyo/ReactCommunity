import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const CombinedModal = ({ modalVisible, setModalVisible, userMissions, missionImages, userData }) => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedName, setSelectedName] = useState('');
    const [selectedDescription, setSelectedDescription] = useState('');
    const [isEnlargeModalVisible, setIsEnlargeModalVisible] = useState(false);


    const handleImagePress = (image, name, description) => {
        setSelectedImage(image);
        setSelectedName(name);
        setSelectedDescription(description);
        setIsEnlargeModalVisible(true);
    };

    const handlebeforeEnlargeModal = () => {
        setIsEnlargeModalVisible(false);

    };
    const handleCloseEnlargeModal = () => {
        setIsEnlargeModalVisible(false);  // 첫 번째 모달 닫기
        setModalVisible(false);  // 두 번째 모달 닫기
    };


    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    {isEnlargeModalVisible ? (
                        // EnlargeModal 내용
                        <View style={styles.enlargeModalContent}>
                            <View style={styles.header}>
                                <TouchableOpacity onPress={handlebeforeEnlargeModal} style={styles.enlargebackButton}>
                                    <MaterialIcons name="keyboard-arrow-left" size={30} color="black" />
                                </TouchableOpacity>

                                <Text style={styles.maintitle}>평안이의 가방 속</Text>
                                <TouchableOpacity onPress={handleCloseEnlargeModal} style={styles.enlargeCloseButton}>
                                    <Text style={styles.closeButtonText}>X</Text>
                                </TouchableOpacity>
                            </View>
                            {selectedImage && (
                                <>
                                    <View style={styles.enlargedContent}>
                                        <Image source={selectedImage} style={styles.enlargedImage} />
                                        <Text style={styles.enlargedText}>{selectedName}</Text>
                                        <Text style={styles.enlargedDescription}>{selectedDescription}</Text>
                                    </View>
                                </>
                            )}

                        </View>
                    ) : (
                        // Mission Modal 내용
                        <View style={styles.missionModalContent}>
                            <View style={styles.header}>
                                <TouchableOpacity
                                    style={[styles.enlargebackButton, { opacity: 0, pointerEvents: 'none' }]}>
                                    <MaterialIcons name="keyboard-arrow-left" size={30} color="black" />
                                </TouchableOpacity>


                                <Text style={styles.maintitle}>평안이의 안전 가방</Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.enlargeCloseButton}>
                                    <Text style={styles.closeButtonText}>X</Text>
                                </TouchableOpacity>
                            </View>

                            {userData && userData.role !== 'guest' ? (
                                <Text style={styles.modalsubTitle}>클릭하여 안전물품 정보를 확인하세요</Text>
                            ) : (
                                <Text style={styles.modalsubTitle}>로그인해서 평안이의 가방을 채워주세요</Text>
                            )}                            {/* <Text style={styles.modalTitle}>평안이의 안전 가방</Text> */}
                            {/* <Text style={styles.modalsubTitle}>클릭하여 안전물품 정보를 확인하세요</Text> */}
                            {/* <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                                <Text style={styles.closeButtonText}>X</Text>
                            </TouchableOpacity> */}
                            {userMissions.length > 0 ? (
                                <>
                                    <View style={styles.rowContainer}>
                                        {userMissions.slice(0, 3).map((missionId) => (
                                            <View key={missionId} style={styles.missionContainer}>
                                                {missionImages[missionId].image ? (
                                                    <TouchableOpacity onPress={() => handleImagePress(missionImages[missionId].image, missionImages[missionId].name, missionImages[missionId].description)}>
                                                        <Image source={missionImages[missionId].image} style={styles.image} />
                                                    </TouchableOpacity>
                                                ) : (
                                                    <Text style={styles.noImageText}>이미지 없음</Text>
                                                )}
                                            </View>
                                        ))}
                                    </View>
                                    <View style={styles.rowContainer}>
                                        {userMissions.slice(3, 6).map((missionId) => (
                                            <View key={missionId} style={styles.missionContainer}>
                                                {missionImages[missionId].image ? (
                                                    <TouchableOpacity onPress={() => handleImagePress(missionImages[missionId].image, missionImages[missionId].name, missionImages[missionId].description)}>
                                                        <Image source={missionImages[missionId].image} style={styles.image} />
                                                    </TouchableOpacity>
                                                ) : (
                                                    <Text style={styles.noImageText}>이미지 없음</Text>
                                                )}
                                            </View>
                                        ))}
                                    </View>
                                </>
                            ) : (
                                userData && userData.role === 'guest' ? (
                                   null
                                ) : (
                                    <Text style={styles.noMissionsText}>획득한 미션이 없습니다.</Text>
                                )
                            )}
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
    },
    modalContent: {
        width: 300,
        height: 320,
        // padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        borderColor: '#92B2AE',
        borderWidth: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.5,
        elevation: 5,
    },
    enlargedContent: {
        margin: 15,  // 전체적인 여백을 추가
        alignItems: 'center',  // 텍스트와 이미지를 가운데 정렬
    },
    // missionModalContent: {
    //     // flex: 1,
    //     justifyContent: 'center',
    //     alignItems: 'center',
    // },
    enlargeModalContent: {
        justifyContent: 'center',
        alignItems: 'center',
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
        color: '#6F8B87',
        fontWeight: "bold",
        flex: 1, // 남은 공간을 차지하도록 설정
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between', // 버튼들을 양쪽 끝에 배치
        alignItems: 'center',    // 세로로 가운데 정렬
        // marginBottom: 20, // 두 제목 간 간격을 맞추기 위해 추가
        marginTop: 20,
        marginLeft: 10,
        marginRight: 10,
    },
    modalTitle: {
        fontSize: 20,
        textAlign: 'center',
        color: '#6F8B87',
        fontWeight: "bold",
        flex: 1, // 남은 공간을 차지하도록 설정
    },
    modalsubTitle: {
        // paddingTop: 12,
        textAlign: 'center',
        fontSize: 13,
        color: '#818080',
        fontWeight: "bold"
    },
    closeButtonText: {
        fontSize: 20,
        fontWeight: '500'
    },
    missionContainer: {
        marginTop: '10%',
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    image: {
        width: 50,
        height: 50,
        resizeMode: 'contain',
    },
    enlargedImage: {
        width: 130,
        height: 130,
        resizeMode: 'contain',
    },
    enlargedText: {
        fontSize: 18,
        marginTop: 20,
    },
    noMissionsText: {
        textAlign: 'center',
        fontSize: 13,
        color: '#818080',
        marginTop: 10,
    },
    enlargedDescription: {
        marginTop: 5,
    }
});

export default CombinedModal;
