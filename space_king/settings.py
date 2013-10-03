# coding: utf-8
DEBUG = True
SITE_PORT = 7001
SOCKETSERVER_PORTS = [7002]

VERSION = '0.0.1'

SPACE_RADIUS = 1000
PIXELS_ACCURACY = 1

PLAYER_WAITING_TIME = 30
PLAYER_START_RADIUS = 150

JS = dict(
    MESSAGE_SHOWING_TIME=5 * 1000,

    CONNECTION_LOST='"Connection is lost. The game has been interrupted."',
    NOT_ALL_DATA_LOADED='"Wait! Not all data are loaded!"',
    YOU_LOSE='"You lose!"',
    YOU_WIN='"You win!"',
    WAIT_PLAYER='"Waiting for second player"',

    FRAME_DELAY=50,
    FLIPPING='true',

    LARGE_FONT='"30px Calibri"',
    BASE_FONT='"24px Calibri"',
    SMALL_FONT='"20px Arial"',
    BASE_PADDING=5,

    BASE_COLOR='"#FC0"',
    TXT_COLOR='"#FFF"',
    INFO_COLOR='"#FF0"',
    JOY_COLOR='"#0F0"',
    WAR_COLOR='"#F00"',

    BASE_ALPHA=0.85,
    PREVIEW_ALPHA=0.8,
)

from local_settings import *
