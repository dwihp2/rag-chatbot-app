const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Add custom resolver extensions
config.resolver.sourceExts.push("jsx", "js", "ts", "tsx", "json");

// Add transformer config
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

module.exports = withNativeWind(config, {
  input: "./global.css",
});