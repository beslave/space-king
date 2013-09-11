# coding: utf-8
from .game import Game
from .ship import Ship
from libs.websocket import WebSocketHandler
from logger import logging_on
from math import pi


@logging_on
class Player(WebSocketHandler):

    def __init__(self, *a, **k):
        self.enemy = None
        return super(Player, self).__init__(*a, **k)

    def __getattr__(self, attr):
        if hasattr(self, 'ship') and hasattr(self.ship, attr):
            return getattr(self.ship, attr)
        return super(Player, self).__getattr__(attr)

    def __setattr__(self, attr, value):
        if hasattr(self, 'ship') and hasattr(self.ship, attr):
            setattr(self.ship, attr, value)
        else:
            return super(Player, self).__setattr__(attr, value)

    def connectionMade(self):
        self.game = None
        if self.transport.__USERS__:
            self.enemy = self.transport.__USERS__.pop()
            self.enemy.enemy = self
            self.ship = Ship(0, -130, -pi / 2)
            self.game = Game(self, self.enemy)
            self.enemy.game = self.game
            self.game.play()
        else:
            self.ship = Ship(0, 130, pi / 2)
            self.transport.__USERS__.append(self)

    def connectionLost(self, reason):
        # print "Lost connection:", reason
        if self.game:
            self.game.stop()
            self.game = None
        if not self.enemy:
            self.transport.__USERS__.pop()
        else:
            self.enemy.enemy = None
            self.enemy.transport.loseConnection()

    def frameReceived(self, frame):
        parts = frame.split(" ")
        if len(parts) > 0:
            command_name = "__command_{}__".format(parts[0])
            parts = parts[1:]
            args = []
            kwargs = {}
            for x in parts:
                eqs = x.split("=")
                if len(eqs) == 1:
                    args.append(x)
                elif len(eqs) == 2:
                    kwargs[eqs[0]] = eqs[1]
                else:
                    kwargs[eqs[0]] = eqs[1:]
            if hasattr(self, command_name):
                try:
                    getattr(self, command_name)(*args, **kwargs)
                except TypeError:
                    pass

    def __command_forward__(self, state="on"):
        self.ship.is_forward = state != "off"

    def __command_backward__(self, state="on"):
        self.ship.is_backward = state != "off"

    def __command_left__(self, state="on"):
        self.ship.is_left = state != "off"

    def __command_right__(self, state="on"):
        self.ship.is_right = state != "off"
