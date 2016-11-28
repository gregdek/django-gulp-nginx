#!/bin/bash 

set -x

if [[ $@ == *"gunicorn"* || $@ == *"runserver"* ]]; then
    if [ -f ${DJANGO_ROOT}/manage.py ]; then
        ansible-playbook /startup/migrate.yml -i /startup/inventory
    fi
fi

exec "$@"
