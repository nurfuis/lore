const rules = require("./webpack.rules");
const CopyPlugin = require("copy-webpack-plugin");

rules.push({
  test: /\.css$/,
  use: [{ loader: "style-loader" }, { loader: "css-loader" }],
});

module.exports = {
  // Put your normal webpack config below here
  module: {
    rules,
  },
  devServer: {
    hot: false,
    inline: false,
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: "data/assets",
          to: "data/assets",
        },
      ],
    }),
  ],
};
