# coding: utf-8
from flask import abort, request, make_response, session
from space_king import app
from space_king.models.user import User
from time import time


SERVICES = {
    "vkontakte": {
        "last_name": ("last_name", lambda x: x.decode('utf-8')),
        "first_name": ("first_name", lambda x: x.decode('utf-8')),
        "photo_100": ("avatar", lambda x: x.decode('utf-8')),
        "sex": ("sex", lambda x: "f" if int(x) == 0 else "m")
    }
}


@app.route('/update_profile_from_<service>', methods=['POST'])
def update_(service):
    user_pk = session.get('user_pk')
    if not user_pk or service not in SERVICES:
        abort(403)
    info = {}
    for sfield, x in SERVICES[service].iteritems():
        if request.form.get(sfield):
            info[x[0]] = x[1](request.form[sfield]) if x[1] else request.form[sfield]
    User(pk=user_pk, last_update=int(1000 * time()), **info)
    return make_response('', 202)
