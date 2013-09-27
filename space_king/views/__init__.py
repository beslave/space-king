# coding: utf-8
from contacts import *
from game import *
from profile import *

from flask import abort, request, session
from libs import random_string
from space_king import app


# Enable CSRF protection 
@app.before_request
def csrf_protect():
    if request.method == "POST":
        token = session.pop('_csrf_token', None)
        if not token or token != request.form.get('_csrf_token'):
            abort(403)

def generate_csrf_token():
    if '_csrf_token' not in session:
        session['_csrf_token'] = random_string(48, 64)
    return session['_csrf_token']

app.jinja_env.globals['csrf_token'] = generate_csrf_token  