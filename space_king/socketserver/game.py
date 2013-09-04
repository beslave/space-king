# coding: utf-8
from logger import logging_on
from space_king import settings
from twisted.internet import reactor

import json
import math
import time


def div(a, b):
    if a == 0:
        return 0
    if b == 0:
        return math.copysign(float("inf"), a)
    return a / b


@logging_on
class Game(object):

    def __init__(self, player1, player2):
        self.player1 = player1
        self.player2 = player2
        self.state1 = {}
        self.state2 = {}
        self.is_play = True
        self.t1 = time.time()

    def play(self):
        if self.is_play:
            self.t2 = time.time()
            self.next_frame()
            self.t1 = self.t2
            diff1 = self.diff(self.state1, self.player1.ship)
            diff2 = self.diff(self.state2, self.player2.ship)
            to_player1 = json.dumps([diff1, diff2])
            to_player2 = json.dumps([diff2, diff1])
            self.player1.transport.write(to_player1)
            self.player2.transport.write(to_player2)
            self.state1.update(self.player1.ship)
            self.state2.update(self.player2.ship)
            reactor.callLater(0.01, self.play)

    def next_frame(self):
        for player in [self.player1, self.player2]:
            self.change_speed(player)
            self.change_angle(player)
            self.move_ship(player)
            self.fix_positions(player)
            self.limit_speed(player)
        self.check_shots()

    def change_speed(self, player):
        if player.is_backward:
            player.speed_x -= player.acceleration_forward * math.cos(player.angle) * (self.t2 - self.t1)
            player.speed_y += player.acceleration_forward * math.sin(player.angle) * (self.t2 - self.t1)
        if player.is_forward:
            player.speed_x += player.acceleration_forward * math.cos(player.angle) * (self.t2 - self.t1)
            player.speed_y -= player.acceleration_forward * math.sin(player.angle) * (self.t2 - self.t1)

    def change_angle(self, player):
        if player.is_forward or player.is_backward:
            if player.is_left:
                player.angle += player.angle_speed * (self.t2 - self.t1)
            if player.is_right:
                player.angle -= player.angle_speed * (self.t2 - self.t1)

    def move_ship(self, player):
        player.x += player.speed_x * (self.t2 - self.t1)
        player.y += player.speed_y * (self.t2 - self.t1)

    def fix_positions(self, player):
        if player.x > settings.SPACE_RADIUS:
            player.x = - settings.SPACE_RADIUS
        if player.x < - settings.SPACE_RADIUS:
            player.x = settings.SPACE_RADIUS
        if player.y > settings.SPACE_RADIUS:
            player.y = - settings.SPACE_RADIUS
        if player.y < - settings.SPACE_RADIUS:
            player.y = settings.SPACE_RADIUS

    def limit_speed(self, player):
        player.speed_x = min(player.max_speed, player.speed_x)
        player.speed_x = max(-player.max_speed, player.speed_x)
        player.speed_y = min(player.max_speed, player.speed_y)
        player.speed_y = max(-player.max_speed, player.speed_y)

    def check_shots(self):
        p1, p2 = self.player1, self.player2
        distance = ((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2) ** 0.5
        # if shot
        if distance <= p1.radius + p2.radius:
            p1.speed_x, p1.speed_y, p2.speed_x, p2.speed_y = self.get_velocities2d(
                p1.m,
                p2.m,
                p1.speed,
                p2.speed,
                math.atan(div(p1.speed_y, p1.speed_x)),
                math.atan(div(p2.speed_y, p2.speed_x)),
                math.atan(div(p2.y - p1.y, p2.x - p1.x))
            )

    @staticmethod
    def get_velocities2d(m1, m2, v1, v2, q1, q2, phi):
        _v1x, _v1y = v1 * math.cos(q1), v1 * math.sin(q1)
        _v2x, _v2y = v2 * math.cos(q2), v2 * math.sin(q2)

        v1x, v1y = Game.rotate(_v1x, _v1y, phi)
        v2x, v2y = Game.rotate(_v2x, _v2y, phi)

        velocities = []
        for v1_1d, v2_1d in [(v1x, v2x), (v1y, v2y)]:
            velocities.append(Game.get_velocities(m1, m2, v1_1d, v2_1d))

        u1x, u1y = Game.rotate(velocities[0][0], velocities[1][0], -phi)
        u2x, u2y = Game.rotate(velocities[0][1], velocities[1][1], -phi)

        return u1x, u1y, u2x, u2y

    @staticmethod
    def get_velocities(m1, m2, v1, v2):
        a = m2 * (m2 + m1)
        b = - 2 * m2 * (m1 * v1 + m2 * v2)
        c = m2 * (m2 - m1) * v2 ** 2 + 2 * m1 * m2 * v1 * v2
        d = (b ** 2 - 4 * a * c) ** 0.5
        u21, u22 = (-b + d) / (2 * a), (-b - d) / (2 * a)
        getu1 = lambda x: (m1 * v1 + m2 * v2 - m2 * x) / m1
        u11, u12 = getu1(u21), getu1(u22)
        return (u11, u21) if (u11, u21) != (v1, v2) else (u12, u22)

    @staticmethod
    def rotate(x, y, phi):
        _x = x * math.cos(phi) - y * math.sin(phi)
        _y = x * math.sin(phi) + y * math.cos(phi)
        return _x, _y

    @staticmethod
    def diff(dict1, dict2):
        diff = {}
        for key, value in dict2.iteritems():
            if dict1.get(key) != value:
                diff[key] = value
        return diff

    def stop(self):
        self.is_play = False
        del self.player1
        del self.player2
