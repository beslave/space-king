# coding: utf-8
from flask import Flask
from flask.ext.assets import Environment, Bundle
from libs import PROJECT_DIR

import os


app = Flask(
    "__main__",
    template_folder=os.path.join(PROJECT_DIR, "templates"),
    static_folder=os.path.join(PROJECT_DIR, "static")
)

app.config.from_object("space_king.settings")

assets = Environment(app)
js_all = Bundle(
    'js/jquery-1.10.2.js',
    'js/sock.js',
    'js/message.js',
    'js/ship.js',
    'js/game.js',
    'js/menu.js',
    'js/display.js',
    'js/space_king.js',
    filters='jsmin',
    output='js/all.js'
)
css_all = Bundle(
    'css/style.css',
    filters='cssmin',
    output='css/all.css'
)
assets.register('js_all', js_all)
assets.register('css_all', css_all)

from . import views
