# coding: utf-8
from flask import abort, request, render_template, session
from hashlib import md5
from space_king import app, settings
from space_king.models.user import add_service_to_user, get_user_by_service, User

import random


def socket_url():
    return "http://{addr}:{port}/game".format(
        addr=request.host.split(':')[0],
        port=random.choice(settings.SOCKETSERVER_PORTS)
    )


@app.route("/")
def index():
    user_pk = session.get("user_pk")
    user_info = {}
    if user_pk:
        user = User(pk=user_pk)
        user_info = user.short_info
    return render_template(
        "index.html",
        socket_url=socket_url(),
        settings=settings,
        uinfo=user_info
    )


@app.route("/vk-iframe")
def vk_iframe():
    user_pk = session.get("user_pk")

    if user_pk is None:
        # check auth_key
        auth_key = request.args.get("auth_key", "")
        viewer_id = request.args.get("viewer_id", "")

        vk_hash = md5("_".join([
            settings.VK_APP_ID,
            viewer_id,
            settings.VK_API_SECRET
        ])).hexdigest()
        if vk_hash == auth_key:
            user = get_user_by_service("vkontakte", request.args.get("viewer_id"))
            if user is None:
                user = User()
                add_service_to_user("vkontakte", request.args.get("viewer_id"), user.pk)
            session["user_pk"] = user.pk
        else:
            abort(403)
    else:
        user = User(pk=user_pk)

    return render_template(
        "vk_iframe.html",
        socket_url=socket_url(),
        settings=settings,
        uinfo=user.short_info
    )
