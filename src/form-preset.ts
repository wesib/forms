import { cxDynamic, CxEntry } from '@proc7ts/context-values';
import { AfterEvent, afterEventBy, sendEventsTo } from '@proc7ts/fun-events';
import { DefaultFormPreset } from './default.preset.impl';
import { Field } from './field';
import { Form } from './form';

function FormPreset$noFieldSetup<TValue, TSharer extends object>(
    _builder: Field.Builder<TValue, TSharer>,
): void {
  // No field setup
}

function FormPreset$noFormSetup<TModel, TElt extends HTMLElement, TSharer extends object>(
    _builder: Form.Builder<TModel, TElt, TSharer>,
): void {
  // No form setup
}

/**
 * Form controls preset.
 *
 * Any number of presets can be {@link FormPreset.Spec specified} in component context to be applies to forms
 * and fields. They would be combined into single preset available in component context.
 */
export interface FormPreset {

  /**
   * Sets up form field controls.
   *
   * @param builder - Target field builder.
   */
  setupField<TValue, TSharer extends object>(
      builder: Field.Builder<TValue, TSharer>,
  ): void;

  /**
   * Sets up form controls.
   *
   * @param builder - Target form builder.
   */
  setupForm<TModel, TElt extends HTMLElement, TSharer extends object>(
      builder: Form.Builder<TModel, TElt, TSharer>,
  ): void;

}

/**
 * Component context entry containing default form preset combined from all provided {@link FormPreset.Spec specifiers}.
 *
 * As a bare minimum it attaches the following aspects to controls:
 *
 * - `InRenderScheduler` set to `ElementRenderScheduler`,
 * - `InNamespaceAliaser` set to `DefaultNamespaceAliaser.
 */
export const FormPreset: FormPreset.Static = {

  perContext: (/*#__PURE__*/ cxDynamic<FormPreset.Tracker, FormPreset.Spec, FormPreset>({
    create: (specs, _target) => FormPreset.combine(...specs, DefaultFormPreset),
    byDefault: _target => DefaultFormPreset,
    assign: ({ get, to, track }, _target) => {

      const preset: FormPreset.Tracker = {

        track: afterEventBy(receiver => track(sendEventsTo(receiver), receiver)),

        setupField<TValue, TSharer extends object>(
            builder: Field.Builder<TValue, TSharer>,
        ): void {
          get().setupField(builder);
        },

        setupForm<TModel, TElt extends HTMLElement, TSharer extends object>(
            builder: Form.Builder<TModel, TElt, TSharer>,
        ): void {
          get().setupForm(builder);
        },

      };

      return receiver => to((_, by) => receiver(preset, by));
    },
  })),

  /**
   * Combines form preset specifiers.
   *
   * @param specs - Form preset specifiers to combine.
   *
   * @returns Form preset rules instance combining the given specifiers.
   */
  combine(this: void, ...specs: FormPreset.Spec[]): FormPreset {
    return {
      setupField: FormPreset$setupField(specs),
      setupForm: FormPreset$setupForm(specs),
    };
  },

  toString: () => '[FormPreset]',

};

export namespace FormPreset {

  /**
   * A tracker of form presets provided as component context assets.
   */
  export interface Tracker extends FormPreset {

    /**
     * An `AfterEvent` keeper of {@link Static.combine combined} form preset.
     */
    readonly track: AfterEvent<[FormPreset]>;

  }

  /**
   * A {@link FormPreset form preset} specifier.
   *
   * Contains a partial form preset implementation.
   */
  export interface Spec {

    /**
     * Sets up form field controls.
     *
     * @param builder - Target field builder.
     */
    setupField?<TValue, TSharer extends object>(
        builder: Field.Builder<TValue, TSharer>,
    ): void;

    /**
     * Sets up form controls.
     *
     * @param builder - Target form builder.
     */
    setupForm?<TModel, TElt extends HTMLElement, TSharer extends object>(
        builder: Form.Builder<TModel, TElt, TSharer>,
    ): void;

  }

  /**
   * Static `FormPreset` instance type.
   */
  export interface Static extends CxEntry<FormPreset.Tracker, FormPreset.Spec> {

    /**
     * Combines form preset specifiers.
     *
     * @param specs - Form preset specifiers to combine.
     *
     * @returns Form preset rules instance combining the given specifiers.
     */
    combine(this: void, ...specs: FormPreset.Spec[]): FormPreset;

  }

}

function FormPreset$setupField(
    specs: readonly FormPreset.Spec[],
): <TValue, TSharer extends object>(
    builder: Field.Builder<TValue, TSharer>,
) => void {
  return specs.reduce(
      (prev, spec) => spec.setupField
          ? <TValue, TSharer extends object>(
              builder: Field.Builder<TValue, TSharer>,
          ): void => {
            prev(builder);
            spec.setupField!(builder);
          }
          : prev,
      FormPreset$noFieldSetup,
  );
}

function FormPreset$setupForm(
    specs: readonly FormPreset.Spec[],
): <TModel, TElt extends HTMLElement, TSharer extends object>(
    builder: Form.Builder<TModel, TElt, TSharer>,
) => void {
  return specs.reduce(
      (prev, spec) => spec.setupForm
          ? <TModel, TElt extends HTMLElement, TSharer extends object>(
              builder: Form.Builder<TModel, TElt, TSharer>,
          ): void => {
            prev(builder);
            spec.setupForm!(builder);
          }
          : prev,
      FormPreset$noFormSetup,
  );
}
