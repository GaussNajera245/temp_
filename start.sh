#!/bin/bash

echo 'hello Totemp_rfid'

cd /home/pi/.temp_rfid_anon
lxterminal -e "unclutter -idle 0" &
lxterminal -e "sudo ./sakis3g connect --console --interactive APN=CUSTOM_APN CUSTOM_APN='webgprs' APN_USER='0' APN_PASS='webgprs2019'" &

cd /home/pi/.temp_rfid_anon/release
lxterminal -e "pwd & sleep 5" &
lxterminal -e "./temp-rfid-anon-0.1.0-armv7l.AppImage"


# --disable-pinch --overscroll-history-navigation=0
#IMPORTANT: Be careful with the "." on .totemp_rfid

# When Installing or updating, give this file permissions on (Copy & paste on Terminal) with:
# chmod a+rx start.sh

# to autorun file on start 
# cd /etc/xdg/lxsession/LXDE-pi/
# sudo nano autostart
# @/home/pi/Documents/.totemp_rfid/temp_rfid_anon/start.sh
# CTRL O , ENTER
# CTRL X
