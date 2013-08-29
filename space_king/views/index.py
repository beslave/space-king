# coding: utf-8
from flask import request, render_template
from space_king import app


@app.route("/")
def index():
    return render_template("index.html")
