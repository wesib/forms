import {
  AeClass,
  allAmender,
  Amender,
  Amendment,
  AmendRequest,
  AmendTarget,
  isAmendatory,
  MemberAmendment,
  newAmendTarget,
} from '@proc7ts/amend';
import { Class } from '@proc7ts/primitives';
import { Share, Shared, SharedAmendment, ShareLocator, shareLocator, ShareRef, TargetShare } from '@wesib/generic';
import { ComponentClass } from '@wesib/wesib';
import { Field } from './field';
import { FieldName } from './field-name.amendment';
import { Field$name } from './field.impl';
import { FieldShare } from './field.share';
import { FormUnit } from './form-unit';
import { FormShare } from './form.share';
import { AeSharedFormUnit } from './shared-form-unit.amendment';

/**
 * An amended entity representing a component member containing a shared field to amend.
 *
 * @typeParam TField - Field type.
 * @typeParam TFieldValue - Field value type.
 * @typeParam TClass - Amended component class type.
 */
export interface AeSharedField<
    TField extends Field<TFieldValue>,
    TFieldValue = Field.ValueType<TField>,
    TClass extends ComponentClass = Class>
    extends AeSharedFormUnit<TField, TFieldValue, Field.Controls<TFieldValue>, TClass> {

  /**
   * Target field share instance.
   */
  readonly share: Share<TField>;

  /**
   * Predefined locator function of the form unit to add the shared field to.
   */
  readonly locateForm: ShareLocator.Fn<FormUnit<any>>;

  /**
   * Predefined field name, or `null`/`undefined` when the field is not to be added to the {@link locateForm form}.
   */
  readonly name: string | null;

}

/**
 * An amendment of component member containing a shared field.
 *
 * Created by {@link SharedField} function.
 *
 * @typeParam TField - Field type.
 * @typeParam TFieldValue - Field value type.
 * @typeParam TClass - Amended component class type.
 * @typeParam TAmended - Amended field entity type.
 */
export type SharedFieldAmendment<
    TField extends Field<TFieldValue>,
    TFieldValue = Field.ValueType<TField>,
    TClass extends ComponentClass = Class,
    TAmended extends AeSharedField<TField, TFieldValue, TClass> =
        AeSharedField<TField, TFieldValue, TClass>> =
    MemberAmendment.ForBase<
        AeClass<TClass>,
        AeSharedField<TField, TFieldValue, TClass>,
        TField | undefined,
        TClass,
        TField | undefined,
        TAmended>;
/**
 * Creates an amendment (and decorator) of component member that {@link FieldShare shares} a form field.
 *
 * @typeParam TField - Field type.
 * @typeParam TFieldValue - Field value type.
 * @typeParam TClass - Amended component class type.
 * @typeParam TAmended - Amended field entity type.
 * @param def - Field definition.
 * @param amendments - Amendments to apply.
 *
 * @return New field member amendment.
 */
export function SharedField<
    TField extends Field<TFieldValue>,
    TFieldValue = Field.ValueType<TField>,
    TClass extends ComponentClass = Class,
    TAmended extends AeSharedField<TField, TFieldValue, TClass> =
        AeSharedField<TField, TFieldValue, TClass>>(
    def?: SharedFieldDef<TField, TFieldValue>,
    ...amendments: Amendment<TAmended>[]
): SharedFieldAmendment<TField, TFieldValue, TClass, TAmended>;

/**
 * Creates an amendment (and decorator) of component member that {@link FieldShare shares} a form field and adds it
 * to the {@link FormShare default form} under amended member name.
 *
 * @typeParam TField - Field type.
 * @typeParam TFieldValue - Field value type.
 * @typeParam TClass - Amended component class type.
 * @typeParam TAmended - Amended field entity type.
 * @param amendments - Amendments to apply.
 *
 * @return Component property decorator.
 */
export function SharedField<
    TField extends Field<TFieldValue>,
    TFieldValue = Field.ValueType<TField>,
    TClass extends ComponentClass = Class,
    TAmended extends AeSharedField<TField, TFieldValue, TClass> =
        AeSharedField<TField, TFieldValue, TClass>>(
    ...amendments: Amendment<TAmended>[]
): SharedFieldAmendment<TField, TFieldValue, TClass, TAmended>;

export function SharedField<
    TField extends Field<TFieldValue>,
    TFieldValue = Field.ValueType<TField>,
    TClass extends ComponentClass = Class,
    TAmended extends AeSharedField<TField, TFieldValue, TClass> =
        AeSharedField<TField, TFieldValue, TClass>>(
    defOrAmendment:
        | SharedFieldDef<TField, TFieldValue>
        | Amendment<TAmended> = {},
    ...amendments: Amendment<TAmended>[]
): SharedAmendment<TField, TClass, TAmended> {

  let def: SharedFieldDef<TField, TFieldValue>;
  let fieldName: string | undefined;
  let amender: Amender<TAmended>;

  if (typeof defOrAmendment === 'function' || isAmendatory(defOrAmendment)) {
    def = {};
    amender = allAmender([defOrAmendment, ...amendments, FieldName()]);
  } else {
    def = defOrAmendment;
    fieldName = defOrAmendment.name;
    amender = allAmender([...amendments, FieldName({ name: fieldName })]);
  }

  const {
    share = FieldShare as ShareRef<TField>,
    form,
  } = def;
  const locateForm$default = shareLocator(form, { share: FormShare });

  return Shared<TField, TClass, TAmended>(
      share,
      baseTarget => {
        amender(newAmendTarget({
          base: {
            ...baseTarget as TAmended,
            locateForm: locateForm$default,
            name: Field$name(baseTarget.key, fieldName),
          },
          amend<TBase extends TAmended, TExt>(
              base: TBase,
              request: AmendRequest<TBase, TExt> = {} as AmendRequest<TBase, TExt>,
          ): () => AmendTarget.Draft<TBase & TExt> {

            const {
              locateForm = base.locateForm,
              name = base.name,
              ...baseRequest
            } = request;

            const createBaseTarget = baseTarget.amend(baseRequest as AmendRequest<any>);

            return () => ({
              ...createBaseTarget(),
              locateForm,
              name,
            } as AmendTarget.Draft<TBase & TExt>);
          },
        }));
      },
  );
}

/**
 * Shared form field definition.
 *
 * @typeParam TField - Field type.
 * @typeParam TValue - Field value type.
 */
export interface SharedFieldDef<TField extends Field<TValue>, TValue = Field.ValueType<TField>> {

  /**
   * Target field share.
   */
  readonly share?: TargetShare<TField>;

  /**
   * A locator of form unit to add the shared field to.
   *
   * The {@link FormShare default form share} is used when omitted.
   */
  readonly form?: ShareLocator<FormUnit<unknown>>;

  /**
   * Field name.
   *
   * The shared field will be added to the input control group (`InGroup`) within the {@link form target form},
   * unless the name is empty string.
   *
   * Equals to decorated property name when omitted.
   */
  readonly name?: string;

}
