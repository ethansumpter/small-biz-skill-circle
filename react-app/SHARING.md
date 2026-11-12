# Sharing the Bond demo with the team

How to let teammates try the app in **Expo Go** and edit the demo data in the **demo panel**, with nothing to install except Expo Go.

One person, the **host**, runs the app from their computer. Everyone else opens it on their phone. The demo panel saves to the data files on the host's computer, so everyone edits the same data.

- [For the host](#for-the-host)
- [For teammates](#for-teammates)
- [How saving works when several people edit](#how-saving-works-when-several-people-edit)
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

### What you can do there

- **Log in as:** pick any demo company from the dropdown, and the app acts as that company straight away. This only affects your phone and resets on reload.
- **What to edit:** switch between **Companies**, **Proposals**, **Chats** and **Plans**, then pick an item to edit its fields.
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

## Troubleshooting

| What you see | What to do |
|---|---|
| The QR code doesn't open anything | **iPhone:** use the Camera app. **Android:** scan from inside Expo Go. |
| An error that the project needs a different Expo SDK version | Update Expo Go from the app store. |
| The app loads forever or shows a network error | Check the host's terminal is still running. Over Wi-Fi without `--tunnel`, you must be on the same network as the host. |
| The demo panel says it **couldn't reach the dev server**, or shows **Apply…** | The host's dev server isn't reachable from your phone. Ask the host to restart with `npx expo start --tunnel`, then tap **Retry**. |
| "Someone else saved … after you opened the demo panel" | Tap **Reload**, check your changes, then save again. See [above](#how-saving-works-when-several-people-edit). |
| Your saved change doesn't show elsewhere in the app | Reload the app: shake the phone and tap **Reload**. |
