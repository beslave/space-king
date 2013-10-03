# coding: utf-8
from logger import logging_on
from space_king import settings
from space_king.player.base import Player
from twisted.internet import reactor


@logging_on
class Bot(Player):

    def __init__(self, *a, **k):
        super(Bot, self).__init__(*a, **k)
        self.enemy_ship = {}
        self.enemy_ship_changes = {}

    def in_play(self, status=True):
        super(Bot, self).in_play(status)
        self.next_step()

    def send_ship(self, diff=None):
        if diff:
            self.enemy_ship_changes = diff
            self.enemy_ship.update(diff)
        return super(Bot, self).send_ship(diff)

    def next_step(self):
        if self.is_play:
            self.__command_forward__()
            reactor.callLater(settings.SYSTEM_DELAY, self.next_step)
