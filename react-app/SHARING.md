# Sharing the Bond demo with the team

How to let teammates try the app in **Expo Go** and edit the demo data in the **demo panel**, with nothing to install except Expo Go.

One person, the **host**, runs the app from their computer. Everyone else opens it on their phone. The demo panel saves to the data files on the host's computer, so everyone edits the same data.

- [For the host](#for-the-host)
- [For teammates](#for-teammates)
- [How saving works when several people edit](#how-saving-works-when-several-people-edit)
- [Opening the published version (no host needed)](#opening-the-published-version-no-host-needed)
- [Troubleshooting](#troubleshooting)

---

## For the host

### Before the session

1. Do the [first-time setup](README.md#first-time-setup) if you haven't already.
2. Pull the latest code so everyone starts from the current demo data:

   ```sh
   git pull
   ```

3. Check `git status` is clean in `src/data/`. Anything uncommitted there is what the team will see and edit.

### Start the app

From `react-app/`:

```sh
source .venv/bin/activate
npx expo start --tunnel
```

- `--tunnel` lets teammates join from any network. The first time, the Expo CLI offers to install `@expo/ngrok`; say yes.
- If everyone is on the same Wi-Fi as you, plain `npx expo start` loads faster.

Share the **QR code** from the terminal: a screenshot in the team chat is fine. Or copy the `exp://` link printed above it.

### While people are using it

- **Keep the terminal open and your computer awake.** If the dev server stops, the app stops loading for everyone and demo panel saves fail.
- Each **Save** in the demo panel writes to `src/data/companies.json`, `src/data/leads.json` or `src/data/plans.json` on your computer, straight away.
- Watch the files change with `git diff src/data/`.

### After the session

Keep the changes:

```sh
git add src/data/
git commit -m "Update demo data from team session"
git push
```

Or throw them all away:

```sh
git checkout -- src/data/
```

Don't leave edits uncommitted for long. The next `git pull` may clash with them.

---

## For teammates

### Open the app

1. Install **Expo Go** from the [App Store](https://apps.apple.com/app/expo-go/id982107779) or [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent). If you already have it, update it. The app needs the latest version (Expo SDK 58).
2. Scan the QR code the host shares:
   - **iPhone:** use the Camera app.
   - **Android:** open Expo Go and tap **Scan QR code**.
3. The first load can take a minute, especially over a tunnel.

It's a demo: every company, chat and review is fictional. Likes, matches and messages you send in the app stay on your phone and reset when the app reloads.

### Open the demo panel

**Profile** tab → **⚙️** (top right) → **Demo panel**.

The demo panel is an admin tool for running the demo. It isn't part of Bond itself.

The bar at the top shows the **build mode**:
- **Build mode: development** means you're on the host's dev server, and saves go to the shared files (`saves to src/data/`).
- **Build mode: production** means the hosted site or a published update. There's no dev server, so changes only last until the app reloads.

### What you can do there

- **Log in as:** pick any demo company from the dropdown, and the app acts as that company straight away. This only affects your phone and resets on reload.
- **What to edit:** switch between **Companies**, **Proposals**, **Chats** and **Plans**, then pick an item to edit its fields.
  - **Plans:** type a name under **Add a plan** to create one. It starts as a £0 monthly subscription and shows on **Profile → Get more** once saved. Free, Boost and Bond Plus can be edited but not deleted; plans you add can be.
  - A dot marks each field you've changed.
  - **Discard** undoes your changes to one item, and **Discard all** undoes everything.

### Saving

1. Tap **Save…**. A list of every change appears, showing the old value crossed out above the new one.
2. Check it, then tap **Confirm and save**. Or tap **Keep editing** to go back.

Saving changes the **shared** demo data for everyone. Other people see your changes after their app reloads, so only save on purpose.

If the bar says **Apply…** instead of **Save…**, the panel can't reach the host's computer. Your changes will only apply on your phone until the app reloads. See [Troubleshooting](#troubleshooting).

---

## How saving works when several people edit

Everyone saves to the same files, so the panel checks that nobody else saved since you opened it:

- If someone else saved first, your save is **refused, and nothing is lost**. The panel says so and shows a **Reload** button.
- **Reload** loads their changes and keeps your edits on top. Check the change list and save again.
- If you both edited **the same item**, your version of that item wins when you save again. The change list shows exactly what you'd overwrite, so look before you confirm.

To keep it simple, split the work: one person per company, or per tab.

---

## Opening the published version (no host needed)

Every push to `main` publishes the app with the **Publish Bond demo** GitHub Action. To open that version in Expo Go without anyone running a dev server:

1. On GitHub, open **Actions → Publish Bond demo**, then the latest successful run.
2. On the run's summary page, under **Open in Expo Go**, scan the QR code. On iPhone use the Camera app; on Android, scan from inside Expo Go. Or open the `exp://` link shown there on your phone.

Each run has its own QR code, so use the newest run to get the latest version.

**You must be signed in to Expo Go** (Profile tab → Sign in) with an Expo account that's a member of the **ethansumpters-team** organisation. Since May 2026 Expo Go only opens published updates for projects your account owns or belongs to; anyone else gets `Failed to download remote update`. The host adds teammates on expo.dev → ethansumpters-team → Members. (A dev server link from `npx expo start` doesn't need this.)

This is a **production** build: the demo panel shows **Build mode: production**, and edits only last until the app reloads. To change the shared demo data, use a host's dev server as described above.

---

## Troubleshooting

| What you see | What to do |
|---|---|
| The QR code doesn't open anything | **iPhone:** use the Camera app. **Android:** scan from inside Expo Go. |
| An error that the project needs a different Expo SDK version | Update Expo Go from the app store. |
| `Failed to download remote update` on the published QR code | 1. Sign in to Expo Go with an account in the **ethansumpters-team** organisation ([see above](#opening-the-published-version-no-host-needed)). 2. Use a QR code from a run after the "Fix Android bug" commit: Android Expo Go only loads updates under its SDK runtime (`exposdk:58.0.0`), so keep `"runtimeVersion": { "policy": "sdkVersion" }` in `app.json`. Older runs used runtime `1.0.0` and won't open on Android. |
| The app loads forever or shows a network error | Check the host's terminal is still running. Over Wi-Fi without `--tunnel`, you must be on the same network as the host. |
| The demo panel says it **couldn't reach the dev server**, or shows **Apply…** | The host's dev server isn't reachable from your phone. Ask the host to restart with `npx expo start --tunnel`, then tap **Retry**. |
| "Someone else saved … after you opened the demo panel" | Tap **Reload**, check your changes, then save again. See [above](#how-saving-works-when-several-people-edit). |
| Your saved change doesn't show elsewhere in the app | Reload the app: shake the phone and tap **Reload**. |
