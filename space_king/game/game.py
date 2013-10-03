# coding: utf-8
from libs import angle, div
from libs.physics.collisions import get_velocities2d
from logger import logging_on
from math import cos, pi, sin
from space_king import settings
from twisted.internet import reactor

import time


def enemies_data(objects):
    for ob1 in objects:
        yield ob1, [ob for ob in objects if ob is not ob1]


@logging_on
class Game(object):

    ATTENUATION = 0.3
    LAST_GAME_ID = 0
    __GAMES__ = {}

    def __init__(self):
        self.players = []
        self.is_play = False

    @staticmethod
    def enter(player):
        if Game.LAST_GAME_ID not in Game.__GAMES__ or\
                Game.__GAMES__[Game.LAST_GAME_ID]:
            Game.LAST_GAME_ID += 1
            Game.__GAMES__[Game.LAST_GAME_ID] = Game()
        Game.__GAMES__[Game.LAST_GAME_ID].add_player(player)
        return Game.LAST_GAME_ID

    @staticmethod
    def exit(game_id, user=None):
        if game_id in Game.__GAMES__:
            Game.__GAMES__[game_id].stop()
            del Game.__GAMES__[game_id]

    def __nonzero__(self):
        return len(self.players) >= 2

    def add_player(self, player):
        self.players.append(player)
        if self:
            self.locate_players()
            self.is_play = True
            self.t1 = time.time()
            for p1, enemies in enemies_data(self.players):
                p1.send_ship()
                p1.send_user_info()
                for enemy in enemies:
                    p1.send_ship(enemy.ship)
                    p1.send_user_info(enemy.user)
                p1.incr_battles()
            self.play()

    def locate_players(self):
        delta_q = pi * 2.0 / len(self.players)
        start_x = 0
        start_y = settings.PLAYER_START_RADIUS
        for i, p in enumerate(self.players):
            q = delta_q * i
            p.angle = pi / 2.0 + q
            p.x = start_x * cos(q) - start_y * sin(q)
            p.y = start_x * sin(q) + start_y * cos(q)
            p.rotation = q

    def play(self):
        if self.is_play:
            self.t2 = time.time()
            self.is_play = self.next_frame()
            self.t1 = self.t2
            diffs = [p.changes for p in self.players]
            if any(diffs):
                f = lambda o: list(enemies_data(o))
                x = zip(*map(f, [self.players, diffs]))
                for (p, enemies), (d, enemies_diffs) in x:
                    p.send_changes([d] + list(enemies_diffs))
            reactor.callLater(0.05, self.play)

    def next_frame(self):
        for player in self.players:
            self.move_ship(player)
            self.change_speed(player)
            self.change_angle(player)
            self.limit_speed(player)
        self.check_collisions()
        return not self.check_winner()

    def change_speed(self, p):
        if p.is_backward:
            p.vx -= p.acceleration_backward * cos(p.angle) * self.dT
            p.vy -= p.acceleration_backward * sin(p.angle) * self.dT
        if p.is_forward:
            p.vx += p.acceleration_forward * cos(p.angle) * self.dT
            p.vy += p.acceleration_forward * sin(p.angle) * self.dT
        p.speed = p.speed * (1 - self.ATTENUATION * self.dT)

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

    def check_collisions(self):
        for p1 in self.players[:-1]:
            for p2 in self.players[1:]:
                self.check_collisions_between_players(p1, p2)

    @staticmethod
    def check_collisions_between_players(p1, p2):
        # if shot
        if Game.distance(p1, p2) < p1.radius + p2.radius:
            phi = Game.phi(p1, p2)
            p1.vx, p1.vy, p2.vx, p2.vy = get_velocities2d(
                p1.m, p2.m, p1.speed, p2.speed, p1.q, p2.q, phi
            )

            xc, yc = (p1.x + p2.x) / 2.0, (p1.y + p2.y) / 2.0
            L = p1.radius + p2.radius
            lx = abs(cos(pi + phi) * L / 2)
            ly = abs(sin(pi + phi) * L / 2)
            p1.x = xc + lx * div(p1.x - xc, abs(p1.x - xc))
            p2.x = xc + lx * div(p2.x - xc, abs(p2.x - xc))
            p1.y = yc + ly * div(p1.y - yc, abs(p1.y - yc))
            p2.y = yc + ly * div(p2.y - yc, abs(p2.y - yc))

    def check_winner(self):
        max_path = max(map(lambda p: p.path_length, self.players))
        if max_path > settings.SPACE_RADIUS:
            for p in self.players:
                is_win = p.path_length < max_path
                if is_win:
                    p.ship.win = True
                else:
                    p.ship.lose = True
                if p.user:
                    p.user.incr('wins' if is_win else 'defeats')
            return True
        return False

    @property
    def dT(self):
        return self.t2 - self.t1

    @staticmethod
    def phi(p1, p2):
        return angle(p1.y - p2.y, p2.x - p1.x)

    @staticmethod
    def distance(p1, p2):
        return ((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2) ** 0.5

    def stop(self):
        self.is_play = False
        for p in self.players:
            p.close()
