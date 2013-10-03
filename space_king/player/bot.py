# coding: utf-8
from space_king import settings
from space_king.player.base import Player
from twisted.internet import reactor


class Bot(Player):

    def in_play(self, status=True):
        super(Bot, self).in_play(status)
        self.next_step()

    def next_step(self):
        if self.is_play:
            self.__command_forward__()
            reactor.callLater(settings.SYSTEM_DELAY * 2.0, self.next_step)
