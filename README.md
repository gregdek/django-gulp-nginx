# django-gulp-nginx

[![Build Status](https://travis-ci.org/chouseknecht/django-gulp-nginx.svg?branch=master)](https://travis-ci.org/chouseknecht/django-gulp-nginx)

A web application built using [Ansible Container](https://github.com/ansible/ansible-container). The application includes 
restful API backend built with Django, and a single page application (SPA) on the frontend built with AngularJS. Together they 
ombine to create a simplistic social media app called *Not Goolge Plus*, where you can register, update your profile, and share 
your thoughts with the world. 

To view the demo start by setting up your development environment. Later, after you've made some changes, run the application in 
testing mode, and finally deploy your changes to the cloud using a local OpenShift instance. The application may sound simple, but 
it incorporates the architecture and tools typical of a modern web app, allowing you to see first hand how Ansible Container makes 
it easy to manage a containerized app through the full lifecycle.

## Requirements

Before you can see the demo live, in your development environment, you'll need a couple things:

 - Ansible Container installed from source. See our [Running from source guide](http://docs.ansible.com/ansible-container/installation.html#running-from-source) for assistance.  
 - Docker Engine or Docker for Mac.

## Getting Started

### Copy the project

To get started, use the Ansible Container `init` command to create a local copy of this project. In a terminal window, run the 
following commands to create your copy: 

```
# Create a directory called 'demo'
$ mkdir demo

# Set the working directory to demo
$ cd demo

# Initialize the project with the demo
$ ansible-container init chouseknecht.django-gulp-nginx 
```

You now have a copy of the project in a directory called *demo*. Inside *demo/ansible* you'll find a `container.yml` file 
describing in Docker Compose the services that make up the application, and an Ansible playbook called `main.yml` file that contains 
a set of plays for building the application images. 

### Build the images

To run the application you first need to build the images. Start the build by running the following command:

```
$ ansible-container build
```
The build process launches a container for each service along with a build container. For each service container, the base image is the 
image specified in `container.yml`. The build container runs the `main.yml` playbook, and executes tasks on each of the containers. You'll 
see output from the playbook run in your terminal window as it progresses through the tasks. When the playbook completes, each image will
be `committed`, creating a new set of base images.

When execution stops, use the `docker images` command to view the set of images:

```


```

### Run the application

Now that you have the application images in your environent, you can run th application and log into *Not Google Plus*. Run the following
command to start the application:

```
$ ansible-container run
```
You should now see the output from each container streaming in your terminal window. The containers are running in the foreground. They are
running in *development mode*, which means that for each service the *dev_overrides* directive is being included in the configuration. For example,
take a look at the *gulp* service definition found in `container.yml`:

```
  gulp:
    image: centos:7
    user: '{{ NODE_USER }}'
    working_dir: '{{ NODE_HOME }}'
    command: ['/bin/false']
    environment:
      NODE_HOME: '{{ NODE_HOME }}'
    volumes:
      - "${PWD}:{{ NODE_HOME }}"
    dev_overrides:
      command: [/usr/bin/dumb-init, /usr/bin/gulp]
      ports:
      - 8080:{{ GULP_DEV_PORT }}
      - 3001:3001
      links:
      - django
    options:
      kube:
        state: absent
      openshift:
        state: absent
```

In development *dev_overrides* takes precedence, so the command ``/usr/bin/dumb-init /usr/bin/gulp* will be executed, ports 8080 and 3001 
will be exposed, and the container will be linked to the *django* service container.

If you were to tun the *gulp* service in production, *dev_overrides* would be ignored completely. In production the ``/bin/false`` command will be executed, 
causing the container to immediately stop. No ports would be exposed, and the container would not be linked to the django container.

Since the frontend tools gulp and browsersync are only needed during development and not during production, we use *dev_overrides* to manage 
when the container executes.

The same is true for the nginx service. Take a look at the service definition in `container.yml`, and you'll notice it's configured opposite of 
the gulp service:

```
  nginx:
    image: centos:7
    ports:
    - {{ DJANGO_PORT }}:8000
    user: nginx
    links:
    - django
    command: ['/usr/bin/dumb-init', 'nginx', '-c', '/etc/nginx/nginx.conf']
    dev_overrides:
      ports: []
      command: /bin/false
    options:
      kube:
        runAsUser: 1000
```

In development the nginx service runs the ``/bin/false`` command, and immediately exits. But in production it starts the 
``nginx`` process, and takes the place of the gulp service as the application's web server.

## Log in and share your thoughts

Now that you have the application running, lets check it out!

### Register

Click the *Register* link at the top right, and complete the form to create your account.







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

run_pdrod
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



