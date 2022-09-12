# fx-nx-prisma-stack (WIP)

An example full-stack web-app project written in TypeScript and powered by NextJS (UI) + NestJS (API) with data persistence provided via Prisma + Postgres.

The project is organized as a monorepo managed via the [Nx build system](https://nx.dev) with yarn serving as the node package manager.

The React front-end leverages react-query + react-hook-form and is styled using TailwindCSS.

**Work-in-Progress**

> This repo was created as an exercise by the author to build familiarity with Prisma, react-hook-form, react-query, and other libraries that are popular in the TypeScript + NodeJS + React ecosystems. I haven't had the opportunity to substantially work with these libraries yet in professional projects vs. their popular alternatives such as TypeORM, formik, etc.

The code is far enough along that it can serve as a full-stack project starter that — at the time of writing — incorporates some of the best-known libraries in the TypeScript ecosystem.

As of **2022-Q3** this is an active project that is being contributed to on a casual basis. The goal is to realize a viable reusable project boilerplate / 'SaaS starter' that includes several production-grade niceties and is ready to support a broad range of business and product ideas.

## Development

Refer to `package.json` for the complete suite of script targets.

### Prerequisites

This project should be run in linux/unix-based development environments such as linux (Windows users may use linux via WSL2) or MacOS.

- Ensure nodejs + docker (with `docker compose`) + yarn v3+ are installed on your workstation
- Create `.env` files based on the provided `.env.sample` files: substitute in the appropriate credentials as required, replacing any placeholder values.
  - Do this in the project root folder and for each of the project's apps: `apps/api/.env` and `apps/ui/.env`.
  - Ensure that `.env` files and any secrets or keys are _not_ committed to git or shared in any way
- Install project dependencies by running `yarn` from the root of the project folder

### Docker

Run `yarn docker:up` to start development dependencies (postgres) via `docker compose`.

Stop the containers with `yarn docker:down` (this command is equivalent to `docker compose down`).

### Local development server

Start the UI (NextJS) and API (NestJS) development servers via nx with: `yarn start`.

The UI will start on <http://localhost:4200/> with the back-end API available at <http://localhost:4200/api> via proxy.

The back-end API runs on port 3333.

Stop/restart the development servers after making significant changes to project structure, and after installing/updating/removing any package dependencies.

### Working with Prisma

Refer to the Prisma docs to understand the [developer workflow](https://www.prisma.io/docs/guides/database/developing-with-prisma-migrate).

Prisma can be managed via the following scripts:

- `yarn prisma:generate`
- `yarn prisma:migrate:dev`
- `yarn prisma:migrate`
- `yarn prisma:migrate:reset`
- `yarn prisma:db:push`
- `yarn prisma:db:seed`

Running these scripts via `yarn` ensures that the correct `schema.prisma` file and `.env` file is used.

Start the Prisma Studio GUI editor with `yarn prisma:studio`.

## Project build

Run `yarn build` to build the entire project, or `nx build <APP_NAME>` to build a specific app (replace `<APP_NAME>` with `ui` or `api`. Add the `--prod` flag to create a production-optimized build.

The build outputs to the `dist/` folder.

The nx config `project.json` for each of the `api` + `ui` apps includes the `generatePackageJson: true` flag to produce an app-specific `package.json` in the corresponding app dist folders.

## Docker build

This project implements a multi-stage build.

In the project root folder:

- `Dockerfile` installs all dependencies in the monorepo and can get quite large
- `docker-compose.yml` specifies a build for the `api` service and its dependencies and references the API app's Dockerfile in `apps/api/Dockerfile`.

The stages in the API app's Dockerfile are to reduce the final image size and prevent any secrets required for the build from ending up in the cache or history of production images.

The image build process works as follows:

- root Dockerfile creates common base image `fx/project-base:nx-base`
- api `base` image produces a production build
- api `build` image copies the production build and installs only the api's production dependencies
  - this discrete step ensures any build secrets such as GitHub tokens and special access keys stay in this layer
- api `production` image copies what's needed for production and runs the api

### API image build

#### Ad-hoc deployment of API image

Refer to the helper script `scripts/workflow/api-build-push.sh` to build the API Docker image, tag it, push to ECR, and trigger ECS to update the container service.

To push to ECS, the target AWS ECR repository must exist (i.e. you must have infra deployed), and you must be logged into Docker with credentials that correspond to the ECR repo (refer to `scripts/workflow/docker-ecr-login.sh`).

#### Manual build of API image

Use the command below to manually build the api image using `docker compose`:

```sh
# (re)build api image
docker compose build api
```

In troubleshooting or major-change scenarios, it can be helpful to rebuild the image without cache:

```sh
# troubleshooting -- (re)build api image without cache
docker compose build api --no-cache

# troubleshooting -- (re)build api image without cache + fresh pull of base image
docker compose build api --no-cache --pull
```

To run the image in a container, ensure the local api dev server is off and that the local dev postgres database is running, then run:

```sh
docker compose up api
```

## Infra / Deployment with AWS CDK

The 'infra' app (`apps/infra`) is an Infrastructure-as-Code (IaC) solution implemented in AWS CDK for the deployment of this project to AWS.

The CDK project is integrated with the Nx project monorepo so it must be built prior to running any cdk commands:

```sh
yarn build:infra
```

You can then run cdk commands directly, via `npx`, or via the convenience script targets in `package.json`:

- `yarn cdk:synth [STACK_NAME]`
- `yarn cdk:deploy [STACK_NAME]`
- `yarn cdk:destroy [STACK_NAME]`

After deploying changes, you may need to invalidate the CloudFront cache to see the latest. Be sure to rule out cache issues before investing time in debugging issues with the app itself.

```sh
aws cloudfront create-invalidation --distribution-id [CLOUDFRONT_DISTRIBUTION_ID]
```

Refer to the docs for flags that can add more nuance and specificity to the cache invalidation request. For example, you may only wish to invalidate the cache for certain paths:

```sh
aws cloudfront create-invalidation --distribution-id [CLOUDFRONT_DISTRIBUTION_ID] --paths "/example/*"
```

### Infra Prerequisites

You must have a valid AWS account and the AWS CLI installed and configured with a profile for your AWS account.

> If you have multiple AWS account profiles: add the `--profile PROFILE_NAME` flag to any `cdk` commands (similar to the aws cli) to specify a different profile than your default.

You must also ensure CDK has been bootstrapped in both your preferred AWS region (e.g. ca-central-1) and us-east-1. The us-east-1 region is required for certain resources including CloudFront, Edge Lambdas, etc.

Refer to the docs for CDK to learn how to bootstrap an AWS environment.

## Nx Workspace

Nx supports many plugins that add tools and capabilities for developing different types of applications. Capabilities include generating applications, libraries, etc as well as the devtools to test, and build projects as well.

Nx core plugins:

- [React](https://reactjs.org)
  - `npm install --save-dev @nrwl/react`
- Web (no framework frontends)
  - `npm install --save-dev @nrwl/web`
- [Angular](https://angular.io)
  - `npm install --save-dev @nrwl/angular`
- [Nest](https://nestjs.com)
  - `npm install --save-dev @nrwl/nest`
- [Express](https://expressjs.com)
  - `npm install --save-dev @nrwl/express`
- [Node](https://nodejs.org)
  - `npm install --save-dev @nrwl/node`

There are also many [community plugins](https://nx.dev/community).

Running generators:

- To generate a new application within the project workspace, run `nx g @nrwl/react:app my-app` or use a plugin.
- To generate a new library, run `nx g @nrwl/react:lib my-lib` or use a plugin.
- To generate a new React component via nx generator, run `nx g @nrwl/react:component my-component --project=my-app`.

Libraries are shareable across libraries and applications. They can be imported via `@fx-nx-prisma-stack/my-lib`. Nx automatically manages the dependencies within the project.

Run `nx graph` to generate a diagram of the dependencies within the workspace.

## Acknowledgements

- Theodorus Clarence for the foundations of reusable form input components compatible with react-hook-form (distributed under MIT license):

  - <https://github.com/theodorusclarence/ts-nextjs-tailwind-starter>
  - <https://github.com/theodorusclarence/expansion-pack>

- <https://github.com/algoan/nestjs-components/blob/master/packages/logging-interceptor/src/logging.interceptor.ts>
