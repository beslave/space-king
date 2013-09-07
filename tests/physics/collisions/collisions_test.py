# coding: utf-8
from libs.physics import collisions
from math import pi

import unittest


class CollisionTesCase(unittest.TestCase):
    
    def _test(self, f, args, true_res):
        rez = f(*args)
        try:
            for i, rez in enumerate(rez):
                self.assertAlmostEqual(rez, true_res[i], places=5)
        except AssertionError as e:
            print "Assertion error:", e
            print "-- function:", f.__name__
            print "-- arguments:", args
            print "-- rez:", rez
            print "-- true result:", true_res
            raise AssertionError

    def _test1d(self, args, true_res):
        self._test(collisions.get_velocities, args, true_res)

    def _test2d(self, args, true_res):
        self._test(collisions.get_velocities2d, args, true_res)

    def test_1d_collision(self):
        self._test1d((1, 1, 1, -1), (-1, 1))
        self._test1d((1, 1, -1, 1), (1, -1))
        self._test1d((1, 1, 1, 0), (0, 1))
        self._test1d((1, 1, 2, 1), (1, 2))
        self._test1d((1, 1, 0, 0), (0, 0))
        self._test1d((2, 1, 3, -3), (-1, 5))

    def test_2d_phi0(self):
        self._test2d((1, 1, 1, 1, 0, pi, 0), (-1, 0, 1, 0))
        self._test2d((1, 1, 3, 1, 0, pi, 0), (-1, 0, 3, 0))
        self._test2d((1, 1, 1, 0, 0, pi, 0), (0, 0, 1, 0))
    
    def test_2d_phi45(self):
        x = 1 / 2 ** 0.5
        self._test2d((1, 1, 1, 1, pi/4, 5.0/4.0*pi, pi/4), (-x, -x, x, x))
    
    def test_2d_phi90(self):
        self._test2d((1, 1, 2, 3, pi/2, pi/2, pi/2), (0, 3, 0, 2))
        self._test2d((1, 1, 0, 1, 0, -pi/2, pi/2), (0, -1, 0, 0))
    
    def test_2d_phi135(self):
        x = 1 / 2 ** 0.5
        self._test2d((1, 1, 1, 1, 3.0/4.0*pi, -pi/4, 3.0/4.0*pi), (x, -x, -x, x))

    def test_2d_phi180(self):
        self._test2d((2, 2, 2, 2, pi, 0, pi), (2, 0, -2, 0))
        self._test2d((2, 2, 1, 3, pi, 0, pi), (3, 0, -1, 0))
        self._test2d((2, 2, 0, 2, pi, 0, pi), (2, 0, 0, 0))
    
    def test_2d_phi315(self):
        x = 1 / 2 ** 0.5
        self._test2d((1, 1, 1, 1, -pi/4, 3.0/4.0*pi, -pi/4), (-x, x, x, -x))
