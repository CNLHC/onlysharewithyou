# Only Share With You

A simple utility to share something and prevent your info from being abused.

features:

- generate pdf with watermark text.
- end-to-end encryption
- share pdf with link (coming soon)

# On-Premise Deployment Guide

## Build Yourself

1. clone this repo

2. create a `.env` file in the root of the project for connecting to a `postgresql` instance.

```
PG_HOST=<HOST>
PG_USER=<USER>
PG_PW=<PW>
PG_DB=<DB>
PG_PORT=<PORT>
```

3. build the docker image

```
docker buildx build  --network=host --platform linux/amd64 -f Dockerfile -t onlysharewithyou:0.0 .
```

4. run and connect

```
docker run --rm -d -p 3000:3000 onlysharewithyou:0.0 .
```

## Use Pre-Built Image and `compose`

TBD
