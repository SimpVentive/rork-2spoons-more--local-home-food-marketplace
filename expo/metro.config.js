const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { withRorkMetro } = require("@rork-ai/toolkit-sdk/metro");

const config = getDefaultConfig(__dirname);

// The toolkit SDK (v0.2.54) requires inspector modules from the old
// RN path, but RN 0.79.1 moved them from devsupport/devmenu/elementinspector
// to src/private/inspector. Alias them so Metro resolves correctly.
const inspectorSrc = path.resolve(
  __dirname,
  "node_modules/react-native/src/private/inspector",
);

const originalResolveRequest = config.resolver?.resolveRequest;
config.resolver = {
  ...config.resolver,
  resolveRequest: (context, moduleName, platform) => {
    const prefix = "react-native/src/private/devsupport/devmenu/elementinspector/";
    if (moduleName.startsWith(prefix)) {
      const file = moduleName.slice(prefix.length);
      return {
        filePath: path.join(inspectorSrc, `${file}.js`),
        type: "sourceFile",
      };
    }

    if (originalResolveRequest) {
      return originalResolveRequest(context, moduleName, platform);
    }
    return context.resolveRequest(context, moduleName, platform);
  },
};

module.exports = withRorkMetro(config);
