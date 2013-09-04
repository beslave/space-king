from space_king.socketserver.game import Game
import math


test1 = [
    ((1, 1, 1, -1), (-1, 1)),
    ((1, 1, 1, 0), (0, 1)),
    ((1, 1, 2, 1), (1, 2)),
    ((1, 1, 0, 0), (0, 0)),
    ((2, 1, 3, -3), (-1, 5)),
]

test2 = [
    ((1, 1, 1, 1, 0, math.pi, 0), (0, 0, 0, math.pi)),
    ((1, 1, 1, 0, 0, math.pi, 0), (0, 1, 0, 0))
]

for test, f in [(test1, Game.get_velocities), (test2, Game.get_velocities2d)]:
    print "{:=^80}".format("Test: " +f.__name__)
    for args, true_rez in test:
        rez = f(*args)
        print "." * 30
        print "Arguments:       ", args
        print "True result:     ", true_rez
        print "Returned result: ", rez
        print "Comparation: ",
        if rez != true_rez:
            print "ERROR!!!"
        else:
            print "OK!"
