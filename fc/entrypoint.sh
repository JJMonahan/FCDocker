#!/bin/sh

#echo "------------------ showmigrations -----------------------"
#python manage.py showmigrations
echo "------------------ makemigrations -----------------------"
python manage.py makemigrations
#echo "------------------ showmigrations -----------------------"
#python manage.py showmigrations
echo "------------------ migrate ------------------------------"
python manage.py migrate
echo "------------------ showmigrations -----------------------"
python manage.py showmigrations
echo "------------------ collect static ------------------------"
python manage.py collectstatic --noinput
echo "------------------ light 'er up!  ------------------------"
gunicorn fc.wsgi:application --bind 0.0.0.0:8000 --config gunicorn_config.py
