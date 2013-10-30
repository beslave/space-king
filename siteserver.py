# coding: utf-8
from space_king import app as SITE_APP, settings


if __name__ == '__main__':
    SITE_APP.run(port=settings.SITE_PORT, host='0.0.0.0')
