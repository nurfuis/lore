const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: "./src/main.js",
  // Put your normal webpack config below here
  module: {
    rules: require("./webpack.rules"),
  },
  devServer: {
    hot: false,
    inline: false,
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: "data/assets/lore-library-icon-ai-1.png",
          to: "data/assets",
        },
        {
          from: "config.json",
          to: "config.json",
        },
      ],
    }),
  ],
};
