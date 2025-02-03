run:
	@nodemon

jwt:
	@node ./src/generate-token.js

start-redis:
	@redis-server  ./redis.conf --port 6380