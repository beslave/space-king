# coding: utf-8
from libs.websocket import WebSocketHandler


class Echohandler(WebSocketHandler):

    def frameReceived(self, frame):
        self.transport.write(frame)
