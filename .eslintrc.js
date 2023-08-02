module.exports = {
    env: {
        node: true,
        commonjs: true,
        es2021: true,
    },
    extends: ["eslint:recommended", "prettier"],
    parserOptions: {
        ecmaVersion: "latest",
    },
    plugins: ["prettier"],
    rules: {
        indent: ["off"],
        "prettier/prettier": ["error"],
    },
};
