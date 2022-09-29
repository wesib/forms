import { InBuilder, InControl } from '@frontmeans/input-aspects';
import {
  AfterEvent,
  afterValue,
  deduplicateAfter_,
  digAfter_,
  mapAfter,
} from '@proc7ts/fun-events';
import { valueRecipe } from '@proc7ts/primitives';
import { Shareable } from '@wesib/generic';
import { ComponentContext } from '@wesib/wesib';
import { FormPreset } from './form-preset';
import { FormUnit } from './form-unit';

/**
 * A field of the user input {@link Form form}.
 *
 * A component {@link FieldShare shares} field (e.g. using {@link SharedField @SharedField} decorator) to make it
 * accessible by component itself and nested ones. E.g. to add it to {@link Form form} or to manipulate its value.
 *
 * The field instance is not usable until it is bound to its sharer component. The latter is done automatically when
 * the field is shared by {@link FieldShare}.
 *
 * @typeParam TValue - Field value type.
 * @typeParam TSharer - Field sharer component type.
 */
export class Field<TValue, TSharer extends object = any> extends FormUnit<
  TValue,
  Field.Body<TValue>,
  TSharer
> {

  /**
   * Creates a form field by the given field control factory.
   *
   * @param factory - Field control factory.
   *
   * @returns New field instance.
   */
  static by<TValue, TSharer extends object = any>(
    factory: InControl.Factory<InControl<TValue>>,
  ): Field<TValue, TSharer> {
    return new this(this.providerBy(factory));
  }

  /**
   * Creates a form field controls provider by the given control factory.
   *
   * @param factory - Field control factory.
   *
   * @returns New form field controls provider.
   */
  static providerBy<TValue, TSharer extends object = any>(
    factory: InControl.Factory<InControl<TValue>>,
  ): Field.Provider<TValue, TSharer> {
    return builder => ({
      control: builder.control.build(factory),
    });
  }

  /**
   * Constructs form field.
   *
   * @param controls - Either a field controls instance, or its provider.
   */
  constructor(controls: Field.Controls<TValue> | Field.Provider<TValue, TSharer>) {
    super(Field$provider(() => this, valueRecipe(controls)));
  }

  override toString(): string {
    return '[Field]';
  }

}

export namespace Field {
  /**
   * A value type of the given form field.
   *
   * @typeParam TField - Field type.
   */
  export type ValueType<TField extends Field<any>> = FormUnit.ValueType<TField>;

  /**
   * Form field controls.
   *
   * @typeParam TValue - Input value type.
   */
  export interface Controls<TValue> extends FormUnit.Controls<TValue> {
    /**
     * Field input control.
     */
    readonly control: InControl<TValue>;
  }

  /**
   * Form field body containing its input control.
   *
   * @typeParam TValue - Input value type.
   */
  export interface Body<TValue, TSharer extends object = any> extends FormUnit.Controls<TValue> {
    /**
     * A field the input control belongs to.
     */
    readonly field: Field<TValue, TSharer>;

    /**
     * Field input control.
     */
    readonly control: InControl<TValue>;
  }

  /**
   * Form field builder.
   *
   * @typeParam TValue - Field value type.
   * @typeParam TSharer - Field sharer component type.
   */
  export interface Builder<TValue, TSharer extends object> {
    /**
     * Sharer component context.
     */
    readonly sharer: ComponentContext<TSharer>;

    /**
     * Target field.
     */
    readonly field: Field<TValue, TSharer>;

    /**
     * Field input control builder.
     */
    readonly control: InBuilder<InControl<TValue>, TValue>;
  }

  /**
   * Form field controls provider signature.
   *
   * @typeParam TValue - Field value type.
   * @typeParam TSharer - Field sharer component type.
   * @param builder - Field builder.
   *
   * @returns Either field controls instance, or an `AfterEvent` keeper reporting one.
   */
  export type Provider<TValue, TSharer extends object = any> = (
    this: void,
    builder: Builder<TValue, TSharer>,
  ) => Controls<TValue> | AfterEvent<[Controls<TValue>?]>;
}

function Field$provider<TValue, TSharer extends object>(
  field: () => Field<TValue, TSharer>,
  provider: Field.Provider<TValue>,
): Shareable.Provider<Field.Body<TValue> | undefined, TSharer> {
  return sharer => sharer.get(FormPreset).track.do(
      digAfter_(preset => {
        const builder: Field.Builder<TValue, TSharer> = {
          sharer,
          field: field(),
          control: new InBuilder<InControl<TValue>, TValue>(),
        };

        preset.setupField(builder);

        return afterValue(provider(builder));
      }),
      deduplicateAfter_(Field$isDuplicateControls, ([controls]) => controls),
      mapAfter(controls => controls && { field: field(), control: controls.control }),
    );
}

function Field$isDuplicateControls<TValue>(
  prior?: Field.Controls<TValue>,
  next?: Field.Controls<TValue>,
): boolean {
  if (prior?.control !== next?.control) {
    prior?.control.supply.off();

    return false;
  }

  return true;
}
