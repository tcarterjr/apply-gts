// @ts-check
import { files, js, packageJson } from 'ember-apply';
import fs from 'fs';
import path, { dirname } from 'path';
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
  const newDependencies = {
    '@glint/core': '^1.2.1',
    '@glint/environment-ember-template-imports': '^1.2.1',
    'ember-template-imports': '^4.0.0',
    'prettier-plugin-ember-template-tag': '^1.1.0',
  };

  log('Adding dependencies');

  await checkDependencies(newDependencies);
  await packageJson.addDevDependencies(newDependencies);

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
    filesProperty.forEach((path) => {
      path.node.value = j.literal('*.{js,ts,gjs,gts}');
    });

    return root.toSource();
  });

  log('Updating configuration file: tsconfig.json');

  // Ideally, this would update the tsconfig.json file to add the glint configuration.
  // However, it doesn't work because the tsconfig.json file is not parsable by jscodeshift
  // and since it has comments, it can't be parsed by JSON.parse either.  So, instead,
  // we will modify the file using regular expressions.
  // await js.transform('tsconfig.json', async ({ root, j }) => {
  //   // Find the top-level object in the tsconfig.json file
  //   const topLevelObject = root.find(j.ObjectExpression).at(0);

  //   // Create a new 'glint' property
  //   const glintProperty = j.property(
  //     'init',
  //     j.identifier('glint'),
  //     j.objectExpression([
  //       j.property(
  //         'init',
  //         j.identifier('environment'),
  //         j.arrayExpression([
  //           j.literal('ember-loose'),
  //           j.literal('ember-template-imports'),
  //         ])
  //       ),
  //     ])
  //   );

  //   // Add the 'glint' property at the beginning of the top-level object
  //   topLevelObject.get('properties').value.unshift(glintProperty);

  //   return root.toSource();
  // });

  // This updates the tsconfig.json file to add the glint configuration.  It uses
  // the file api and regular expressions to do so.
  //
  // Define the path to the tsconfig.json file
  // TODO: is this the right path?
  const tsconfigPath = path.resolve('.', 'tsconfig.json');

  // Read the tsconfig.json file
  const tsconfig = fs.readFileSync(tsconfigPath, 'utf8');

  // Define the glint configuration
  const glintConfig = `,
    "glint": {
      "environment": ["ember-loose", "ember-template-imports"]
    }
  `;

  // Insert the glint configuration just before the last closing brace
  const updatedTsconfig = tsconfig.replace(/\}\s*$/, glintConfig + '}');

  // Write the updated content back to the tsconfig.json file
  fs.writeFileSync(tsconfigPath, updatedTsconfig);

  log('Updating types/global.d.ts');

  await files.applyFolder(path.join(__dirname, 'files/types'), 'types');
}
