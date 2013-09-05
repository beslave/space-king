# coding: utf-8


def compare(list1, list2):
    return reduce(
        lambda rez, vals: rez and abs(vals[0] - vals[1]) < 0.1e-3,
        zip(list1, list2), True)


def div(a, b):
    if a == 0:
        return 0
    if b == 0:
        return math.copysign(float("inf"), a)
    return a / b