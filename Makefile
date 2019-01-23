run:
	docker-compose up -d

build:
	docker-compose build server1 server2
	docker-compose up --no-deps -d server1 server2
