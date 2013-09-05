# coding: utf-8
from libs import div
from libs.websocket import WebSocketHandler
from logger import logging_on
from .game import Game

import json
import random
import math

@logging_on
class Player(WebSocketHandler):

    @staticmethod
    def new_ship(x=0, y=0, angle=0):
        return dict(
            type="ship",
            m=0,
            x=x,
            y=y,
            angle=angle,
            rotation=0,  # math.pi / 2 - angle,
            radius=64,
            color=random.choice(["#C95", "#777", "#669"]),
            light_color=random.choice(["#F00", "#0F0", "#00F", "#FF0", "#F0F", "#0FF"]),
            turbine_color=random.choice(["#555", "#446", "#644", "#464"]),
            is_forward = False,
            is_backward = False,
            is_left = False,
            is_right = False,
        )

    def __init__(self, *a, **k):
        self.enemy = None
        self.speed_x = 0
        self.speed_y = 0
        self.angle_speed = math.pi * 0.9
        self.acceleration_forward = 500
        self.acceleration_backward = 400
        self.max_speed = 250
        self.m = 1
        return super(Player, self).__init__(*a, **k)

    def __getattr__(self, attr):
        if 'ship' in self.__dict__ and attr in self.__dict__['ship']:
            return self.__dict__['ship'][attr]
        raise AttributeError

    def __setattr__(self, attr, value):
        if 'ship' in self.__dict__ and attr in self.__dict__['ship']:
            self.__dict__['ship'][attr] = value
        else:
            return super(Player, self).__setattr__(attr, value)

    def connectionMade(self):
        self.game = None
        if self.transport.__USERS__:
            self.enemy = self.transport.__USERS__.pop()
            self.enemy.enemy = self
            self.ship = self.new_ship(0, -130, - math.pi / 2)
            self.game = Game(self, self.enemy)
        else:
            self.ship = self.new_ship(0, 130, math.pi / 2)
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
        self.ship['is_forward'] = state != "off"

    def __command_backward__(self, state="on"):
        self.ship['is_backward'] = state != "off"

    def __command_left__(self, state="on"):
        self.ship['is_left'] = state != "off"

    def __command_right__(self, state="on"):
        self.ship['is_right'] = state != "off"

    @property
    def speed(self):
        return (self.vx ** 2 + self.vy ** 2) ** 0.5

    @speed.setter
    def speed(self, value):
        self.vx = value * math.cos(self.q)
        self.vy = value * math.sin(self.q)
        print value, self.speed

    @property
    def vx(self):
        return self.speed_x

    @vx.setter
    def vx(self, v):
        self.speed_x = v

    @property
    def vy(self):
        return -self.speed_y

    @vy.setter
    def vy(self, v):
        self.speed_y = -v

    @property
    def q(self):
        _q = math.atan(div(abs(self.vy), abs(self.vx)))
        if self.vy >= 0:
            return _q if self.vx >= 0 else _q + math.pi / 2
        else:
            return _q - math.pi / 2 if self.vx >= 0 else _q + math.pi
