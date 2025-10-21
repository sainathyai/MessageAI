const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Keep web platform enabled for easier two-user testing during development
// Will disable before production deployment
// config.resolver.platforms = ['ios', 'android'];

module.exports = config;

