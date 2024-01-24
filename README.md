# apply-gts

Automates the steps for adding gjs/gts & Glint to an existing Ember app.

## Usage

Use `ember-apply` to run it from the root of an Ember app:

```sh
npx ember-apply @tcjr/apply-gts
```

I haven't looked at why, but the transforms don't preserve the quotes and
formatting, so I usually run `pnpm lint:fix` after.

## Info

I run this right after creating a new Ember app. For example:

```sh
ember new my-app --typescript --pnpm --no-welcome --embroider --lang en
cd my-app
npx ember-apply @tcjr/apply-gts
npx ember-apply tailwind-webpack
pnpm install
pnpm lint:fix
```

Then this script adds gts support (via `ember-template-imports`) and configures prettier & glint following the instructions from various places:

- https://github.com/ember-template-imports/ember-template-imports?tab=readme-ov-file#installation-and-setup
- https://github.com/gitKrystan/prettier-plugin-ember-template-tag?tab=readme-ov-file#usage
- https://typed-ember.gitbook.io/glint/environments/ember/installation

This is just a time saver I use for bootstrapping new projects. I only run this with new projects and try to keep it up to date with the latest Ember release. I tested this with Ember 5.6.0. YMMV

## Blueprint

This also adds a basic blueprint for gts components to the app. Run it like this:

```
ember g gts-component fancy-stuff
```

This will create `app/components/fancy-stuff.gts` with a signature stub and loose-mode registration info. Customize it by editing `blueprints/gts-component/files/app/components/__name__.gts`.
