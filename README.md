# apply-gts

Automates the steps for adding gjs/gts & Glint to an existing Ember app.

## Usage

Clone the repository, then use `ember-apply` to run it from the root of an
Ember app:

```sh
npx ember-apply ../path/to/apply-gts/index.js
```

I haven't looked at why, but the transforms don't preserve the quotes and
formatting, so I run `pnpm lint:fix` after.

## Info

I run this right after creating a new Ember app. For example:

```sh
ember new my-app --typescript --pnpm --no-welcome --embroider --lang en
```

Then this script adds gts support (via `ember-template-imports`) and configures prettier & glint following the instructions from various places:

- https://github.com/ember-template-imports/ember-template-imports?tab=readme-ov-file#installation-and-setup
- https://github.com/gitKrystan/prettier-plugin-ember-template-tag?tab=readme-ov-file#usage
- https://typed-ember.gitbook.io/glint/environments/ember/installation

This is just a time saver I use for bootstrapping new projects. YMMV
