# coding: utf-8
from redis import ConnectionPool, Redis
from space_king import settings


cache_prefix = getattr(settings, 'REDIS_PREFIX', '')


def prepare_key(key):
    return cache_prefix + key


redis_methods_with_key = [
    'append',
    'bitcount',
    'decr',
    'dump',
    'exists',
    'expire',
    'expireat',
    'get',
    'getbit',
    'getrange',
    'getset',
    'incr',
    'incrby',
    'incrbyfloat',
    'move',
    'persist',
    'pexpire',
    'pexpireat',
    'psetex',
    'pttl',
    'restore',
    'set',
    'setbit',
    'setex',
    'setnx',
    'setrange',
    'strlen',
    'substr',
    'ttl',
    'type',

    # LIST COMMANDS
    'lindex',
    'linsert',
    'llen',
    'lpop',
    'lpush',
    'lpushx',
    'lrange',
    'lrem',
    'lset',
    'ltrim',
    'rpop',
    'rpush',
    'rpushx',
    'sort',

    # SET COMMANDS
    'sadd',
    'scard',
    'sismember',
    'smembers',
    'spop',
    'srandmember',
    'srem',

    # SORTED SET COMMANDS
    'zadd',
    'zcard',
    'zcount',
    'zincrby',
    'zrange',
    'zrangebyscore',
    'zrank',
    'zrem',
    'zremrangebyrank',
    'zremrangebyscore',
    'zrevrange',
    'zrevrangebyscore',
    'zrevrank',
    'zscore',

    # HASH COMMANDS
    'hdel',
    'hexists',
    'hget',
    'hgetall',
    'hincrby',
    'hincrbyfloat',
    'hkeys',
    'hlen',
    'hset',
    'hsetnx',
    'hmset',
    'hmget',
    'hvals'
]

""" ???
delete
mget
mset
msetnx
rename
renamenx
watch
blpop
brpop
brpoplpush
rpoplpush
sdiff
sdiffstore
sinter
sinterstore
smove
sunion
sunionstore
zinterstore
zunionstore
_zaggregate
"""


def prepare_methods_with_key(cls):
    for method in redis_methods_with_key:
        old = getattr(cls, method)

        def new_method(self, key, *a, **k):
            key = prepare_key(key)
            return old(self, key, *a, **k)

        setattr(cls, method, new_method)
    return cls


@prepare_methods_with_key
class LocalRedis(Redis):

    pass
