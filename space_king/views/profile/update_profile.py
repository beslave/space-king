# coding: utf-8
from flask import abort, request, make_response, session
from libs.redis_storage import db1
from space_king import app, settings


@app.route("/update_profile_from_<service>", methods=["POST"])
def update_(service):
    print request.form
    return make_response("", 202)
