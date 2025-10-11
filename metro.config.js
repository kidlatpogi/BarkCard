const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Exclude the functions folder from bundling
config.resolver.blockList = [
  /functions\/.*/,
  ...(config.resolver.blockList || []),
];

module.exports = config;