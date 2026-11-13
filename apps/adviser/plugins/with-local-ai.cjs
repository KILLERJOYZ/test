const {
  withAppBuildGradle,
  withProjectBuildGradle,
  withGradleProperties,
  withMainApplication,
  withDangerousMod,
} = require("@expo/config-plugins");
const fs = require("node:fs");
const path = require("node:path");
module.exports = function (config) {
  config = withGradleProperties(config, (config) => {
    for (const [key, value] of [
      ["android.kotlinVersion", "2.2.10"],
      ["android.minSdkVersion", "26"],
    ]) {
      config.modResults = config.modResults.filter((p) => p.key !== key);
      config.modResults.push({ type: "property", key, value });
    }
    return config;
  });
  config = withProjectBuildGradle(config, (config) => {
    config.modResults.contents = config.modResults.contents.replace(
      "classpath('org.jetbrains.kotlin:kotlin-gradle-plugin')",
      "classpath('org.jetbrains.kotlin:kotlin-gradle-plugin:2.2.10')",
    );
    return config;
  });
  config = withAppBuildGradle(config, (config) => {
    config.modResults.contents = config.modResults.contents.replace(
      "minSdkVersion rootProject.ext.minSdkVersion",
      "minSdkVersion 26",
    );
    if (!config.modResults.contents.includes("com.google.mlkit:genai-prompt:"))
      config.modResults.contents +=
        '\n// Adviser local Gemini Nano runtime\ndependencies { implementation("com.google.mlkit:genai-prompt:1.0.0-beta4") }\n';
    return config;
  });
  config = withMainApplication(config, (config) => {
    if (!config.modResults.contents.includes("add(LocalAiPackage())")) {
      const anchor = "PackageList(this).packages.apply {";
      if (!config.modResults.contents.includes(anchor))
        throw Error("Cannot register local AI package in generated host");
      config.modResults.contents = config.modResults.contents.replace(
        anchor,
        anchor + "\n              add(LocalAiPackage())",
      );
    }
    return config;
  });
  return withDangerousMod(config, [
    "android",
    async (config) => {
      const dest = path.join(
        config.modRequest.platformProjectRoot,
        "app/src/main/java/vn/lua/adviser",
      );
      fs.mkdirSync(dest, { recursive: true });
      fs.copyFileSync(
        path.join(
          config.modRequest.projectRoot,
          "native/adviser/LocalAiModule.kt",
        ),
        path.join(dest, "LocalAiModule.kt"),
      );
      return config;
    },
  ]);
};
