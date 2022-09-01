import { CxAsset, CxEntry } from '@proc7ts/context-values';
import { Class } from '@proc7ts/primitives';
import { FeatureDef, FeatureDef__symbol } from '@wesib/wesib';
import { Field } from '../field';
import { Form } from '../form';
import { FormPreset } from '../form-preset';

const AbstractFormPreset$map = /*#__PURE__*/ new WeakMap<typeof AbstractFormPreset, FeatureDef>();

/**
 * Abstract form preset implementation.
 *
 * A class extending it may be used as a feature. E.g. passed to `bootstrapComponents()` function or used as a
 * dependency of another feature.
 *
 * An instance of implementation class may be created to customize its behavior. Such instance implements a
 * `ContextBuilder` interface. Thus is can be passed to context value registration method.
 */
export abstract class AbstractFormPreset
  implements FormPreset.Spec, CxAsset.Placer<FormPreset.Tracker, FormPreset.Spec> {

  /**
   * Feature definition of the preset.
   */
  static get [FeatureDef__symbol](): FeatureDef {
    const found = AbstractFormPreset$map.get(this);

    if (found) {
      return found;
    }

    const preset = new (this as unknown as Class<AbstractFormPreset>)();
    const featureDef: FeatureDef = {
      setup: setup => {
        setup.provide(preset);
      },
    };

    AbstractFormPreset$map.set(this, featureDef);

    return featureDef;
  }

  readonly entry: CxEntry<FormPreset.Tracker, FormPreset.Spec> = FormPreset;

  placeAsset(
    _target: CxEntry.Target<FormPreset.Tracker, FormPreset.Spec>,
    collector: CxAsset.Collector<FormPreset.Spec>,
  ): void {
    collector(this);
  }

  setupField?<TValue, TSharer extends object>(builder: Field.Builder<TValue, TSharer>): void;

  setupForm?<TModel, TElt extends HTMLElement, TSharer extends object>(
    builder: Form.Builder<TModel, TElt, TSharer>,
  ): void;

}
