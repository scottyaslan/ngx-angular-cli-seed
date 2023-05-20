
# Setting up link between ngx-angular-cli-seed and ngx-design-system-seed

    npm run sync:link

Links ngx-design-system-seed source with ngx-angular-cli-seed platform (hard link). A change in either repo will reflect in another, too.

    npm run sync:reset

Copies ngx-design-system-seed source into ngx-angular-cli-seed platform. They are now identical but NOT linked together.

    npm run sync:disable

Deletes ngx-design-system-seed source from ngx-angular-cli-seed platform. Now you can try the app with the released version of ngx-design-system-seed installed into node_modules as defined in the `package.json`.

    npm run sync:reset:reverse

Copies ngx-angular-cli-seed platform/ngx-design-system-seed directory into ngx-design-system-seed repository. They are now identical but NOT linked together.
You can use this command if you already have touched ngx-design-system-seed code in ngx-angular-cli-seed but didn't yet hardlinked the two repos together.

    npm run sync:status

Git status of both repository, for convenience.

### Custom configuration of ngx-design-system-seed path

If ngx-angular-cli-seed and ngx-design-system-seed aren't checked out next to each other into the same directory,
you can create a `sync-ngx-design-system-seed.config.json` file (ignored by git) in `scripts/sync-ngx-design-system-seed`
and define the absolute path to the platform directory in ngx-design-system-seed repository:

    {
        "path-to-platform": "/projects/ngx-design-system-seed/webapp/platform"
    }
