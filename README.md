# TouchPortal Star Citizen Log Event Handler

Read Data from Game.log and show equip status of helmet and kill events

Kudos to @spdermn02 as I used his Hardware Monitor plugin as basis and for understanding how things work!

## Usage

Go to plugin settings and check if the root folder fits to yours.  
After that the plugin should be operational.

## Plugin Settings

The plugin can be controlled by several settings.  
The default values should work just fine for the majority.  
However, in case you installed Star Citizen at a different location  
or want to use it also on PTU you can adjust it here. 

### Star Citizen Root Directory

The root folder of Star Citizen.  
By default, this is located at C:\Program Files\Roberts Space Industries\StarCitizen  
but can be changed to any other location here.

### Star Citizen Environment

You can change the environment which is used here. The default environment is *LIVE*.  
Currently supported options are:

- LIVE
- HOTFIX
- PTU
- EPTU

If you change this value to any of them, the appropriate log file of the selected environment will be read.

### Star Citizen Game Log File

This is the file where Star Citizen logs are written. It defaults to Game.log and should not be changed!  
Why does this setting then exist? Just in case the file name changes in the future.

### Star Citizen Read Interval

This value controls the frequency the game log file is re-read and defaults to 500ms.  
This should work just fine as the plugin will not read the whole file every 500ms but the changed lines.  
However, in case you need to reduce the workload, you can increase the value here.

## States

currently two states are supported:

### sc_leh_helmet_state

Can be used to indicate whether the helmet is worn or not

on/off; default = off

### sc_leh_kill_state

Shows a text with date, name of murderer and cause of death  
In case no kill happened, the message 'No kill detected' is shown

### sc_leh_kill_state_full

Contains the full line of the kill event from Game.log  
In case no kill happened, the line can be copied to clipboard by tipping on the kill message