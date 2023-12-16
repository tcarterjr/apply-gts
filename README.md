# apply-gts

Automates the steps for adding gjs/gts & Glint to an existing Ember app.

## Usage

```sh
npx ember-apply @tcarterjr/apply-gts
```

## Info

I run this right after creating a new Ember app. For example:

```sh
ember new my-app --typescript --pnpm --no-welcome --embroider --lang en
```

Then this script adds gts support (via `ember-template-imports`) and configures prettier & glint following the instructions from various places:

- https://github.com/ember-template-imports/ember-template-imports?tab=readme-ov-file#installation-and-setup
- https://github.com/gitKrystan/prettier-plugin-ember-template-tag?tab=readme-ov-file#usage
- https://typed-ember.gitbook.io/glint/environments/ember/installation
