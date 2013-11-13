# coding: utf-8
from math import atan, copysign, pi

import os
import random
import string


PROJECT_DIR = os.path.join(
    os.path.dirname(os.path.realpath(__file__)),
    ".."
)


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


def angle(y, x):
    a = atan(div(abs(y), abs(x)))
    if y >= 0:
        return a if x >= 0 else pi - a
    else:
        return -a if x >= 0 else pi + a


def diff(dict1, dict2):
    dif = {}
    for key, value in dict2.iteritems():
        if dict1.get(key) != value:
            dif[key] = value
    return dif


def random_string(size_min=6, size_max=None, pretty=False):
    size_max = max(size_min, size_max)
    chars = "".join([
        string.ascii_lowercase,
        string.ascii_uppercase,
        string.digits,
        "" if pretty else "_- */`!@#$%^&()"
    ])
    size = random.randint(size_min, size_max)
    return "".join(random.choice(chars) for x in xrange(size))


def normalize_angle(angle):
    angle %= 2.0 * pi
    if angle > pi:
        angle -= 2.0 * pi
    return angle
