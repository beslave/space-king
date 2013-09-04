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
    ((1, 1, 1, 1, 0, math.pi, 0), (-1, 0, 1, 0)),
    ((1, 1, 1, 0, 0, math.pi, 0), (0, 0, 1, 0)),
    ((1, 1, 1, 1, math.pi / 2, - math.pi / 2, math.pi / 2), (0, -1, 0, 1)),
]


def compare(list1, list2):
    return reduce(
        lambda rez, vals: rez and abs(vals[0] - vals[1]) < 0.1e-10,
        zip(list1, list2), True)


for test, f in [(test1, Game.get_velocities), (test2, Game.get_velocities2d)]:
    print "{:=^80}".format("Test: " + f.__name__)
    for args, true_rez in test:
        rez = f(*args)
        print "." * 30
        print "Arguments:       ", args
        print "True result:     ", true_rez
        print "Returned result: ", rez
        print "Comparation: ",
        if compare(true_rez, rez):
            print "OK!"
        else:
            print "ERROR!!!"
