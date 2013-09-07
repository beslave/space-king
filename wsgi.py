from os import getcwd, path

import sys


DIR = path.dirname(path.realpath(__file__))

activate_this = path.join(DIR, 'env/bin/activate_this.py')
execfile(activate_this, dict(__file__=activate_this))

sys.path.insert(0, DIR)

from space_king import app as application
