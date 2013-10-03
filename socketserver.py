# coding: utf-8
from libs.websocket import WebSocketSite
from logger import print_logs
from twisted.internet import reactor
from twisted.web.static import File
from space_king import settings
from space_king.player.gamer import Gamer


if __name__ == "__main__":
    root = File('.')

    site = WebSocketSite(root)
    site.addHandler('/game', Gamer)

    for port in settings.SOCKETSERVER_PORTS:
        reactor.listenTCP(port, site, interface='0.0.0.0')
    reactor.run()
    print_logs()
