# coding: utf-8
from space_king.game import Game
from space_king.player.ship import Ship
from libs import diff


class Player(object):

    def __init__(self, *a, **k):
        self._state = {}
        self.ship = Ship()
        self.user = {}
        self.is_play = False
        return super(Player, self).__init__(*a, **k)

    def __getattr__(self, attr):
        if hasattr(self, 'ship') and hasattr(self.ship, attr):
            return getattr(self.ship, attr)
        return getattr(super(Player, self), attr)

    def __setattr__(self, attr, value):
        if hasattr(self, 'ship') and hasattr(self.ship, attr):
            setattr(self.ship, attr, value)
        else:
            super(Player, self).__setattr__(attr, value)

    def close(self):
        pass

    def play(self):
        self.game_id = Game.enter(self)

    def exit(self, status=''):
        Game.exit(self.game_id)

    def send_ship(self, ship=None):
        pass

    def send_user_info(self, user=None):
        pass

    def send_changes(self, diff):
        pass

    def incr_battles(self):
        if self.user:
            self.user.incr('battles')

    def in_play(self, status=True):
        self.is_play = status

    def win(self):
        if self.user:
            self.user.incr('wins')
        if self.ship:
            self.ship.win = True

    def lose(self):
        if self.user:
            self.user.incr('defeats')
        if self.ship:
            self.ship.lose = True

    @property
    def changes(self):
        if not hasattr(self, 'ship'):
            return
        new_state = self.ship.to_dict()
        changes = diff(self._state, new_state)
        self._state = new_state
        return changes

    def __command_forward__(self, state='on'):
        self.ship.is_forward = state != 'off'

    def __command_backward__(self, state='on'):
        self.ship.is_backward = state != 'off'

    def __command_left__(self, state='on'):
        self.ship.is_left = state != 'off'

    def __command_right__(self, state='on'):
        self.ship.is_right = state != 'off'
