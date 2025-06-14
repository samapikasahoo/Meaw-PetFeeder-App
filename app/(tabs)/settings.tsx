import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Bell, 
  Smartphone, 
  Info, 
  HelpCircle, 
  Shield, 
  Moon,
  Volume2,
  ChevronRight,
  User,
  Heart
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [deviceConnected, setDeviceConnected] = useState(false);

  useEffect(() => {
    loadSettings();
    checkDeviceConnection();
  }, []);

  const loadSettings = async () => {
    try {
      const notifications = await AsyncStorage.getItem('@notifications');
      const sound = await AsyncStorage.getItem('@sound');
      const darkMode = await AsyncStorage.getItem('@darkMode');
      
      if (notifications !== null) setNotificationsEnabled(JSON.parse(notifications));
      if (sound !== null) setSoundEnabled(JSON.parse(sound));
      if (darkMode !== null) setDarkModeEnabled(JSON.parse(darkMode));
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const checkDeviceConnection = async () => {
    try {
      const deviceID = await AsyncStorage.getItem("@devID");
      setDeviceConnected(!!deviceID);
    } catch (error) {
      console.error('Failed to check device connection:', error);
    }
  };

  const saveSetting = async (key: string, value: boolean) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save setting:', error);
    }
  };

  const handleNotificationToggle = (value: boolean) => {
    setNotificationsEnabled(value);
    saveSetting('@notifications', value);
  };

  const handleSoundToggle = (value: boolean) => {
    setSoundEnabled(value);
    saveSetting('@sound', value);
  };

  const handleDarkModeToggle = (value: boolean) => {
    setDarkModeEnabled(value);
    saveSetting('@darkMode', value);
    Alert.alert("Coming Soon", "Dark mode will be available in a future update!");
  };

  const showAbout = () => {
    Alert.alert(
      "About Meaw Pet Feeder",
      "Version 1.0.0\n\nA smart pet feeding solution that helps you take care of your furry friends even when you're away.\n\nDeveloped with ❤️ for pet lovers everywhere.",
      [{ text: "OK" }]
    );
  };

  const showHelp = () => {
    Alert.alert(
      "Help & Support",
      "Need help with your Meaw Pet Feeder?\n\n• Check device connection\n• Ensure device is powered on\n• Verify network connectivity\n• Contact support if issues persist",
      [{ text: "OK" }]
    );
  };

  const showPrivacy = () => {
    Alert.alert(
      "Privacy Policy",
      "Your privacy is important to us. We only collect data necessary for the app to function properly:\n\n• Device connection information\n• Feeding schedules\n• App usage statistics\n\nWe never share your personal data with third parties.",
      [{ text: "OK" }]
    );
  };

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    showToggle = false, 
    toggleValue = false, 
    onToggle 
  }: {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    showToggle?: boolean;
    toggleValue?: boolean;
    onToggle?: (value: boolean) => void;
  }) => (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={onPress}
      disabled={showToggle}
    >
      <View style={styles.settingLeft}>
        <View style={styles.settingIcon}>
          {icon}
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {showToggle ? (
        <Switch
          value={toggleValue}
          onValueChange={onToggle}
          trackColor={{ false: '#e0e0e0', true: '#c55a11' }}
          thumbColor={toggleValue ? '#fff' : '#f4f3f4'}
        />
      ) : (
        <ChevronRight size={20} color="#ccc" />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#f4b083', '#e8a06a']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>Customize your Meaw experience</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Device</Text>
          <View style={styles.settingsCard}>
            <SettingItem
              icon={<Smartphone size={24} color="#c55a11" />}
              title="Device Status"
              subtitle={deviceConnected ? "Connected" : "Not connected"}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.settingsCard}>
            <SettingItem
              icon={<Bell size={24} color="#c55a11" />}
              title="Push Notifications"
              subtitle="Get notified about feeding times and low food levels"
              showToggle={true}
              toggleValue={notificationsEnabled}
              onToggle={handleNotificationToggle}
            />
            <View style={styles.separator} />
            <SettingItem
              icon={<Volume2 size={24} color="#c55a11" />}
              title="Sound Alerts"
              subtitle="Play sounds for important notifications"
              showToggle={true}
              toggleValue={soundEnabled}
              onToggle={handleSoundToggle}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <View style={styles.settingsCard}>
            <SettingItem
              icon={<Moon size={24} color="#c55a11" />}
              title="Dark Mode"
              subtitle="Coming soon in future update"
              showToggle={true}
              toggleValue={darkModeEnabled}
              onToggle={handleDarkModeToggle}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.settingsCard}>
            <SettingItem
              icon={<HelpCircle size={24} color="#c55a11" />}
              title="Help & FAQ"
              subtitle="Get help with common issues"
              onPress={showHelp}
            />
            <View style={styles.separator} />
            <SettingItem
              icon={<Shield size={24} color="#c55a11" />}
              title="Privacy Policy"
              subtitle="Learn how we protect your data"
              onPress={showPrivacy}
            />
            <View style={styles.separator} />
            <SettingItem
              icon={<Info size={24} color="#c55a11" />}
              title="About"
              subtitle="App version and information"
              onPress={showAbout}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <Heart size={16} color="#c55a11" />
            <Text style={styles.footerText}>Made with love for pet owners</Text>
          </View>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    marginLeft: 4,
  },
  settingsCard: {
    backgroundColor: 'white',
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
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginLeft: 76,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  versionText: {
    fontSize: 12,
    color: '#999',
  },
});