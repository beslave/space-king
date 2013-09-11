# coding: utf-8
from libs import angle
from logger import logging_on
from math import cos, pi, sin

import random


@logging_on
class Ship(object):

    def __init__(self, x=0, y=0, angle=0):
        self.weight = 1
        self.x = x
        self.y = y
        self.angle = angle
        self.rotation = pi / 2 - angle
        self.radius = 48
        self.color = random.choice(["#C95", "#777", "#669"])
        self.light_color = random.choice(["#F00", "#0F0", "#00F", "#FF0", "#F0F", "#0FF"])
        self.turbine_color = random.choice(["#555", "#446", "#644", "#464"])
        self.is_forward = False
        self.is_backward = False
        self.is_left = False
        self.is_right = False

        self.win = False
        self.lose = False

        self.speed_x = 0
        self.speed_y = 0
        self.angle_speed = pi * 0.9
        self.acceleration_forward = 300
        self.acceleration_backward = 250
        self.max_speed = 400
        self.weight = 1

    def to_dict(self):
        return dict(
            m=int(self.weight),
            x=int(self.x),
            y=int(self.y),
            angle=round(self.angle, 2),
            rotation=round(self.rotation, 2),
            radius=int(self.radius),
            color=self.color,
            light_color=self.light_color,
            turbine_color=self.turbine_color,
            is_forward=bool(self.is_forward),
            is_backward=bool(self.is_backward),
            is_left=bool(self.is_left),
            is_right=bool(self.is_right),

            win=bool(self.win),
            lose=bool(self.lose)
        )

    @property
    def m(self):
        return self.weight

    @m.setter
    def m(self, m):
        self.weight = m

    @property
    def speed(self):
        return (self.vx ** 2 + self.vy ** 2) ** 0.5

    @speed.setter
    def speed(self, value):
        q = self.q
        self.vx = value * cos(q)
        self.vy = value * sin(q)

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
        return angle(self.vy, self.vx)

    @property
    def path_length(self):
        return (self.x ** 2 + self.y ** 2) ** 0.5
