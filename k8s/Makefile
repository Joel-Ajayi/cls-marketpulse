TAG := $(shell git rev-parse --short HEAD)

.PHONY: render-production deploy-production delete-production migrate-local-db

# kluctl deploy -t production --include-deployment-dir "postgres"
render-production:
	kluctl render -t production -a image_tag=$(TAG) -I backend --print-all | yq

deploy-production:
	echo $(TAG)
	kluctl deploy -t production -a image_tag=$(TAG) -I backend_deploy --yes

delete-production:
	kluctl delete -t production --yes