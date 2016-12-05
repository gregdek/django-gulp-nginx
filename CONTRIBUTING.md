# Contributing 

### Rebuilding images

We suggest running `make build`, if you find you want to rebuild the images. This will remove existing containers and delete the postgres data volume.

### Makefile commands

For convenience a Makefile is included, providing the following commands:

clean
> Remvoes all containers, images and volumes.

build
> Removes existing containers for this project, deletes the postgres data volume, and kicks off a build.

build_debug
> Same as build, but adds the --debug flag. Use in the event the build process is failing, and you can't figure out what's causing the problem.

build_from_scratch
> Removes existing containers and images for this project, deletes the postgres data volume, and kicks off a build. 

run
> Run the demo in development mode in the foreground, so that container output is streamed to your terminal window.

run_detached
> Run the demo in development mode in the background.

run_prod
> Run the app in production mode in the background. This will cause the gulp container to stop and the nginx container to run. Useful for testing how the app will behave when deployed to Kubernetes or OpenShift.

stop
> Stop all running containers associated with the project.

django_manage
> When the application is running, use to execute a management command on the django container

django_exec
> When the application is running, open an interactive session on the django container.

gulp_build
> When the application is running in development mode, executs `gulp build` on the gulp container to rebuild static assets.

