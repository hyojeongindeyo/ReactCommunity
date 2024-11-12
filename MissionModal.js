import React from 'react';
import { Modal, View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const MissionModal = ({ modalVisible, setModalVisible, userMissions, handleImagePress, missionImages }) => {
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)} // 모달 닫기
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>평안이의 안전 가방</Text>
                    <Text style={styles.modalsubTitle}>클릭하여 안전물품 정보를 확인하세요</Text>
                    <TouchableOpacity
                        onPress={() => setModalVisible(false)} // 모달 닫기 버튼
                        style={styles.closeButton}
                    >
                        <Text style={styles.closeButtonText}>X</Text>
                    </TouchableOpacity>
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
                                            <Text style={styles.noImageText}>미션 아이디 {missionId}에 대한 이미지가 없습니다.</Text>
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
                                            <Text style={styles.noImageText}>미션 아이디 {missionId}에 대한 이미지가 없습니다.</Text>
                                        )}
                                    </View>
                                ))}
                            </View>
                            
                        </>
                    ) : (
                        <Text style={styles.noMissionsText}>획득한 미션이 없습니다.</Text>
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
        backgroundColor: 'rgba(0, 0, 0, 0.55)', // 배경 반투명
    },
    modalContent: {
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
    closeButton: {
        color: 'blue',
        position: 'absolute', // 절대 위치 설정
        top: 20, // 모달 상단에서 10px 떨어짐
        right: 20, // 오른쪽 끝에서 10px 떨어짐
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 10,
        marginTop : 40,
        
      },
    imageContainer: {
        flex: 1,
        justifyContent: 'center', // 이미지만 수직 중앙 정렬
        alignItems: 'center', // 이미지만 수평 중앙 정렬
      },
    image: {
        width: 50, // 기본 이미지 크기
        height: 50,
        resizeMode: 'contain', // 이미지를 컨테이너 내에 맞게 조정
    },
    modalTitle: {
        fontSize: 20,
        textAlign: 'center', // 가운데 정렬
        // flex: 1, // 남은 공간을 차지하도록 설정
        color:'#6F8B87',
        fontWeight: "bold"
    },
    modalsubTitle: {
        paddingTop: 12,
        textAlign: 'center',
        fontSize: 13,
        color:'#818080',
        fontWeight: "bold"

    },
    closeButtonText: {
        backgroundColor: 'white',
        fontSize: 20,
        fontWeight: '500'
    },
});

export default MissionModal; // 기본 내보내기 추가
