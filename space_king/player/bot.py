# coding: utf-8
from flask import url_for
from libs import angle, normalize_angle
from libs.redis_storage import db1
from logger import logging_on
from math import cos, pi, sin
from space_king import app, settings
from space_king.models.user import User
from space_king.player.base import Player
from twisted.internet import reactor


ctx = app.test_request_context()
ctx.push()


@logging_on
class Bot(Player):

    KEY = 'M1'
    NAME = 'Stupid bot'

    def __init__(self, *a, **k):
        super(Bot, self).__init__(*a, **k)
        self.enemy_ship = {}
        self.enemy_ship_changes = {}
        self.user = self.get_user()

    def get_user(self):
        pk_key = 'bot:{}:pk'.format(self.KEY)
        bot_pk = db1.get(pk_key)
        user = User(pk=bot_pk)
        if not bot_pk:
            db1.set(pk_key, user.pk)
        if user.last_name != self.NAME:
            user.last_name = self.NAME
        bot_avatar = url_for(
            'static',
            filename='images/bots/{}.png'.format(self.KEY)
        )
        if user.avatar != bot_avatar:
            user.avatar = bot_avatar
        return user

    def in_play(self, status=True):
        super(Bot, self).in_play(status)
        self.next_step()

    def send_ship(self, ship=None):
        if ship:
            self.enemy_ship = ship
        return super(Bot, self).send_ship(ship)

    def send_changes(self, changes):
        if len(changes) >= 2:
            self.enemy_ship_changes = changes[1]
            self.enemy_ship.update(changes[1])

    def next_step(self):
        if self.is_play:
            # feature enemy ship's coordinates
            nx = self.enemy_ship.get('x', 0.0)
            ny = self.enemy_ship.get('y', 0.0)
            R = float(self.enemy_ship.get('radius', 0))
            eq = angle(ny, nx)
            nx -= R * cos(eq)
            ny -= R * sin(eq)
            # self ship coordinates
            sx, sy, sa = self.x, self.y, self.angle
            q = angle(sy - ny, nx - sx)

            da = round(normalize_angle(q - sa), 1)

            forward, backward, right, left = False, False, False, False

            if abs(da) <= pi / 2.0:
                forward = abs(da) <= pi / 6.0
                if da > 0.0:
                    left = True
                elif da < 0.0:
                    right = True
            else:
                backward = abs(da) <= pi / 6.0 + pi / 2.0
                if da > 0.0:
                    left = True
                elif da < 0.0:
                    right = True

            self.__command_forward__("on" if forward else "off")
            self.__command_backward__("on" if backward else "off")
            self.__command_right__("on" if right else "off")
            self.__command_left__("on" if left else "off")

            reactor.callLater(settings.SYSTEM_DELAY, self.next_step)
