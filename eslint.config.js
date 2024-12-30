const globals = require('globals');

module.exports = {
  files: ['**/*.{js,mjs,cjs,vue}'],
  languageOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    parser: require('vue-eslint-parser'),
    parserOptions: {
      parser: {
        js: 'espree',
        ts: '@typescript-eslint/parser',
        '<template>': 'espree'
      },
      ecmaVersion: 'latest',
      sourceType: 'module',
      vueFeatures: {
        filter: true,
        interpolationAsNonHTML: false,
      },
    }
  },
  plugins: {
    vue: require('eslint-plugin-vue')
  },
  rules: {
    'vue/multi-word-component-names': 'off',
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    ...require('eslint-plugin-vue').configs['vue3-essential'].rules,
    ...require('eslint-plugin-vue').configs['vue3-recommended'].rules
  }
}