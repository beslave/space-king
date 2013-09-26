# coding: utf-8
from flask import request, render_template
from space_king import app, settings

import random


def socket_url():
    return "ws://{addr}:{port}/game".format(
        addr=request.host.split(':')[0],
        port=random.choice(settings.SOCKETSERVER_PORTS)
    )


@app.route("/")
def index():
    return render_template("index.html", socket_url=socket_url(), settings=settings)


@app.route("/vk-iframe")
def vk_iframe():
    return render_template("vk_iframe.html", socket_url=socket_url(), settings=settings)
