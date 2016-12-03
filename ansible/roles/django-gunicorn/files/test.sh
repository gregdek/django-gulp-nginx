#!/bin/bash

for f in ~/projects/django-gulp-nginx/dist/*
do
      file=$(basename $f) 
      if [[ $file != 'bower_components' && $file != 'admin' && $file != 'rest_framework' ]]; then
          echo $f
      fi  
done
