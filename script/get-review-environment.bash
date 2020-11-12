#!/usr/bin/env bash
set -e

if [ -z "$GITHUB_ACCESS_TOKEN" ]
then
  >&2 echo "\$GITHUB_ACCESS_TOKEN must be set"
  exit 1
fi

function github {
  response=$(curl -s -H "Authentication: token $GITHUB_ACCESS_TOKEN" "https://api.github.com/$1")
  echo "https://api.github.com/$1">&2
  echo "$response">&2
  echo "$response"
}

if [ -z "$GIT_REF" ]
then
  GIT_REF=$(git rev-parse HEAD)
fi

WAIT_MINUTES=10
until [ $WAIT_MINUTES -eq 0 ] || [ "$(github "repos/openstax/rex-web/deployments?sha=$GIT_REF" | jq -r '.[0].task')" == "deploy" ]; do
  echo "sleeping 1m">&2
  sleep 60
  WAIT_MINUTES=$(( WAIT_MINUTES - 1 ))
done

pr_deployment_id=$(github "repos/openstax/rex-web/deployments?sha=$GIT_REF" | jq -r '.[0].id // ""')

if [ -z "$pr_deployment_id" ]; then
  echo "No deployment exists for this pr.">&2
  exit 1;
fi;

WAIT_MINUTES=10
until [ $WAIT_MINUTES -eq 0 ] || [ "$(github "repos/openstax/rex-web/deployments/$pr_deployment_id/statuses" | jq -r .[0].state)" == "success" ]; do
  echo "sleeping 1m">&2
  sleep 60
  WAIT_MINUTES=$(( WAIT_MINUTES - 1 ))
done

if [ "$NEXT_WAIT_TIME" -lt 1 ]; then
  echo "timed out">&2
  exit 1
fi;

url=$(github "repos/openstax/rex-web/deployments/$pr_deployment_id" | jq -r '.payload.web_url|rtrimstr("/")')

echo "found url: $url">&2

echo "$url"
