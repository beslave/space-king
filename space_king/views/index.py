# coding: utf-8
from flask import request, render_template
from space_king import app, settings

import random


@app.route("/")
def index():
    socket_url = "ws://{addr}:{port}/game".format(
        addr=request.host.split(':')[0],
        port=random.choice(settings.SOCKETSERVER_PORTS)
    )
    return render_template("index.html", socket_url = socket_url)
