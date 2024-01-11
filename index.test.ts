import { apply, diff, diffSummary, newEmberApp } from 'ember-apply/test-utils';
import { describe, expect, it } from 'vitest';

import { default as applyGts } from './index.js';

describe('apply-gts', () => {
  it('default export exists', () => {
    expect(typeof applyGts).toEqual('function');
  });

  describe('applying to an ember app', () => {
    it('works via CLI', async () => {
      let appLocation = await newEmberApp();

      await apply(appLocation, applyGts.path);

      expect(await diffSummary(appLocation)).toMatchSnapshot();
      expect(
        await diff(appLocation, { ignoreVersions: true })
      ).toMatchSnapshot();
    });
  });
});
