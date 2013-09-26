# coding: utf-8
from flask import abort, request, render_template, session
from hashlib import md5
from libs.redis_storage import db1
from space_king import app, settings

import random


def socket_url():
    return "ws://{addr}:{port}/game".format(
        addr=request.host.split(':')[0],
        port=random.choice(settings.SOCKETSERVER_PORTS)
    )


@app.route("/")
def index():
    return render_template(
        "index.html",
        socket_url=socket_url(),
        settings=settings,
        uinfo={}
    )


@app.route("/vk-iframe")
def vk_iframe():
    user_id = session.get("user_id")
    if user_id is None:
        # check auth_key
        auth_key = request.args.get("auth_key")
        viewer_id = request.args.get("viewer_id")

        vk_hash = md5("_".join([
            settings.VK_APP_ID,
            viewer_id,
            settings.VK_API_SECRET
        ])).hexdigest()
        if vk_hash == auth_key:
            user_id_vk = request.args["user_id"]
            user_id = db1.get("vkontakte_user_id::{}".format(user_id_vk))
            if user_id is None:
                user_id = db1.incr("new_user_id")
                db1.set("vkontakte_user_id::{}".format(user_id_vk), user_id)
                db1.hmset("user::{}".format(user_id), {
                    "id": user_id,
                    "id_vk": user_id_vk
                })
            session["user_id"] = user_id
        else:
            abort(403)
    user_fields = ["first_name", "last_name", "avatar", "sex", "country", "city", "last_update"]
    fields_values = db1.hmget("user::{}".format(user_id), user_fields)
    info = dict(zip(user_fields, fields_values))
    return render_template(
        "vk_iframe.html",
        socket_url=socket_url(),
        settings=settings,
        uinfo=info
    )
