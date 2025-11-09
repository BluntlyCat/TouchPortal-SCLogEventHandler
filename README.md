# TouchPortal Star Citizen Log Event Handler

Read data from `Game.log` and display the helmet equip status and kill events.

Kudos to **@spdermn02** — this plugin uses parts of his Hardware Monitor plugin as a basis and for understanding how things work.

---

## Usage

Open the plugin settings and verify that the Star Citizen root folder matches your installation.  
After that, the plugin should be operational.

---

## Plugin Settings

The plugin can be controlled via several settings.  
The default values should work for most users.  
If you installed Star Citizen in a different location, or want to read logs from PTU/EPTU, adjust the settings here.

### Star Citizen Root Directory

The root folder of Star Citizen.  
By default:  
`C:\Program Files\Roberts Space Industries\StarCitizen`  
You can change this to any other location.

### Game Environment

Select which environment to read logs from. The default is **LIVE**.  
Supported options:

- `LIVE`
- `HOTFIX`
- `PTU`
- `EPTU`

When changed, the plugin will read the appropriate log file for the selected environment.

### Game Log File

The file where Star Citizen writes logs. Defaults to `Game.log` and normally should not be changed.  
This setting exists in case the filename changes in the future.

### Log File Read Interval

How often the log file is re-read (default: **500 ms**).  
Only the newly appended lines are processed each cycle.  
Increase this value if you need to reduce workload.

### Language

Language for certain strings in the kill message.  
Supported:

- English
- German

### Date Locale

Locale used to format dates/times in kill messages.  
Supported:

- `en-US`
- `de-DE`

### Timezone

Your timezone, used to show kill times correctly based on your location.  
Any valid IANA timezone is accepted (e.g., `Europe/Berlin`, `Asia/Tokyo`, …).

### Player Blacklist

A simple multi-line text field where player handles can be entered, **one per line**.

---

## States

The following states are available:

### `sc_helmet_state`

Indicates whether the helmet is worn.  
Values: `on` / `off` (default: `off`)

### `sc_kill_state`

Shows a compact text containing date/time, murderer name, and cause of death.  
If no kill has been detected, shows **“No kill detected.”**  

⚠️ If you get killed by “unknown” — that’s probably actually their handle.

### `sc_kill_state_full`

Contains the full kill-event line from `Game.log`.  
Tap the kill message to copy the line to the clipboard.  
If no kill has been detected, shows **“No kill detected.”**

### `sc_murderer_is_blacklisted`

Indicates whether the murderer is on the player blacklist.

### `sc_murderer_type`

One of:

- `player`: Another player
- `humanoid`: Any humanoid NPC
- `pet`: An animal NPC (e.g., Kopion)

### `sc_kill_count`

Number of entries stored in the kill-event history.

### `sc_player_dossier_url`

If the murderer is a player (see `sc_murderer_type`), this contains the URL to the murderer’s RSI dossier page.