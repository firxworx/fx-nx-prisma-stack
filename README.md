# fx-nx-prisma-stack

A full-stack example TypeScript project in powered by NextJS + NestJS with data persistence via Prisma + Postgres.

The front-end leverages react-query + react-hook-form and is styled using TailwindCSS.

This project's monorepo is managed by the [Nx build system](https://nx.dev) using yarn as the package manager.

This repo was created as an exercise to build greater personal familiarity with Prisma, react-hook-form, react-query, and others that are popular yet I haven't had the opportunity to work with very much. The code can serve as a full-stack project starter that — at the time of writing — incorporates some of the best projects in the TypeScript ecosystem.

## Development

Run `yarn docker:up` to start development dependencies (postgres) via `docker compose`.

Prisma can be managed via the following script targets:

- `prisma:generate`
- `prisma:migrate`
- `prisma:db:push`
- `prisma:db:seed`

Start the NextJS UI and NestJS API development servers with: `yarn start`.

The UI will start on <http://localhost:4200/> with the back-end available at <http://localhost:4200/api> via proxy.

Refer to `package.json` for the complete suite of script targets.

## Production

Run `yarn build` to build the entire project, or `nx build my-app` to build a specific app. Add the `--prod` flag for a production-optimized build.

The build outputs to the `dist/` folder.

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

- Theodorus Clarence for the foundations of reusable form input components compatible with react-hook-form (released under MIT license)
  - <https://github.com/theodorusclarence/ts-nextjs-tailwind-starter>
  - <https://github.com/theodorusclarence/expansion-pack>
