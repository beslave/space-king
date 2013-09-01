# coding: utf-8
from space_king import settings
from twisted.internet import reactor

import json
import math


class Game(object):

    def __init__(self, player1, player2):
        self.player1 = player1
        self.player2 = player2
        self.state1 = {}
        self.state2 = {}
        self.is_play = True

    def play(self):
        if self.is_play:
            self.next_frame()
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
            # Change speed
            if player.is_backward:
                player.speed_x += player.acceleration_forward * math.cos((90 - player.angle) * math.pi / 180)
                player.speed_y += player.acceleration_forward * math.sin((90 - player.angle) * math.pi / 180)
            if player.is_forward:
                player.speed_x -= player.acceleration_forward * math.cos((90 - player.angle) * math.pi / 180)
                player.speed_y -= player.acceleration_forward * math.sin((90 - player.angle) * math.pi / 180)                
            # Change angle
            if player.is_forward or player.is_backward:
                if player.is_left:
                    player.angle += player.angle_speed
                if player.is_right:
                    player.angle -= player.angle_speed
            # Move ship
            player.x += player.speed_x
            player.y += player.speed_y
            # Fix position
            if player.x > settings.SPACE_RADIUS - player.radius:
                player.x = settings.SPACE_RADIUS - player.radius
                player.speed_x = - player.speed_x
            if player.x < - settings.SPACE_RADIUS + player.radius:
                player.x = - settings.SPACE_RADIUS + player.radius
                player.speed_x = - player.speed_x
            if player.y > settings.SPACE_RADIUS - player.radius:
                player.y = settings.SPACE_RADIUS - player.radius
                player.speed_y = - player.speed_y
            if player.y < - settings.SPACE_RADIUS + player.radius:
                player.y = - settings.SPACE_RADIUS + player.radius
                player.speed_y = - player.speed_y
            player.speed_x = min(player.max_speed, player.speed_x)
            player.speed_x = max(-player.max_speed, player.speed_x)
            player.speed_y = min(player.max_speed, player.speed_y)
            player.speed_y = max(-player.max_speed, player.speed_y)

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
