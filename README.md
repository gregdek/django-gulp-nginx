# django-gulp-nginx

[![Build Status](https://travis-ci.org/chouseknecht/django-gulp-nginx.svg?branch=master)](https://travis-ci.org/chouseknecht/django-gulp-nginx)

Simple Django web application to demo [Ansible Container](https://github.com/ansible/ansible-container).

Ansible Container makes it possible to build container images using Ansible Playbooks rather than Dockerfile, and
provides the tools you need to manage the complete container lifecycle from development to deployment.

With Ansible Container you get: 

- Tools you already know: Ansible and Docker Compose
- Highly reusable code by way of Ansible roles
- Easy to read and understand image build instructions contained in an playbook
- Repeatable and testable image build process
- A single orchestration document with settings for development and production
- Auto-generated deployment role and playbook  

## Requirements

[Ansible Container](https://github.com/ansible/ansible-container)

Ansible Container requires access to a running Docker Engine or Docker Machine. For help with the installation, see
our [installation guide](http://docs.ansible.com/ansible-container/installation.html).


## Running the demo locally 

To run this app locally, create a project directory, and initialize it using Ansible Container. Pass the name of this
project to the `init` command, and you'll instantly have a ready-to-go application:

```
# Create a demo directory
$ mkdir demo

# Set the working directory to demo
$ cd demo

# Initialize the project with the demo
$ ansible-container init chouseknecht.django-gulp-nginx 
```

Now from your project directory build the images:

```
$ ansible-container build
```

And finally, from your project directory run the app:

```
$ ansible-container run
```

### Rebuilding images

We suggest running `make build`, if you find you want to rebuild the images. This will remove existing containers and delete the postgres data volume.

### Makefile commands

For convenience a Makefile is included, providing the following commands:

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
> Run the demo in production mode in the background. This will cause the gulp container to stop and the nginx container to run. Useful for testing how the app will behave when deployed to Kubernetes or OpenShift.

stop
> Stop all running containers associated with the project.

## Deploying the demo to OpenShift

This app can also be used to demonstrate how easy it is to deploy an Ansible Container project to OpenShift. 

Before running the deployment you'll need the following:

- The images for this project built locally
- Access to an OpenShift instance

### Building the images locally

To run the demo project on OpenShift you'll first need to build the images locally. If you already completed the steps above in *Running the demo locally*, and you didn't remove the images, you can skip this part. 

If you need to build the images, here's how:

```
# Create a demo directory
$ mkdir demo

# Set the working directory to demo
$ cd demo

# Initialize the project with the demo
$ ansible-container init chouseknecht.django-gulp-nginx
  
# Build the images
$ ansible-container build
```

### Creating a local OpenShift instance

If you do not have access to an OpenShift instance, follow our [guide to creating an OpenShift instance](http://docs.ansible.com/ansible-container/configure_openshift.html). It's not as scary as it may sound. Within a few minutes you'll have OpenShift running in Docker containers in your dev environment.

### Running the deploymnet

You should now have the images built locally and a running OpenShift instance. The next step is to create a new project *django-gulp-nginx*, and push the images to the project registry. Run the following commands, replacing the IP address of the registry with your IP:

```
# Create an OpenShift project that matches the local project name 
$ oc new-project django-gulp-nginx

# Push images to the OpenShift registry
$ ansible-container push --push-to https//192.168.30.14.xip.io/django-gulp-nginx
``` 

Next, generate the deployment playbook and role by runnint the following, again replacing the IP address of the registry with the correct IP for your environment:

```
# Generate the deployment playbook and role
$ ansible-playbook shipit openshift --pull-from https//192.168.30.14.xip.io/django-gulp-nginx
```

And finally, run the playbook by executing the following:

```
# Set the working directory to ansible
$ cd ansible

# Execute the playbook
$ ansible-playbook shipit-openshift.yml 
```



