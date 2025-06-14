import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Wifi, WifiOff, Smartphone, Router } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/services/api';

export default function ConnectScreen() {
  const [devID, setDevID] = useState<string>('');
  const [currentDevID, setCurrentDevID] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    checkCurrentConnection();
  }, []);

  const checkCurrentConnection = async () => {
    try {
      const deviceID = await AsyncStorage.getItem("@devID");
      if (deviceID) {
        setCurrentDevID(deviceID);
        setIsConnected(true);
      } else {
        setIsConnected(false);
      }
    } catch (error) {
      console.error('Failed to check connection:', error);
    }
  };

  const handleConnect = async () => {
    if (!devID.trim()) {
      Alert.alert("Error", "Please enter a device ID");
      return;
    }

    setIsConnecting(true);
    try {
      const response = await api.get(`/${devID}/connect`);
      if (response.status === 200) {
        await AsyncStorage.setItem("@devID", devID);
        setCurrentDevID(devID);
        setIsConnected(true);
        Alert.alert("Success!", `Device ${devID} connected successfully!`);
        setDevID('');
      }
    } catch (error) {
      Alert.alert(
        "Connection Failed", 
        "Unable to connect to the device. Please check:\n• Device ID is correct\n• Device is powered on\n• Device is on the same network"
      );
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    Alert.alert(
      "Disconnect Device",
      "Are you sure you want to disconnect from this device?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Disconnect",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem("@devID");
              setCurrentDevID(null);
              setIsConnected(false);
              Alert.alert("Disconnected", "Device has been disconnected");
            } catch (error) {
              console.error('Failed to disconnect:', error);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#f4b083', '#e8a06a']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Device Connection</Text>
        <Text style={styles.headerSubtitle}>
          {isConnected ? 'Connected' : 'Connect your Meaw device'}
        </Text>
      </LinearGradient>

      <View style={styles.content}>
        {isConnected ? (
          <View style={styles.connectedSection}>
            <View style={styles.connectionCard}>
              <View style={styles.connectionHeader}>
                <Wifi size={32} color="#4CAF50" />
                <View style={styles.connectionInfo}>
                  <Text style={styles.connectionTitle}>Connected Device</Text>
                  <Text style={styles.deviceId}>ID: {currentDevID}</Text>
                </View>
              </View>
              
              <TouchableOpacity 
                style={styles.disconnectButton}
                onPress={handleDisconnect}
              >
                <Text style={styles.disconnectButtonText}>Disconnect</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.statusCard}>
              <Text style={styles.statusTitle}>Connection Status</Text>
              <View style={styles.statusItem}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Device Online</Text>
              </View>
              <View style={styles.statusItem}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>API Connected</Text>
              </View>
              <View style={styles.statusItem}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Ready to Feed</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.connectSection}>
            <Image 
              source={{ uri: 'https://images.pexels.com/photos/4587998/pexels-photo-4587998.jpeg?auto=compress&cs=tinysrgb&w=400' }}
              style={styles.instructionImage}
            />
            
            <View style={styles.instructionsCard}>
              <Text style={styles.instructionsTitle}>How to Connect</Text>
              
              <View style={styles.instructionStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <View style={styles.stepContent}>
                  <Smartphone size={20} color="#c55a11" />
                  <Text style={styles.stepText}>On your device menu, select "APP" option</Text>
                </View>
              </View>

              <View style={styles.instructionStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <View style={styles.stepContent}>
                  <Router size={20} color="#c55a11" />
                  <Text style={styles.stepText}>Enter the device ID shown on the display</Text>
                </View>
              </View>

              <View style={styles.instructionStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <View style={styles.stepContent}>
                  <Wifi size={20} color="#c55a11" />
                  <Text style={styles.stepText}>Tap "Connect" and wait for confirmation</Text>
                </View>
              </View>
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Device ID</Text>
              <TextInput
                style={styles.deviceInput}
                placeholder="Enter device ID (e.g., 1234)"
                value={devID}
                onChangeText={setDevID}
                autoCapitalize="none"
                autoCorrect={false}
              />
              
              <TouchableOpacity 
                style={[styles.connectButton, isConnecting && styles.connectingButton]}
                onPress={handleConnect}
                disabled={isConnecting}
              >
                <LinearGradient
                  colors={isConnecting ? ['#ccc', '#999'] : ['#c55a11', '#a04a0e']}
                  style={styles.connectButtonGradient}
                >
                  {isConnecting ? (
                    <WifiOff size={24} color="white" />
                  ) : (
                    <Wifi size={24} color="white" />
                  )}
                  <Text style={styles.connectButtonText}>
                    {isConnecting ? 'Connecting...' : 'Connect Device'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
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
  content: {
    flex: 1,
    padding: 20,
  },
  connectedSection: {
    gap: 20,
  },
  connectionCard: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  connectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  connectionInfo: {
    marginLeft: 16,
    flex: 1,
  },
  connectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  deviceId: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  disconnectButton: {
    backgroundColor: '#ff6b6b',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  disconnectButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 12,
  },
  statusText: {
    fontSize: 16,
    color: '#666',
  },
  connectSection: {
    gap: 24,
  },
  instructionImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
  },
  instructionsCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  instructionsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  instructionStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#c55a11',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  inputSection: {
    gap: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  deviceInput: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  connectButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  connectingButton: {
    opacity: 0.7,
  },
  connectButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  connectButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
});