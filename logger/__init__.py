# coding: utf-8
from collections import OrderedDict
from functools import wraps
from inspect import ismethod
from time import time


__LOGS__ = OrderedDict()


def logging_on(cls):
    if cls.__name__ not in __LOGS__:
        __LOGS__[cls.__name__] = OrderedDict()
    clog = __LOGS__[cls.__name__]   # Class log
    for method_name in dir(cls):
        method = getattr(cls, method_name, None)
        if not hasattr(method, "__call__"):
            continue
        if method_name.startswith("_"):
            continue
        mlog = clog[method_name] = [0, 0]   # Method log
        setattr(cls, method_name, _patch_method(mlog, method))
    return cls


def print_logs():
    print "*" * 100
    print "Logs:"
    for name, log in __LOGS__.iteritems():
        print "{:=^100}".format(name.upper())
        for func, params in log.iteritems():
            print "{func:.>37s}: {time:0>15.6f} ({numbers:0>10d} -> {once_time:12.9f} seconds per call)".format(
                func=func,
                numbers=params[0],
                time=params[1],
                once_time=params[1] / params[0] if params[0] > 0 else float('inf')
            )
        print


def _patch_method(log, method):
    @wraps(method)
    def patched_method(*a, **k):
        start = time()
        rez = method(*a, **k)
        end = time()
        log[:] = log[0] + 1, log[1] + end - start
        return rez
    if not ismethod(method):
        return staticmethod(patched_method)
    if method.__self__:
        return classmethod(patched_method)
    return patched_method
