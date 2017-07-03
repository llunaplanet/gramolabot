dockerize:
	docker build -t davidlluna/gramolabot . --build-arg node_env=development
run:
	docker run -it davidlluna/gramolabot

dev:
	docker-compose -p gramolabot up

dev_with_tunnel:
	docker-compose -p gramolabot -f docker-compose.yml -f docker-compose.tunnel.yml up

rebuild:
	docker-compose -p gramolabot -f docker-compose.yml -f docker-compose.tunnel.yml build

clean:
	docker-compose -p gramolabot -f docker-compose.yml -f docker-compose.tunnel.yml down

backup_dynammo:
	docker cp gramolabot_dynamodb:/var/dynamodb_local ./test/fixtures/dynamodb_local

configure_resolver:
	sudo echo "nameserver 127.0.0.1" | sudo tee /etc/resolver/docker.local
