import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

function Community({ navigation }) {
  const [modalVisible, setModalVisible] = useState(false);
  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  const today = new Date();
  const todayIndex = today.getDay();
  const todayDate = today.getDate();

  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const datesOfWeek = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    return date.getDate();
  });

  const [selectedFilter, setSelectedFilter] = useState('전체');

  const filters = ['전체', 'HOT', '교통', '시위', '재해', '주의'];
  const infoFilters = ['전체', '자연', '사회', '생활'];

  const menuItems = [
    { id: '1', title: '내 근처 안전소식', navigateTo: 'NearbySafety', filter: null },
    { id: '2', title: '전체', navigateTo: 'NearbySafety', filter: '전체' },
    { id: '3', title: 'HOT', navigateTo: 'NearbySafety', filter: 'HOT' },
    { id: '4', title: '교통', navigateTo: 'NearbySafety', filter: '교통' },
    { id: '5', title: '시위', navigateTo: 'NearbySafety', filter: '시위' },
    { id: '6', title: '재해', navigateTo: 'NearbySafety', filter: '재해' },
    { id: '7', title: '주의', navigateTo: 'NearbySafety', filter: '주의' },
    { id: '8', title: '안전 정보', navigateTo: 'SafetyInfo', filter: null },
    { id: '9', title: '전체', navigateTo: 'SafetyInfo', filter: '전체' },
    { id: '10', title: '자연', navigateTo: 'SafetyInfo', filter: '자연' },
    { id: '11', title: '사회', navigateTo: 'SafetyInfo', filter: '사회' },
    { id: '12', title: '생활', navigateTo: 'SafetyInfo', filter: '생활' }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => setModalVisible(true)}>
          <MaterialIcons name="menu" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>커뮤니티</Text>
        <TouchableOpacity style={styles.iconButton}>
          <MaterialIcons name="search" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <View style={styles.calendarContainer}>
        <View style={styles.calendar}>
          {daysOfWeek.map((day, index) => (
            <View key={index} style={[styles.day, index === todayIndex && styles.today]}>
              <Text style={[styles.dayText, (day === 'SUN' || day === 'SAT') ? styles.weekendText : styles.weekdayText]}>{day}</Text>
              <Text style={styles.dateText}>{datesOfWeek[index]}</Text>
            </View>
          ))}
        </View>
      </View>
      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>내 근처 안전 소식 ></Text>
        <View style={styles.postContainer}>
          <View style={styles.postHeader}>
            <Text style={styles.hotText}>[HOT]</Text>
            <Text style={styles.postTitle}>2호선 강남역 근처에서 시위 때문에 교통정체가 심하니 다들 참고 하세요!!!</Text>
          </View>
          <Text style={styles.postTime}>2분 전</Text>
        </View>
        <View style={styles.horizontalLine} />
        <Text style={styles.sectionTitle}>안전 정보 ></Text>
        <View style={styles.infoFilterContainer}>
          {infoFilters.map((filter) => (
            <TouchableOpacity key={filter} onPress={() => setSelectedFilter(filter)}>
              <Text style={[styles.filterText, filter === selectedFilter && styles.selectedFilterText]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.paginationContainer}>
          <Text style={styles.pageNumber}>1</Text>
          <TouchableOpacity style={styles.writeButton} onPress={() => navigation.navigate('WritePost')}>
            <MaterialIcons name="add" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView contentContainerStyle={styles.menuItemsContainer}>
              {menuItems.map(item => (
                <TouchableOpacity 
                  key={item.id} 
                  onPress={() => { 
                    setModalVisible(false); 
                    if (item.filter === null) {
                      navigation.navigate(item.navigateTo);
                    } else {
                      navigation.navigate(item.navigateTo, { filter: item.filter });
                    }
                  }}
                >
                  <Text style={[styles.modalText, (item.title === '내 근처 안전소식' || item.title === '안전 정보') && styles.boldText]}>
                    {item.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: '10%',
    paddingBottom: '5%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: '5%',
    paddingVertical: '3%',
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  iconButton: {
    padding: 10,
  },
  calendarContainer: {
    marginTop: '5%',
    padding: '1%',
    backgroundColor: 'white',
    borderRadius: 20,
    marginHorizontal: '5%',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  calendar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  day: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  today: {
    backgroundColor: '#d3d3d3',
    borderRadius: 5,
    padding: 10,
  },
  dayText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  weekendText: {
    color: 'red',
  },
  weekdayText: {
    color: 'black',
  },
  dateText: {
    fontSize: 14,
    color: 'gray',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    width: '45%',
    height: '85%',
    alignItems: 'flex-start',
    marginTop: 60,
  },
  menuItemsContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  boldText: {
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: '5%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  horizontalLine: {
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    marginVertical: 10,
  },
  infoFilterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  filterText: {
    fontSize: 16,
    color: 'black',
  },
  selectedFilterText: {
    fontWeight: 'bold',
    color: 'blue',
  },
  postContainer: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hotText: {
    color: 'red',
    fontWeight: 'bold',
    marginRight: 5,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  postTime: {
    fontSize: 12,
    color: 'gray',
    textAlign: 'right',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  pageNumber: {
    fontSize: 16,
    marginRight: 10,
  },
  writeButton: {
    position: 'absolute',
    right: 0,
  },
});

export default Community;
