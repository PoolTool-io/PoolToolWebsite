# pooltool3

## Project setup
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn serve
```

### Compiles and minifies for production
```
yarn build
```

### Lints and fixes files
```
yarn lint
```

### Build missing language files
```
export PATH="$HOME/.yarn/bin:$PATH"
yarn vue-i18n-extract report -v './src/**/*.?(vue|js)' -l './src/locales/*.json' -a
```
or just
```
yarn i18n:report
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
