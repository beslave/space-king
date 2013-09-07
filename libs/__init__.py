# coding: utf-8
from math import copysign

def compare(list1, list2):
    return reduce(
        lambda rez, vals: rez and abs(vals[0] - vals[1]) < 0.1e-3,
        zip(list1, list2), True)


def div(a, b):
    if a == 0:
        return 0
    if b == 0:
        return copysign(float("inf"), a)
    return a / b


def diff(dict1, dict2):
    dif = {}
    for key, value in dict2.iteritems():
        if dict1.get(key) != value:
            dif[key] = value
    return dif