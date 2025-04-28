# TouchPortal Star Citizen Log Event Handler

Read Data from Game.log and show equip status of helmet and kill events

Kudos to @spdermn02 as I used his Hardware Monitor plugin as basis and for understanding how things work!

## Usage

Go to plugin settings and set your Star Citizen root folder  
E.g. C:\Program Files\Roberts Space Industries\StarCitizen

After that the plugin should be operational.

## States

currently two states are supported:

### sc_leh_helmet_state

Can be used to indicate whether the helmet is worn or not

on/off; default = off

### sc_leh_kill_state

Shows a text with date, name of murderer and cause of death  
In case no kill happened, the message 'Not yet killed by anyone' is shown