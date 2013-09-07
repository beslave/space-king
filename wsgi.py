from os import getcwd, path

import sys

activate_this = path.join(getcwd(), 'env/bin/activate_this.py')
execfile(activate_this, dict(__file__=activate_this))

sys.path.insert(0, getcwd())

from space_king import app as application

