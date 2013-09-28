# coding: utf-8
from libs import angle, div, diff
from libs.physics.collisions import get_velocities2d
from logger import logging_on
from math import cos, pi, sin
from space_king import settings
from twisted.internet import reactor

import json
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
        for p1, p2 in zip([player1, player2], [player2, player1]):
            p1.transport.write(json.dumps(p1.ship.to_dict()))
            p1.transport.write(json.dumps(p2.ship.to_dict()))
            p1.transport.write(json.dumps(p1.user.short_info))
            p1.transport.write(json.dumps(p2.user.short_info))
        self.player1.user.incr("battles")
        self.player2.user.incr("battles")

    def play(self):
        if self.is_play:
            self.t2 = time.time()
            self.is_play = self.next_frame()
            self.t1 = self.t2
            ship1 = self.player1.ship.to_dict()
            ship2 = self.player2.ship.to_dict()
            diff1 = diff(self.state1, ship1)
            diff2 = diff(self.state2, ship2)
            if diff1 or diff2:
                to_player1 = json.dumps([diff1, diff2])
                to_player2 = json.dumps([diff2, diff1])
                self.player1.transport.write(to_player1)
                self.player2.transport.write(to_player2)
                self.state1.update(ship1)
                self.state2.update(ship2)
            reactor.callLater(0.05, self.play)

    def next_frame(self):
        for player in [self.player1, self.player2]:
            self.move_ship(player)
            self.change_speed(player)
            self.change_angle(player)
            self.limit_speed(player)
        self.check_distance = False
        self.check_shots()
        return not self.check_winner()

    def change_speed(self, player):
        if player.is_backward:
            player.vx -= player.acceleration_backward * cos(player.angle) * self.dT
            player.vy -= player.acceleration_backward * sin(player.angle) * self.dT
        if player.is_forward:
            player.vx += player.acceleration_forward * cos(player.angle) * self.dT
            player.vy += player.acceleration_forward * sin(player.angle) * self.dT
        player.speed = player.speed * (1 - self.ATTENUATION * self.dT)

    def change_angle(self, player):
        if True or player.is_forward or player.is_backward:
            if player.is_left:
                player.angle += player.angle_speed * self.dT
            if player.is_right:
                player.angle -= player.angle_speed * self.dT

    def move_ship(self, player):
        player.x += player.speed_x * self.dT
        player.y += player.speed_y * self.dT

    def limit_speed(self, player):
        player.speed = min(player.max_speed, player.speed)
        player.speed = max(-player.max_speed, player.speed)

    def check_shots(self):
        p1, p2 = self.player1, self.player2
        # if shot
        if self.distance < p1.radius + p2.radius:
            phi = self.phi
            p1.vx, p1.vy, p2.vx, p2.vy = get_velocities2d(p1.m, p2.m, p1.speed, p2.speed, p1.q, p2.q, phi)

            xc, yc = (p1.x + p2.x) / 2.0, (p1.y + p2.y) / 2.0
            L = p1.radius + p2.radius
            lx = abs(cos(pi + phi) * L / 2)
            ly = abs(sin(pi + phi) * L / 2)
            p1.x = xc + lx * div(p1.x - xc, abs(p1.x - xc))
            p2.x = xc + lx * div(p2.x - xc, abs(p2.x - xc))
            p1.y = yc + ly * div(p1.y - yc, abs(p1.y - yc))
            p2.y = yc + ly * div(p2.y - yc, abs(p2.y - yc))
            self.check_distance = True

    def check_winner(self):
        p1_path = self.player1.path_length
        p2_path = self.player2.path_length
        if max(p1_path, p2_path) > settings.SPACE_RADIUS:
            if p1_path <= p2_path:
                self.player1.ship.win = True
                self.player2.ship.lose = True
                if self.player1.user:
                    self.player1.user.incr("wins")
                if self.player2.user:
                    self.player2.user.incr("defeats")
            else:
                self.player2.ship.win = True
                self.player1.ship.lose = True
                if self.player2.user:
                    self.player2.user.incr("wins")
                if self.player1.user:
                    self.player1.user.incr("defeats")
            return True
        return False

    @property
    def dT(self):
        return self.t2 - self.t1

    @property
    def phi(self):
        return angle(self.player1.y - self.player2.y, self.player2.x - self.player1.x)

    @property
    def distance(self):
        return ((self.player1.x - self.player2.x) ** 2 + (self.player1.y - self.player2.y) ** 2) ** 0.5

    def stop(self):
        self.is_play = False
        del self.player1
        del self.player2
