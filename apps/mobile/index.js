import { AppRegistry, Platform } from 'react-native';

// Ensure process.env.EXPO_OS is defined for Expo modules in bare React Native
if (typeof process !== 'undefined') {
  process.env = process.env || {};
  if (!process.env.EXPO_OS) {
    process.env.EXPO_OS = Platform.OS;
  }
}

import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
