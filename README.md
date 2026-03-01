# pooltool3

## Project setup
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn serve
```
Runs the Vue dev server (default port **8080**). Uses `.env.local` so API and WebSocket point to `http://localhost:3004` and `ws://localhost:3004/ws` when the API runs on the same machine. Open the app (e.g. http://localhost:8080) and check the browser console for `[PoolTool WS] URL:` and `[PoolTool WS] Connected` to confirm the WebSocket is connecting.

**Current setup on this server:** Port 8080 is served by **`python3 serve_spa.py 8080`** from `PoolToolWebsite`, which serves the **`dist/`** folder (built app), not the Vue dev server. So you must run **`yarn build`** after any code or env changes; the running app is whatever was last built. For this setup, build **without** setting `VUE_APP_API_URL` / `VUE_APP_WS_URL` in `.env.local` (or set them to the server’s host, e.g. `http://34.209.51.89:3004`), so the app uses the same host as the page for API/WebSocket. After rebuilding, restart: `python3 serve_spa.py 8080` (or your usual start command).

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
