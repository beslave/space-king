# coding: utf-8
from libs import compare, div
from logger import logging_on
from space_king import settings
from twisted.internet import reactor

import json
import math
import time


@logging_on
class Game(object):

    ATTENUATION = 0.3

    def __init__(self, player1, player2):
        self.check_distance = False
        self.player1 = player1
        self.player2 = player2
        self.state1 = {}
        self.state2 = {}
        self.is_play = True
        self.t1 = time.time()
        for p1, p2 in zip([player1, player2], [player1, player2]):
            p1.transport.write(json.dumps(p1.ship))
            p1.transport.write(json.dumps([p2.ship]))
        self.play()

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
            self.move_ship(player)
            self.fix_positions(player)
            self.change_speed(player)
            self.change_angle(player)
            self.limit_speed(player)
        self.check_distance = False
        self.check_shots()

    def change_speed(self, player):
        player.speed = player.speed * (1 - self.ATTENUATION * self.dT)
        if player.is_backward:
            player.vx -= player.acceleration_backward * math.cos(player.angle) * self.dT
            player.vy -= player.acceleration_backward * math.sin(player.angle) * self.dT
        if player.is_forward:
            player.vx += player.acceleration_forward * math.cos(player.angle) * self.dT
            player.vy += player.acceleration_forward * math.sin(player.angle) * self.dT

    def change_angle(self, player):
        if True or player.is_forward or player.is_backward:
            if player.is_left:
                player.angle += player.angle_speed * self.dT
            if player.is_right:
                player.angle -= player.angle_speed * self.dT

    def move_ship(self, player):
        player.x += player.speed_x * self.dT
        player.y += player.speed_y * self.dT

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
        player.vx = min(player.max_speed, player.vx)
        player.vx = max(-player.max_speed, player.vx)
        player.vy = min(player.max_speed, player.vy)
        player.vy = max(-player.max_speed, player.vy)

    def check_shots(self):
        p1, p2 = self.player1, self.player2
        # if shot
        if self.distance < p1.radius + p2.radius:
            print "_" * 80
            print "Old Speeds: ", self.player1.vx, self.player1.vy, self.player2.vx, self.player2.vy
            phi = math.atan(div(p2.y - p1.y, p2.x - p1.x))
            args = (p1.m, p2.m, p1.speed, p2.speed, p1.q, p2.q, phi)
            print "Old distance: ", self.distance
            print "Args: ", args
            p1.vx, p1.vy, p2.vx, p2.vy = self.get_velocities2d(*args)
            print "New Speeds: ", self.player1.vx, self.player1.vy, self.player2.vx, self.player2.vy

            xc, yc = (p1.x + p2.x) / 2.0, (p1.y + p2.y) / 2.0
            L = p1.radius + p2.radius
            lx = abs(math.cos(math.pi + phi) * L / 2)
            ly = abs(math.sin(math.pi + phi) * L / 2)
            p1.x = xc + lx * div(p1.x - xc, abs(p1.x - xc))
            p2.x = xc + lx * div(p2.x - xc, abs(p2.x - xc))
            p1.y = yc + ly * div(p1.y - yc, abs(p1.y - yc))
            p2.y = yc + ly * div(p2.y - yc, abs(p2.y - yc))
            print "New distance: ", self.distance
            self.check_distance = True

    @property
    def dT(self):
        return self.t2 - self.t1

    @property
    def distance(self):
        return ((self.player1.x - self.player2.x) ** 2 + (self.player1.y - self.player2.y) ** 2) ** 0.5

    @staticmethod
    def get_velocities2d(m1, m2, v1, v2, q1, q2, phi):
        _v1x, _v1y = v1 * math.cos(q1), v1 * math.sin(q1)
        _v2x, _v2y = v2 * math.cos(q2), v2 * math.sin(q2)
        print "v1 (x, y):", _v1x, _v1y
        print "v2 (x, y):", _v2x, _v2y

        v1x, v1y = Game.rotate(_v1x, _v1y, -phi)
        v2x, v2y = Game.rotate(_v2x, _v2y, -phi)
        print "Vphi1 (x, y):", v1x, v1y
        print "Vphi2 (x, y):", v2x, v2y

        _u1x, _u2x = Game.get_velocities(m1, m2, v1x, v2x)
        _u1y, _u2y = v1y, v2y
        print "u1_phi (x, y):", _u1x, _u1y
        print "u2_phi (x, y):", _u2x, _u2y

        u1x, u1y = Game.rotate(_u1x, _u1y, phi)
        u2x, u2y = Game.rotate(_u2x, _u2y, phi)
        print "Result u1 (x, y):", u1x, u1y
        print "Result u2 (x, y):", u2x, u2y

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
        print (u21, u22), (u11, u12)
        return (u11, u12) if compare((u21, u22), (v1, v2)) else (u21, u22)

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
