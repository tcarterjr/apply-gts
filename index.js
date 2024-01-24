// @ts-check
// eslint-disable-next-line n/no-unpublished-import
import { files, js, packageJson } from 'ember-apply';
// @ts-ignore
import fs from 'fs';
// @ts-ignore
import path, { dirname } from 'path';
// @ts-ignore
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const log = (/** @type {any[]} */ ...args) => {
  // eslint-disable-next-line no-console
  console.log(...args);
};

/**
 * Warn if the given package is already installed AND it's a different version.
 * @param {Record<string, string>} packages map of package names to package versions
 */
export async function checkDependencies(packages) {
  for (const [name, version] of Object.entries(packages)) {
    if (await packageJson.hasDependency(name)) {
      log(
        `WARNING: ${name} was already installed (${version}). Verify this change manually in package.js.`
      );
    }
  }
}

export default async function run() {
  // ADD DEPENDENCIES
  //---------------------------------------------

  log('Adding dependencies');

  const newDependencies = {
    '@glint/core': '^1.3.0',
    '@glint/environment-ember-loose': '^1.3.0',
    '@glint/template': '^1.3.0',
    '@glint/environment-ember-template-imports': '^1.3.0',
    'ember-template-imports': '^4.0.0',
    'prettier-plugin-ember-template-tag': '^2.0.0',
    'ember-page-title': '^8.2.1',
  };

  await checkDependencies(newDependencies);
  await packageJson.addDevDependencies(newDependencies);

  // UPDATE PRETTIER CONFIGURATION
  //---------------------------------------------

  log('Updating configuration file: .prettierrc.js');

  // This updates the prettier config to handle gjs/gts files.
  await js.transform('.prettierrc.js', async ({ root, j }) => {
    // Find the object expression that is the value of module.exports
    const moduleExportsObject = root
      .find(j.AssignmentExpression, {
        left: {
          type: 'MemberExpression',
          object: { name: 'module' },
          property: { name: 'exports' },
        },
      })
      .get('right');

    // Create a new 'plugins' property
    const pluginsProperty = j.property(
      'init',
      j.identifier('plugins'),
      j.arrayExpression([j.literal('prettier-plugin-ember-template-tag')])
    );

    // Add the 'plugins' property at the beginning of the module.exports object
    moduleExportsObject.node.properties.unshift(pluginsProperty);

    // Find the 'overrides' property
    const overridesProperty = root.find(j.Property, {
      key: { name: 'overrides' },
    });

    // Find the 'files' property within the 'overrides' array
    const filesProperty = overridesProperty.find(j.Property, {
      key: { name: 'files' },
    });

    // Update the value of the 'files' property
    filesProperty.forEach((/** @type {any} */ path) => {
      path.node.value = j.literal('*.{js,ts,gjs,gts}');
    });

    return root.toSource();
  });

  // UPDATE TS CONFIGURATION
  //---------------------------------------------

  log('Updating configuration file: tsconfig.json');

  // Ideally, we would update the tsconfig.json file using jscodeshift to add the
  // glint configuration.
  // However, it doesn't work because the tsconfig.json file is not parsable by
  // jscodeshift, and since it has comments, it can't be parsed by JSON.parse
  // either.  So, instead, we will modify the file using regular expressions.

  // Define the path to the tsconfig.json file
  const tsconfigPath = path.resolve('.', 'tsconfig.json');

  // Read the tsconfig.json file
  const tsconfig = fs.readFileSync(tsconfigPath, 'utf8');

  // Define the glint configuration
  const glintConfig = `,
    "glint": {
      "environment": ["ember-loose", "ember-template-imports"]
    },
    "exclude": ["blueprints"],
  `;

  // Insert the glint configuration just before the last closing brace
  const updatedTsconfig = tsconfig.replace(/\}\s*$/, glintConfig + '}');

  // Write the updated content back to the tsconfig.json file
  fs.writeFileSync(tsconfigPath, updatedTsconfig);

  // UPDATE TYPE REGISTRY (page-title)
  //---------------------------------------------
  // NOTE: As of Ember 5.6, the types/global.d.ts file has a single import for
  // @glint/environment-ember-loose. This will replace the file with a new one
  // with the same import and some new stuff.

  log('Updating types/global.d.ts');

  await files.applyFolder(path.join(__dirname, 'files/types'), 'types');

  // UPDATE lint:types SCRIPT
  //---------------------------------------------

  log('Updating lint:types script');

  await packageJson.addScript('lint:types', 'glint');

  // ADDING BLUEPRINTS
  //---------------------------------------------

  log('Adding gts blueprint');

  fs.mkdirSync(
    path.join('.', 'blueprints/gts-component/files/app/components'),
    {
      recursive: true,
    }
  );

  await files.copyFileTo(
    'blueprints/gts-component/files/app/components/__name__.gts',
    {
      source: path.join(
        __dirname,
        'files/blueprints/gts-component/files/app/components/__name__.gts'
      ),
    }
  );

  await files.copyFileTo('blueprints/gts-component/index.js', {
    source: path.join(__dirname, 'files/blueprints/gts-component/index.js'),
  });
}
