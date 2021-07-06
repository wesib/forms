import { describe, expect, it } from '@jest/globals';
import { FeatureDef__symbol } from '@wesib/wesib';
import { AbstractFormPreset } from './abstract-form-preset';

describe('AbstractFormPreset', () => {

  class TestFormPreset extends AbstractFormPreset {
  }

  class TestFormPreset2 extends TestFormPreset {
  }

  describe('feature definition', () => {
    it('is created per preset', () => {
      expect(TestFormPreset[FeatureDef__symbol]).not.toBe(AbstractFormPreset[FeatureDef__symbol]);
      expect(TestFormPreset2[FeatureDef__symbol]).not.toBe(TestFormPreset[FeatureDef__symbol]);
    });
    it('is cached', () => {
      expect(TestFormPreset[FeatureDef__symbol]).toBe(TestFormPreset[FeatureDef__symbol]);
      expect(TestFormPreset2[FeatureDef__symbol]).toBe(TestFormPreset2[FeatureDef__symbol]);
    });
  });

  describe('setupField', () => {
    it('is not defined', () => {
      expect(new TestFormPreset().setupField).toBeUndefined();
    });
  });

  describe('setupForm', () => {
    it('is not defined', () => {
      expect(new TestFormPreset().setupForm).toBeUndefined();
    });
  });

});
