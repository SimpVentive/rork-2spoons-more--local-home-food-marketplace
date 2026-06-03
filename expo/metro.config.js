const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { withRorkMetro } = require("@rork-ai/toolkit-sdk/metro");

const config = getDefaultConfig(__dirname);

// Redirect old devsupport/devmenu/elementinspector paths to the new
// inspector/ location. RN 0.79.1 moved these files, but the Rork
// toolkit SDK still references the old path. This runs as the
// fallback when withRorkMetro's own resolveRequest doesn't match.
config.resolver = {
  ...config.resolver,
  resolveRequest: (context, moduleName, platform) => {
    // Matches e.g. react-native/src/private/devsupport/devmenu/elementinspector/InspectorOverlay
    const oldPrefix = "react-native/src/private/devsupport/devmenu/elementinspector/";
    if (moduleName.startsWith(oldPrefix)) {
      const fileName = moduleName.slice(oldPrefix.length);
      const newPath = path.join(
        __dirname,
        "node_modules",
        "react-native",
        "src",
        "private",
        "inspector",
        fileName,
      );
      return { filePath: newPath, type: "sourceFile" };
    }

    return context.resolveRequest(context, moduleName, platform);
  },
};

module.exports = withRorkMetro(config);
