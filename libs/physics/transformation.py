# coding: utf-8
from math import cos, sin

def rotate(x, y, phi):
    _x = x * cos(phi) - y * sin(phi)
    _y = x * sin(phi) + y * cos(phi)
    return _x, _y