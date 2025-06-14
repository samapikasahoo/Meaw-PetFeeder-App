import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useState, useEffect, useContext } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, AlertTriangle, Wifi, WifiOff } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/services/api';

interface LevelObj {
  level: number;
}

export default function HomeScreen() {
  const [devID, setDevID] = useState<string | null>(null);
  const [levelLow, setLevelLow] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const checkConnection = async () => {
    try {
      const deviceID = await AsyncStorage.getItem("@devID");
      if (deviceID) {
        setDevID(deviceID);
        setIsConnected(true);
        
        // Check food level
        const response = await api.get(`/${deviceID}/getLevel`);
        const level: LevelObj[] = response.data;
        setLevelLow(!(level[0].level));
      } else {
        setIsConnected(false);
      }
    } catch (error) {
      console.error('Connection check failed:', error);
      setIsConnected(false);
    }
  };

  useEffect(() => {
    checkConnection();
    
    // Set up interval to check connection every 30 seconds
    const intervalId = setInterval(() => {
      checkConnection();
    }, 30000);

    return () => clearInterval(intervalId);
  }, []);

  const handleServeNow = async () => {
    if (!devID) {
      Alert.alert("Error", "No device connected");
      return;
    }

    setIsLoading(true);
    try {
      await api.post(`/${devID}/serveNow`);
      Alert.alert("Success", "Food served successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to serve food. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={['#f4b083', '#e8a06a']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Image 
            source={{ uri: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=400' }}
            style={styles.petImage}
          />
          <Text style={styles.welcomeText}>Welcome to</Text>
          <Text style={styles.appTitle}>Meaw Pet Feeder</Text>
          
          <View style={styles.connectionStatus}>
            {isConnected ? (
              <View style={styles.statusConnected}>
                <Wifi size={20} color="#4CAF50" />
                <Text style={styles.statusText}>Connected to {devID}</Text>
              </View>
            ) : (
              <View style={styles.statusDisconnected}>
                <WifiOff size={20} color="#f44336" />
                <Text style={styles.statusTextDisconnected}>Not Connected</Text>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {levelLow && (
          <View style={styles.alertCard}>
            <AlertTriangle size={24} color="#ff6b35" />
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>Low Food Level!</Text>
              <Text style={styles.alertText}>Please refill the food reservoir</Text>
            </View>
          </View>
        )}

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity 
            style={[styles.serveButton, !isConnected && styles.disabledButton]}
            onPress={handleServeNow}
            disabled={!isConnected || isLoading}
          >
            <LinearGradient
              colors={isConnected ? ['#c55a11', '#a04a0e'] : ['#ccc', '#999']}
              style={styles.serveButtonGradient}
            >
              <Play size={24} color="white" />
              <Text style={styles.serveButtonText}>
                {isLoading ? 'Serving...' : 'Serve Now'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>24</Text>
            <Text style={styles.statLabel}>Hours Active</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Meals Served</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>85%</Text>
            <Text style={styles.statLabel}>Food Level</Text>
          </View>
        </View>

        <View style={styles.recentActivity}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityItem}>
            <View style={styles.activityDot} />
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Food served</Text>
              <Text style={styles.activityTime}>2 hours ago</Text>
            </View>
          </View>
          <View style={styles.activityItem}>
            <View style={styles.activityDot} />
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Schedule updated</Text>
              <Text style={styles.activityTime}>5 hours ago</Text>
            </View>
          </View>
          <View style={styles.activityItem}>
            <View style={styles.activityDot} />
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Device connected</Text>
              <Text style={styles.activityTime}>1 day ago</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  petImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: 'white',
  },
  welcomeText: {
    fontSize: 16,
    color: '#333',
    opacity: 0.8,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  connectionStatus: {
    marginTop: 10,
  },
  statusConnected: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDisconnected: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    marginLeft: 8,
    color: '#4CAF50',
    fontWeight: '600',
    fontSize: 14,
  },
  statusTextDisconnected: {
    marginLeft: 8,
    color: '#f44336',
    fontWeight: '600',
    fontSize: 14,
  },
  content: {
    padding: 20,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3e0',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#ff6b35',
  },
  alertContent: {
    marginLeft: 12,
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff6b35',
  },
  alertText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  quickActions: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  serveButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  disabledButton: {
    opacity: 0.6,
  },
  serveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  serveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  statCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#c55a11',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  recentActivity: {
    backgroundColor: 'white',
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
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#c55a11',
    marginRight: 16,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  activityTime: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
});