const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Exclude problematic packages that have incompatible dynamic imports
config.resolver.blockList = [
  /node_modules\/@ai-sdk\/react/,
  /node_modules\/@ai-sdk\/provider-utils/,
];

module.exports = config;
