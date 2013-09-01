# coding: utf-8
from libs.websocket import WebSocketSite
from twisted.internet import reactor
from twisted.web.static import File
from space_king import socketserver, settings


if __name__ == "__main__":
    root = File('.')

    site = WebSocketSite(root)
    site.addHandler('/game', socketserver.GameHandler)

    for port in settings.SOCKETSERVER_PORTS:
        reactor.listenTCP(port, site, interface='0.0.0.0')
    reactor.run()
