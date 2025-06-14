import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, Trash2, Clock, RefreshCw } from 'lucide-react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/services/api';

interface TimeObj {
  hour: number;
  minute: number;
  ID: number;
}

export default function ScheduleScreen() {
  const [devID, setDevID] = useState<string | null>(null);
  const [timesList, setTimesList] = useState<TimeObj[]>([]);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadSchedule = async () => {
    try {
      const deviceID = await AsyncStorage.getItem("@devID");
      if (deviceID) {
        setDevID(deviceID);
        const response = await api.get(`/${deviceID}/getTimes`);
        const data: TimeObj[] = response.data;
        setTimesList(data.sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute)));
      }
    } catch (error) {
      console.error('Failed to load schedule:', error);
    }
  };

  useEffect(() => {
    loadSchedule();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSchedule();
    setRefreshing(false);
  };

  const handleAddTime = () => {
    setSelectedTime(new Date());
    setShowTimePicker(true);
  };

  const onTimeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || selectedTime;
    setShowTimePicker(Platform.OS === 'ios');
    setSelectedTime(currentDate);
  };

  const confirmAddTime = () => {
    const hour = selectedTime.getHours();
    const minute = selectedTime.getMinutes();
    
    Alert.alert(
      "Add Feeding Time",
      `Add feeding time at ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => setShowTimePicker(false),
        },
        {
          text: "Add",
          onPress: async () => {
            setIsLoading(true);
            try {
              await api.post(`/${devID}/addTime?hour=${hour}&minute=${minute}`);
              setShowTimePicker(false);
              await loadSchedule();
            } catch (error) {
              Alert.alert("Error", "Failed to add feeding time");
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleDeleteTime = (time: TimeObj) => {
    Alert.alert(
      "Delete Feeding Time",
      `Remove feeding time at ${time.hour.toString().padStart(2, '0')}:${time.minute.toString().padStart(2, '0')}?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            try {
              await api.post(`/${devID}/delete?id=${time.ID}`);
              await loadSchedule();
            } catch (error) {
              Alert.alert("Error", "Failed to delete feeding time");
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  if (!devID) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#f4b083', '#e8a06a']}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Schedule</Text>
        </LinearGradient>
        <View style={styles.emptyState}>
          <Clock size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>No Device Connected</Text>
          <Text style={styles.emptyText}>Connect your Meaw device to manage feeding schedules</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#f4b083', '#e8a06a']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Feeding Schedule</Text>
          <Text style={styles.headerSubtitle}>{timesList.length} feeding times set</Text>
        </View>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw size={20} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddTime}
          disabled={isLoading}
        >
          <LinearGradient
            colors={['#c55a11', '#a04a0e']}
            style={styles.addButtonGradient}
          >
            <Plus size={24} color="white" />
            <Text style={styles.addButtonText}>Add Feeding Time</Text>
          </LinearGradient>
        </TouchableOpacity>

        {timesList.length === 0 ? (
          <View style={styles.emptySchedule}>
            <Clock size={48} color="#ccc" />
            <Text style={styles.emptyTitle}>No Feeding Times Set</Text>
            <Text style={styles.emptyText}>Tap the button above to add your first feeding time</Text>
          </View>
        ) : (
          <View style={styles.scheduleList}>
            {timesList.map((time, index) => (
              <View key={time.ID} style={styles.timeCard}>
                <View style={styles.timeInfo}>
                  <Text style={styles.timeText}>
                    {time.hour.toString().padStart(2, '0')}:{time.minute.toString().padStart(2, '0')}
                  </Text>
                  <Text style={styles.timeLabel}>Daily feeding</Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteTime(time)}
                  disabled={isLoading}
                >
                  <Trash2 size={20} color="#ff6b6b" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {showTimePicker && (
          <View style={styles.timePickerContainer}>
            <View style={styles.timePickerHeader}>
              <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                <Text style={styles.cancelButton}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.timePickerTitle}>Select Time</Text>
              <TouchableOpacity onPress={confirmAddTime}>
                <Text style={styles.confirmButton}>Add</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={selectedTime}
              mode="time"
              is24Hour={true}
              display="spinner"
              onChange={onTimeChange}
              style={styles.timePicker}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#333',
    opacity: 0.7,
    marginTop: 4,
  },
  refreshButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  addButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptySchedule: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 24,
  },
  scheduleList: {
    gap: 12,
  },
  timeCard: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  timeInfo: {
    flex: 1,
  },
  timeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  timeLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  deleteButton: {
    padding: 8,
  },
  timePickerContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  timePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  timePickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cancelButton: {
    fontSize: 16,
    color: '#666',
  },
  confirmButton: {
    fontSize: 16,
    color: '#c55a11',
    fontWeight: 'bold',
  },
  timePicker: {
    backgroundColor: 'white',
  },
});