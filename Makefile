.PHONY: run jwt start-redis seed

run:
	@nodemon

jwt:
	@node ./src/generate-token.js

start-redis:
	@redis-server  ./redis.conf --port 6380

seed: 
	@node ./src/seed.js