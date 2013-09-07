# coding: utf-8
from libs import compare
from libs.physics.transformation import rotate

from math import cos, sin


def get_velocities(m1, m2, v1, v2):
    a = m2 * (m2 + m1)
    b = - 2 * m2 * (m1 * v1 + m2 * v2)
    c = m2 * v2 * (2 * m1 * v1 + (m2 - m1) * v2)
    d = (b ** 2 - 4 * a * c) ** 0.5
    u21, u22 = (-b + d) / (2 * a), (-b - d) / (2 * a)
    get_u1 = lambda x: (m1 * v1 + m2 * v2 - m2 * x) / m1
    u11, u12 = get_u1(u21), get_u1(u22)
    return (u11, u21) if compare((u12, u22), (v1, v2)) else (u12, u22)


def get_velocities2d(m1, m2, v1, v2, q1, q2, phi):
    _v1x, _v1y = v1 * cos(q1), v1 * sin(q1)
    _v2x, _v2y = v2 * cos(q2), v2 * sin(q2)

    v1x, v1y = rotate(_v1x, _v1y, -phi)
    v2x, v2y = rotate(_v2x, _v2y, -phi)

    _u1x, _u2x = get_velocities(m1, m2, v1x, v2x)
    _u1y, _u2y = v1y, v2y

    u1x, u1y = rotate(_u1x, _u1y, phi)
    u2x, u2y = rotate(_u2x, _u2y, phi)

    return u1x, u1y, u2x, u2y
