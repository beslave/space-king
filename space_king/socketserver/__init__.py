# coding: utf-8
from libs.websocket import WebSocketHandler

import json
import random


class GameHandler(WebSocketHandler):

    @classmethod
    def new_ship(cls, x=0, y=0, angle=0):
        return dict(
            type="ship",
            x=x,
            y=y,
            angle=angle,
            radius=48,
            speed_x=0,
            speed_y=0,
            angle_speed=7,
            acceleration_forward=0.4,
            acceleration_backward=0.3,
            max_speed=13,
            color=random.choice(["#C95", "#777", "#669"]),
            light_color=random.choice(["#F00", "#0F0", "#00F", "#FF0", "#F0F", "#0FF"]),
            turbine_color=random.choice(["#555", "#446", "#644", "#464"])
        )

    def __init__(self, *a, **k):
        self.ship = self.new_ship(0, 500)
        return super(GameHandler, self).__init__(*a, **k)

    def connectionMade(self):
        print "Connection Made"
        self.transport.write(json.dumps(self.ship))
        self.transport.write(json.dumps([self.new_ship(0, -500, -180)]))

    def connectionLost(self, reason):
        print "Lost connection:", reason

    def frameReceived(self, frame):
        # self.transport.write(frame)
        pass
