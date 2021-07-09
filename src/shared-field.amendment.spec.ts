import { InGroup, inGroup, inList, InList, InParents, inValue } from '@frontmeans/input-aspects';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { afterThe } from '@proc7ts/fun-events';
import { valueProvider } from '@proc7ts/primitives';
import { BootstrapContext, Component, ComponentClass, ComponentContext, ComponentSlot, FeatureDef } from '@wesib/wesib';
import { MockElement, testDefinition, testElement } from '@wesib/wesib/testing';
import { Field } from './field';
import { FieldName, FormName } from './field-name.amendment';
import { FieldShare } from './field.share';
import { Form } from './form';
import { FormShare } from './form.share';
import { SharedField } from './shared-field.amendment';
import { SharedForm } from './shared-form.amendment';

describe('@SharedField', () => {

  let doc: Document;

  beforeEach(() => {
    doc = document.implementation.createHTMLDocument('test');
  });

  it('shares field', async () => {

    @Component('test-element', { extend: { type: MockElement } })
    class TestComponent {

      @SharedField()
      readonly field = new Field<string>({ control: inValue('test') });

    }

    const element = new (await testElement(TestComponent))();
    const context = await ComponentSlot.of(element).whenReady;

    expect(await context.get(FieldShare.share)).toBeInstanceOf(Field);
  });
  it('shares provided field', async () => {

    const createControl = jest.fn(valueProvider({ control: inValue('test') }));

    @Component('test-element', { extend: { type: MockElement } })
    class TestComponent {

      @SharedField()
      readonly field = new Field<string>(createControl);

    }

    const element = new (await testElement(TestComponent))();
    const context = await ComponentSlot.of(element).whenReady;
    const { control } = (await context.get(FieldShare.share))!;

    expect(createControl).toHaveBeenCalledWith(expect.objectContaining({ sharer: context }));
    expect(createControl).toHaveReturnedWith({ control });
    expect(createControl).toHaveBeenCalledTimes(1);
  });
  it('shares field provided by controls keeper', async () => {

    const createControl = jest.fn(() => afterThe({ control: inValue('test') }));

    @Component('test-element', { extend: { type: MockElement } })
    class TestComponent {

      @SharedField()
      readonly field = new Field<string>(createControl);

    }

    const element = new (await testElement(TestComponent))();
    const context = await ComponentSlot.of(element).whenReady;
    const { control } = (await context.get(FieldShare.share))!;

    expect(createControl).toHaveBeenCalledWith(expect.objectContaining({ sharer: context }));
    expect(createControl).toHaveBeenCalledTimes(1);
    expect(control?.it).toBe('test');
  });
  it('adds field to enclosing form', async () => {

    const { formCtx, fieldCtx } = await bootstrap();

    const form = await formCtx.get(FormShare.share);
    const field = await fieldCtx.get(FieldShare.share);
    const controls = await form!.control!.aspect(InGroup)!.controls.read;

    expect(controls.get('field')).toBe(field!.control);
  });
  it('adds field to enclosing form with custom name', async () => {

    @Component(
        'field-element',
        {
          extend: { type: MockElement },
        },
    )
    class FieldComponent {

      @SharedField({ name: 'customField' })
      readonly field = new Field<string>({ control: inValue('test') });

    }

    const { formCtx, fieldCtx } = await bootstrap(FieldComponent);

    const form = await formCtx.get(FormShare.share);
    const field = await fieldCtx.get(FieldShare.share);
    const controls = await form!.control!.aspect(InGroup)!.controls.read;

    expect(controls.get('field')).toBeUndefined();
    expect(controls.get('customField')).toBe(field!.control);
  });
  it('does not add field to enclosing form with empty name', async () => {

    @Component(
        'field-element',
        {
          extend: { type: MockElement },
        },
    )
    class FieldComponent {

      @SharedField({ name: '' })
      readonly field = new Field<string>({ control: inValue('test') });

    }

    const { formCtx } = await bootstrap(FieldComponent);

    const form = await formCtx.get(FormShare.share);
    const controls = await form!.control!.aspect(InGroup)!.controls.read;

    expect([...controls]).toHaveLength(0);
  });
  it('does not add a field with symbol key to enclosing form', async () => {

    const symbol = Symbol('test');

    @Component(
        'field-element',
        {
          extend: { type: MockElement },
        },
    )
    class FieldComponent {

      @SharedField()
      readonly [symbol] = new Field<string>({ control: inValue('test') });

    }

    const { formCtx } = await bootstrap(FieldComponent);

    const form = await formCtx.get(FormShare.share);
    const controls = await form!.control!.aspect(InGroup)!.controls.read;

    expect([...controls]).toHaveLength(0);
  });
  it('does not add a field to non-group form', async () => {

    @Component(
        'form-element',
        {
          extend: { type: MockElement },
        },
    )
    class FormComponent {

      @SharedForm()
      readonly form: Form;

      constructor(context: ComponentContext) {
        this.form = new Form(Form.forElement(inList([]), context.element));
      }

    }

    const { formCtx } = await bootstrap(undefined, FormComponent);

    const form = await formCtx.get(FormShare.share);
    const controls = await form!.control!.aspect(InList)!.controls.read;

    expect([...controls]).toHaveLength(0);
  });
  it('does not add a field to missing form', async () => {

    @Component(
        'form-element',
        {
          extend: { type: MockElement },
        },
    )
    class FormComponent {

      @SharedForm()
      form?: Form;

    }

    const { formCtx, fieldCtx } = await bootstrap(undefined, FormComponent);
    const field = (await fieldCtx.get(FieldShare.share))!;

    expect([...(await field.control!.aspect(InParents).read)]).toHaveLength(0);

    formCtx.component.form = new Form(Form.forElement(inGroup({}), formCtx.element));
    expect([...(await field.control!.aspect(InParents).read)]).toHaveLength(1);
  });
  it('applies additional amendments', async () => {
    @Component(
        'field-element',
        {
          extend: { type: MockElement },
        },
    )
    class FieldComponent {

      @SharedField(({ amend }) => {
        amend()().amend({ name: 'customField' });
      })
      readonly field = new Field<string>({ control: inValue('test') });

    }

    const { formCtx, fieldCtx } = await bootstrap(FieldComponent);

    const form = await formCtx.get(FormShare.share);
    const field = await fieldCtx.get(FieldShare.share);
    const controls = await form!.control!.aspect(InGroup)!.controls.read;

    expect(controls.get('field')).toBeUndefined();
    expect(controls.get('customField')).toBe(field!.control);
  });

  describe('FieldName', () => {
    it('adds field to enclosing form', async () => {

      @Component(
          'field-element',
          {
            extend: { type: MockElement },
          },
      )
      class FieldComponent {

        @SharedField(
            {
              name: '',
            },
            FieldName(),
        )
        readonly field = new Field<string>({ control: inValue('test') });

      }

      const { formCtx, fieldCtx } = await bootstrap(FieldComponent);

      const form = await formCtx.get(FormShare.share);
      const field = await fieldCtx.get(FieldShare.share);
      const controls = await form!.control!.aspect(InGroup)!.controls.read;

      expect(controls.get('field')).toBe(field!.control);
    });
    it('adds field to enclosing form again', async () => {

      @Component(
          'field-element',
          {
            extend: { type: MockElement },
          },
      )
      class FieldComponent {

        @SharedField(FieldName({ name: 'customName' }))
        readonly field = new Field<string>({ control: inValue('test') });

      }

      const { formCtx, fieldCtx } = await bootstrap(FieldComponent);

      const form = await formCtx.get(FormShare.share);
      const field = await fieldCtx.get(FieldShare.share);
      const controls = await form!.control!.aspect(InGroup)!.controls.read;

      expect(controls.get('field')).toBe(field!.control);
      expect(controls.get('customName')).toBe(field!.control);
    });
    it('adds nested form to enclosing one', async () => {

      @Component(
          'sub-form-element',
          {
            extend: { type: MockElement },
          },
      )
      class SubFormComponent {

        @SharedForm(FormName())
        readonly subForm: Form<readonly string[]>;

        constructor(context: ComponentContext) {
          this.subForm = new Form(() => Form.forElement(inList<string>([]), context.element));
        }

      }

      const { formCtx, fieldCtx } = await bootstrap(SubFormComponent);

      const form = await formCtx.get(FormShare.share);
      const subForm = await fieldCtx.get(FormShare.share);
      const controls = await form!.control!.aspect(InGroup)!.controls.read;

      expect(controls.get('subForm')).toBe(subForm!.control);
    });
  });

  async function bootstrap(
      componentType?: ComponentClass,
      formComponentType?: ComponentClass,
  ): Promise<{
    formCtx: ComponentContext;
    fieldCtx: ComponentContext;
  }> {

    if (!formComponentType) {
      @Component(
          'form-element',
          {
            extend: { type: MockElement },
          },
      )
      class FormComponent {

        @SharedForm()
        readonly form: Form;

        constructor(context: ComponentContext) {
          this.form = new Form(Form.forElement(inGroup({}), context.element));
        }

      }

      formComponentType = FormComponent;
    }

    if (!componentType) {
      @Component(
          'field-element',
          {
            extend: { type: MockElement },
          },
      )
      class FieldComponent {

        @SharedField()
        readonly field = new Field<string>(() => ({ control: inValue('test') }));

      }

      componentType = FieldComponent;
    }

    FeatureDef.define(componentType, { needs: formComponentType });

    const fieldDef = await testDefinition(componentType);
    const formDef = await fieldDef.get(BootstrapContext).whenDefined(formComponentType);

    const formEl = doc.body.appendChild(doc.createElement('form-element'));
    const fieldEl = formEl.appendChild(doc.createElement('field-element'));

    return {
      formCtx: formDef.mountTo(formEl),
      fieldCtx: fieldDef.mountTo(fieldEl),
    };
  }
});
