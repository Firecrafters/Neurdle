const { FusesPlugin } = require("@electron-forge/plugin-fuses");
const { FuseV1Options, FuseVersion } = require("@electron/fuses");

module.exports = {
  packagerConfig: {
    asar: true,
    name: "Neurdle",
    productName: "Neurdle Desktop",
    description: "A Neuro-themed wordle game - Desktop Edition",
  },
  rebuildConfig: {},
  outDir: "dist",
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {
        name: "neurdle-desktop",
        authors: "Firecrafter28",
        description: "A Neuro-themed wordle game - Desktop Edition",
      },
    },
    {
      name: "@electron-forge/maker-zip",
      platforms: ["darwin"],
    },
    {
      name: "@electron-forge/maker-deb",
      config: {
        options: {
          name: "neurdle-desktop",
          productName: "Neurdle Desktop",
          description: "A Neuro-themed wordle game - Desktop Edition",
          maintainer: "Firecrafter28",
          homepage: "https://firecrafter28.github.io/Neurdle/",
        }
      },
    },
    {
      name: "@electron-forge/maker-rpm",
      config: {
        options: {
          name: "neurdle-desktop",
          productName: "Neurdle Desktop",
          description: "A Neuro-themed wordle game - Desktop Edition",
          maintainer: "Firecrafter28",
          homepage: "https://firecrafter28.github.io/Neurdle/",
        }
      },
    },
  ],
  plugins: [
    {
      name: "@electron-forge/plugin-auto-unpack-natives",
      config: {},
    },
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};
