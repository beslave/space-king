# coding: utf-8
from flask import render_template
from space_king import app

@app.route("/contacts.html")
def contacts():
    return render_template("contacts.html")