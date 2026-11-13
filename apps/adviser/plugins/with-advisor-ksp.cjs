const {
  withSettingsGradle,
  withProjectBuildGradle,
  withGradleProperties,
} = require("@expo/config-plugins");
module.exports = (config) => {
  config = withSettingsGradle(config, (c) => {
    c.modResults.contents = c.modResults.contents.replace(
      /expoAutolinking\.useExpoVersionCatalog\(\)(?:\s*\{\s*version\("ksp", "[^"]+"\)\s*\})?/,
      'expoAutolinking.useExpoVersionCatalog() { version("ksp", "2.3.11") }',
    );
    return c;
  });
  config = withGradleProperties(config, (c) => {
    const key = "org.gradle.jvmargs";
    c.modResults = c.modResults.filter((p) => p.key !== key);
    c.modResults.push({
      type: "property",
      key,
      value: "-Xmx3072m -XX:MaxMetaspaceSize=1536m",
    });
    return c;
  });
  return withProjectBuildGradle(config, (c) => {
    // RN's unversioned buildscript dependency otherwise retains Kotlin 2.1 despite Expo's catalog override.
    c.modResults.contents = c.modResults.contents.replace(
      /classpath\(['"]org\.jetbrains\.kotlin:kotlin-gradle-plugin(?::[^'"]+)?['"]\)/,
      "classpath('org.jetbrains.kotlin:kotlin-gradle-plugin:2.3.21')",
    );
    return c;
  });
};
