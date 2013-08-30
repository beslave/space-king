# coding: utf-8
from libs.websocket import WebSocketSite
from twisted.internet import reactor
from twisted.web.static import File
from space_king import socketserver, settings


if __name__ == "__main__":
    root = File('.')
    site = WebSocketSite(root)
    site.addHandler('/echo', socketserver.Echohandler)

    reactor.listenTCP(8080, site)
    reactor.run()
