const rules = require("./webpack.rules");
const CopyPlugin = require("copy-webpack-plugin");


module.exports = {
  // Put your normal webpack config below here
  module: {
    rules,
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: "assets/sprites",
          to: "assets/sprites",
        },
      ],
    }),
  ],
};
