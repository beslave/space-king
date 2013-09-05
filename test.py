from space_king.socketserver.game import Game
from libs import compare
import math


test1 = [
    ((1, 1, 1, -1), (-1, 1)),
    ((1, 1, 1, 0), (0, 1)),
    ((1, 1, 2, 1), (1, 2)),
    ((1, 1, 0, 0), (0, 0)),
    ((2, 1, 3, -3), (-1, 5)),
]

test2 = [
    ((1, 1, 1, 1, 0, math.pi, 0), (-1, 0, 1, 0)),
    ((1, 1, 3, 1, 0, math.pi, 0), (-1, 0, 3, 0)),
    ((1, 1, 1, 0, 0, math.pi, 0), (0, 0, 1, 0)),
    ((1, 1, 1, 1, math.pi / 2, - math.pi / 2, math.pi / 2), (0, -1, 0, 1)),
    ((1, 1, 1, 0, 0, 0, -math.pi / 4), (0.5, 0.5, 0.5, -0.5)),
    ((1, 1, 1, 1, 0, -math.pi, -math.pi / 4), (0, 1, 0, -1)),
    ((1, 1, 1, 0, 3.0 / 4 * math.pi, 0, -math.pi / 4), (0, 0, -math.sin(3.0 / 4.0 * math.pi), math.sin (3.0 / 4.0 * math.pi))),
    ((1, 1, 0, 1, 0, 3.0 / 4 * math.pi, -math.pi / 4), (-0.7, -0.7, 0, 0)),
]



for test, f in [(test1, Game.get_velocities), (test2, Game.get_velocities2d)]:
    print "{:=^80}".format("Test: " + f.__name__)
    for args, true_rez in test:
        rez = f(*args)
        print "Arguments:       ", args
        print "True result:     ", true_rez
        print "Returned result: ", rez
        print "Comparation: ",
        if compare(true_rez, rez):
            print "OK!"
        else:
            print "{:!^60}".format(" ERROR ")
        print "^" * 100
