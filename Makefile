project_name = $(shell basename $$PWD) 

.PHONY: build build_from_scratch composer console clean demo run push stop

composer:
	docker exec -i -t ansible_symfony_1 /symfony/ansible/composer.sh $(filter-out $@, $(MAKECMDGOALS)) 

console:
	docker exec -i -t ansible_symfony_1 /symfony/ansible/console.sh $(filter-out $@, $(MAKECMDGOALS)) 

clean:
	@./ansible/clean.sh all
	docker volume rm ansible_postgres-data

build:
	@./ansible/clean.sh containers 
	-docker volume rm ansible_postgres-data
	ansible-container build

build_from_scratch: clean
	-docker volume rm ansible_postgres-data
	ansible-container build	

build_debug:
	@./ansible/clean.sh containers 
	-docker volume rm ansible_postgres-data
	ansible-container --debug build

run:
	ansible-container run

run_prod:
	ansible-container run --production

stop:
	ansible-container stop
