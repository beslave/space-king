# coding: utf-8
from flask import Flask
from libs import PROJECT_DIR

import os


app = Flask(
    "__main__",
    template_folder=os.path.join(PROJECT_DIR, "templates"),
    static_folder=os.path.join(PROJECT_DIR, "static")
)

app.config.from_object("space_king.settings")

from . import views
