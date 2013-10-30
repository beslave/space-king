# coding: utf-8
from space_king import settings
from urllib import urlencode
from urllib2 import urlopen

import json


methods_url = u'https://api.vk.com/method'
access_token_url = u'https://oauth.vk.com/access_token'


def get_access_token():
    params = {
        'client_id': settings.VK_APP_ID,
        'client_secret': settings.VK_API_SECRET,
        'grant_type': u'client_credentials'
    }
    url = "{}?{}".format(access_token_url, urlencode(params))
    data = json.loads(urlopen(url).read())
    return data.get('access_token')


def get_method_url(method, parameters):
    parameters['access_token'] = get_access_token()
    parameters['client_secret'] = settings.VK_API_SECRET
    return '{}/{}?{}'.format(methods_url, method, urlencode(parameters))


def send_notification(message, user_ids):
    user_ids = user_ids if isinstance(user_ids, list) else [user_ids]
    results = []
    while user_ids:
        ids = user_ids[0:100]
        del user_ids[0:100]
        ids_key = 'user_ids' if len(ids) > 1 else 'user_id'
        url = get_method_url('secure.sendNotification', {
            ids_key: ','.join(ids),
            'message': message.encode('utf-8'),
            'v': settings.VK_VERSION
        })
        result = json.loads(urlopen(url).read())
        results.append(result)
    return results
