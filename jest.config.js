module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy"
  },
  transformIgnorePatterns: ["/node_modules/(?!@mui|@babel|@emotion|react|react-dom|next-auth)"],
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": ["babel-jest", { configFile: "./test-config/babel.config.js" }],
  },
};
