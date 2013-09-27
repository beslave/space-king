# coding: utf-8
from libs.redis_storage import db1


class User(object):

    def __init__(self, **kwargs):
        pk = kwargs.get("pk") or db1.incr("new_user_id")
        kwargs["pk"] = pk
        db1.hmset("user::{}".format(pk), kwargs)
        super(User, self).__setattr__("pk", pk)
        super(User, self).__setattr__("__info__", db1.hgetall(self.db_key) or {})

    @property
    def db_key(self):
        return "user::{}".format(self.pk)

    def __setattr__(self, attr, value):
        self.__info__[attr] = value
        db1.hset(self.db_key, attr, value)

    def __getattr__(self, attr):
        return self.__info__.get(attr)


def get_user_by_service(service, service_user_id):
    user_pk = db1.get("{}_user_id::{}".format(service, service_user_id))
    if user_pk:
        return User(pk=user_pk)


def add_service_to_user(service, service_user_id, user_pk):
    db1.set("{}_user_id::{}".format(service, service_user_id), user_pk)
    user = User(pk=user_pk)
    setattr(user, "{}_user_id".format(service), service_user_id)
