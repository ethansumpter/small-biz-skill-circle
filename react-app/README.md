# Bond — mobile app

Bond matches small businesses on what they can offer and what they're looking for, so they can collaborate. This folder is the iOS/Android app, built with [Expo](https://expo.dev) (React Native).

Product, design and demo-data docs live in [`docs/`](docs/). Read those before building a feature.

## Requirements

- macOS, Linux or WSL
- Python 3.9+ (only used to create the virtual environment)
- The **Expo Go** app on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

You do **not** need Node.js, Xcode or Android Studio installed system-wide.

## The virtual environment

The app runs inside a local virtual environment in `.venv/`. It's a Python venv with its own copy of **Node.js 26.13.0** and npm, installed by [nodeenv](https://github.com/ekalinin/nodeenv). With the venv activated, every `node`, `npm` and `npx` command uses that pinned version, so everyone on the team builds with the same toolchain.

The app's packages are installed into `node_modules/` by the venv's npm, at the exact versions in `package-lock.json`.

`.venv/` and `node_modules/` are git-ignored. Each person creates their own.

## First-time setup

From the `react-app/` folder:

```sh
# 1. Create the venv and put Node 26.13.0 inside it
python3 -m venv .venv
.venv/bin/pip install nodeenv
.venv/bin/nodeenv -p --node=26.13.0

# 2. Activate it
source .venv/bin/activate

# 3. Check you're using the venv's Node (path should end in react-app/.venv/bin/node)
which node && node -v

# 4. Install the app's packages exactly as locked
npm ci
```

## Running the app

```sh
source .venv/bin/activate   # once per terminal window
npx expo start
```

Scan the QR code with your phone's camera (iOS) or the Expo Go app (Android). Your phone and computer must be on the same Wi-Fi. If that doesn't connect, use `npx expo start --tunnel`.

Run `deactivate` to leave the venv.

## Packages

Installed by `npm ci` from `package-lock.json`:

| Package | What it's for |
|---|---|
| `expo` | Expo SDK 58: the runtime, CLI and build tooling |
| `react`, `react-native` | UI framework (React 19.3, React Native 0.88) |
| `react-dom` | React for web. Keeps peer versions aligned with `react` |
| `expo-router` | File-based navigation; screens live in `src/app/` |
| `react-native-screens`, `react-native-safe-area-context` | Native screen containers and notch/home-indicator spacing, used by the router |
| `expo-linking`, `expo-constants` | Deep links (`bond://`) and app config, used by the router |
| `expo-status-bar` | Status bar styling |
| `expo-font`, `@expo-google-fonts/lexend` | Loads Lexend, the brand typeface |
| `@expo/vector-icons` | Icons (Ionicons) |
| `typescript`, `@types/react` | Type checking (dev only) |

### Adding a package

Always add packages with Expo's installer so the version matches the SDK, with the venv active:

```sh
npx expo install <package>
```

Commit the updated `package.json` and `package-lock.json`.

## Useful commands

All of these assume the venv is active.

| Command | Does |
|---|---|
| `npx expo start` | Start the dev server |
| `npx expo start --clear` | Start with a cleared bundler cache (use after changing config or packages) |
| `npx tsc --noEmit` | Type check |
| `npx expo-doctor` | Check dependencies and config for problems |
| `npx expo install --fix` | Fix packages that don't match the SDK |

## Troubleshooting

- **`which node` doesn't point into `.venv/`.** The venv isn't active in this terminal. Run `source .venv/bin/activate`.
- **`npm ci` fails with `ERESOLVE`.** A package's version doesn't match the others. Run `npx expo install --fix`, then `npm ci` again.
- **Port 8081 is already in use.** Another dev server is running. Stop it, or run `npx expo start --port 8082`.
- **Start the venv again from scratch.** Run `deactivate`, then `rm -rf .venv node_modules`, and repeat First-time setup.
