# coding: utf-8
from libs.redis_storage import db1


class User(object):

    def __init__(self, **kwargs):
        pk = kwargs.get('pk') or db1.incr('new_user_id')
        kwargs['pk'] = pk
        db1.hmset('user::{}'.format(pk), kwargs)
        super(User, self).__setattr__('pk', pk)
        super(User, self).__setattr__(
            '__info__',
            db1.hgetall(self.db_key) or {}
        )

    @property
    def short_info(self):
        return {field: getattr(self, field) for field in [
            'fio',
            'sex',
            'avatar',
            'battles',
            'wins',
            'defeats',
            'last_update'
        ]}

    @property
    def db_key(self):
        return 'user::{}'.format(self.pk)

    @property
    def fio(self):
        return '{} {}'.format(self.last_name or '', self.first_name or '')

    @property
    def battles(self):
        return int(self.__info__.get('battles', 0))

    @property
    def wins(self):
        return int(self.__info__.get('wins', 0))

    @property
    def defeats(self):
        return int(self.__info__.get('defeats', 0))

    @property
    def last_update(self):
        return int(self.__info__.get('last_update', 0))

    def __setattr__(self, attr, value):
        self.__info__[attr] = value
        db1.hset(self.db_key, attr, value)

    def __getattr__(self, attr):
        return self.__info__.get(attr)

    def incr(self, attr, by=1):
        db1.hincrby(self.db_key, attr, by)


def get_user_by_service(service, service_user_id):
    user_pk = db1.get('{}_user_id::{}'.format(service, service_user_id))
    if user_pk:
        return User(pk=user_pk)


def add_service_to_user(service, service_user_id, user_pk):
    db1.set('{}_user_id::{}'.format(service, service_user_id), user_pk)
    user = User(pk=user_pk)
    setattr(user, '{}_user_id'.format(service), service_user_id)
