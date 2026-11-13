const {
  withAndroidManifest,
  withDangerousMod,
} = require("@expo/config-plugins");
const fs = require("node:fs");
const path = require("node:path");
module.exports = function (config) {
  config = withAndroidManifest(config, (config) => {
    const application = config.modResults.manifest.application[0].$;
    application["android:networkSecurityConfig"] =
      "@xml/adviser_network_security";
    application["android:usesCleartextTraffic"] = "false";
    application["android:allowBackup"] = "false";
    return config;
  });
  return withDangerousMod(config, [
    "android",
    async (config) => {
      const dir = path.join(
        config.modRequest.platformProjectRoot,
        "app",
        "src",
        "main",
        "res",
        "xml",
      );
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(
        path.join(dir, "adviser_network_security.xml"),
        '<?xml version="1.0" encoding="utf-8"?>\n<network-security-config>\n<base-config cleartextTrafficPermitted="false" />\n<domain-config cleartextTrafficPermitted="true"><domain includeSubdomains="false">localhost</domain><domain includeSubdomains="false">127.0.0.1</domain><domain includeSubdomains="false">10.0.2.2</domain></domain-config>\n</network-security-config>\n',
      );
      return config;
    },
  ]);
};
