# coding: utf-8
from flask import Flask

import os


app = Flask(
    "__main__",
    template_folder=os.path.join(os.getcwd(), "templates"),
    static_folder=os.path.join(os.getcwd(), "static")
)
app.config.from_object("space_king.settings")
from . import views
