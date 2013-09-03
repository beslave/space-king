# coding: utf-8
from logger import logging_on
from space_king import settings
from twisted.internet import reactor

import json
import math
import time


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
            self.player1.transport.write(to_player1);
            self.player2.transport.write(to_player2);
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
        p1 = self.player1
        p2 = self.player2
        # shot
        if ((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2)  ** 0.5 <= p1.radius + p2.radius:
            phi_x = math.atan((p2.y - p1.y) / (p2.x - p1.x))
            phi_y = phi_x - math.pi / 2
            v1 = (p1.speed_x ** 2 + p1.speed_y ** 2) ** 0.5
            v2 = (p2.speed_x ** 2 + p2.speed_y ** 2) ** 0.5
            q1, q2 = p1.angle, p2.angle
            m1, m2 = p1.m, p2.m
            for suf in ['x', 'y']:
                phi = vars()["phi_{}".format(suf)]
                A = (v1 * math.cos(q1 - phi) * (m1 + m2) + 2 * m2 * v2 * math.cos(q2 - phi)) / (m1 + m2)
                B = v1 * math.sin(q1 - phi)
                setattr(p1, "speed_{}".format(suf), A * math.cos(phi) + B * math.cos(phi + math.pi / 2))
                setattr(p2, "speed_{}".format(suf), A * math.sin(phi) + B * math.sin(phi + math.pi / 2))


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
