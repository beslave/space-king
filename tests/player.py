# coding: utf-8
from math import pi
from space_king.socketserver.player import Player

import unittest


class PlayerSpeedTestCase(unittest.TestCase):
    
    def setUp(self):
        self.player = Player(None)
        self.angle = pi / 2.0
    
    def _test(self, attr, vx, vy, v):
        self.player.speed_x = vx
        self.player.speed_y = vy
        self.assertAlmostEqual(getattr(self.player, attr), v, places=5)
    
    def _test_speed(self, vx, vy, v):
        self._test("speed", vx, vy, v)

    def test_speed_property(self):
        self._test_speed(0, 0, 0.0)
        self._test_speed(1, 0, 1.0)
        self._test_speed(0, 1, 1.0)
        self._test_speed(1, 1, 2 ** 0.5)
        self._test_speed(1, -1, 2 ** 0.5)
        self._test_speed(-1, -1, 2 ** 0.5)
    
    def test_speed_setter(self):
        self.player.vx = 1
        self.player.vy = 1
        self.player.speed = 50.0 ** 0.5
        self.assertAlmostEqual(self.player.vx, 5.0)
        self.assertAlmostEqual(self.player.vy, 5.0)
        self.player.speed -= 5
        self.assertAlmostEqual(50.0 ** 0.5 - 5, self.player.speed)
    
    def test_vx_property(self):
        self._test("vx", 0, 0, 0.0)
        self._test("vx", -1, 0, -1.0)
        self._test("vx", 5, 0, 5.0)
    
    def test_vy_property(self):
        self._test("vy", 0, 0, 0.0)
        self._test("vy", 0, 1, -1.0)
        self._test("vy", 1, 1, -1.0)
        self._test("vy", 5, -5, 5.0)
    
    def test_q_property(self):
        self._test("q", 0, -1, pi / 2)
        self._test("q", 1, -1, pi / 4)
        self._test("q", -1, 1, 5.0 / 4.0 * pi)
        self._test("q", 1, 1, -pi / 4)
        self._test("q", 1, -1, pi / 4)
        self._test("q", 4.2853005597800975e-15, 69.98426914215088, -pi / 2)
