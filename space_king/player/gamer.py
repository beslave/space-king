# coding: utf-8
from space_king.player.base import Player
from libs.websocket import WebSocketHandler
from logger import logging_on

from flask.sessions import SecureCookieSessionInterface, total_seconds
from space_king import app
from space_king.models.user import User


@logging_on
class Gamer(Player, WebSocketHandler):

    def __init__(self, *a, **k):
        super(Gamer, self).__init__(*a, **k)
        WebSocketHandler.__init__(self, *a, **k)

    def connectionMade(self):
        s = SecureCookieSessionInterface()
        signing_serializer = s.get_signing_serializer(app)
        sessionid = self.transport._request.getCookie("session")
        session = signing_serializer.loads(
            sessionid,
            max_age=total_seconds(app.permanent_session_lifetime)
        )
        user_pk = session.get("user_pk")
        self.user = User(pk=user_pk) if user_pk else None

        self.play()

    def connectionLost(self, reason):
        self.exit()

    def frameReceived(self, frame):
        parts = frame.split(" ")
        if len(parts) > 0:
            command_name = "__command_{}__".format(parts[0])
            parts = parts[1:]
            args = []
            kwargs = {}
            for x in parts:
                eqs = x.split("=")
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
                    self.exit("Disallow command!")
