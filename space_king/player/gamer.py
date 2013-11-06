# coding: utf-8
from space_king.player.base import Player
from logger import logging_on
from flask.sessions import SecureCookieSessionInterface, total_seconds
from space_king import app
from space_king.models.user import User
from twisted.internet.protocol import Protocol

import json


@logging_on
class Gamer(Player, Protocol):

    def __init__(self, *a, **k):
        super(Gamer, self).__init__(*a, **k)

    def connectionMade(self):
        s = SecureCookieSessionInterface()
        signing_serializer = s.get_signing_serializer(app)
        sessionid = self.transport.transport.request.getCookie('session')
        session = signing_serializer.loads(
            sessionid,
            max_age=total_seconds(app.permanent_session_lifetime)
        )
        user_pk = session.get('user_pk')
        self.user = User(pk=user_pk) if user_pk else None

        self.play()

    def close(self):
        try:
            self.transport.loseConnection()
        except AttributeError:
            pass

    def connectionLost(self, reason):
        self.exit()

    def send_ship(self, diff=None):
        ship = self.ship.to_dict() if diff is None else diff
        self.transport.write(json.dumps(ship))

    def send_changes(self, changes):
        if any(changes):
            self.transport.write(json.dumps(changes))

    def send_user_info(self, user=None):
        user = self.user if user is None else user
        self.transport.write(json.dumps(
            user.short_info if user else {}
        ))

    def dataReceived(self, data):
        parts = data.split(' ')
        if len(parts) > 0:
            command_name = '__command_{}__'.format(parts[0])
            parts = parts[1:]
            args = []
            kwargs = {}
            for x in parts:
                eqs = x.split('=')
                if len(eqs) == 1:
                    args.append(x)
                elif len(eqs) == 2:
                    kwargs[eqs[0]] = eqs[1]
                else:
                    kwargs[eqs[0]] = eqs[1:]
            if hasattr(self, command_name):
                try:
                    getattr(self, command_name)(*args, **kwargs)
                except TypeError:
                    self.exit('Disallow command!')
