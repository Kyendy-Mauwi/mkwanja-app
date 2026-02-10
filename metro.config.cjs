const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Bypassing the SQLite config plugin that was causing the crash
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Forced alias to the stable index file
config.resolver.alias = {
  'expo-sqlite': path.resolve(__dirname, 'node_modules/expo-sqlite/build/index.js'),
};

module.exports = config;