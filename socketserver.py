# coding: utf-8
from logger import print_logs
from space_king import settings
from space_king.player.gamer import Gamer
from twisted.internet import reactor
from twisted.internet.protocol import Factory
from txsockjs.factory import SockJSMultiFactory


if __name__ == "__main__":
    f = SockJSMultiFactory()
    f.addFactory(Factory.forProtocol(Gamer), "game", settings.SOCKJS)

    for port in settings.SOCKETSERVER_PORTS:
        reactor.listenTCP(port, f, interface='0.0.0.0')
    reactor.run()
    print_logs()
