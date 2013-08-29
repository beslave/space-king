# coding: utf-8
from flask import Flask


app = Flask("__main__")
app.config.from_object("space_king.site_settings")


from . import views