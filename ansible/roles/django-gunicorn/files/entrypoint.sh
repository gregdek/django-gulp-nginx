#!/bin/bash 

set -x

if [[ $@ == *"gunicorn"* || $@ == *"runserver"* ]]; then
    if [[ $@ == *"runserver"* ]]; then
        for f in ${DJANGO_ROOT}/dist/*
        do
            file=$(basename $f)
            if [[ $file != 'bower_components' && $file != 'admin' && $file != 'rest_framework' ]]; then
                rm -rf $f
            fi
        done
    fi
    if [ -f ${DJANGO_ROOT}/manage.py ]; then
        /usr/bin/wait_on_postgres.py 
        if [ "$?" == "0" ]; then
            ${DJANGO_VENV}/bin/python manage.py migrate --noinput           
        fi
    fi
fi

exec "$@"
