import { inFormElement, inGroup, InMode, InValidation, inValue } from '@frontmeans/input-aspects';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { afterThe } from '@proc7ts/fun-events';
import { BootstrapContext, Component, ComponentContext } from '@wesib/wesib';
import { MockElement, testDefinition } from '@wesib/wesib/testing';
import { Field } from '../field';
import { FieldShare } from '../field.share';
import { Form } from '../form';
import { FormShare } from '../form.share';
import { SharedField } from '../shared-field.amendment';
import { SharedForm } from '../shared-form.amendment';
import { FormModePreset } from './form-mode.preset';

describe('FormModePreset', () => {

  let doc: Document;

  beforeEach(() => {
    doc = document.implementation.createHTMLDocument('test');
  });

  it('reflects form validity by default', async () => {

    const [{ control }] = await bootstrap();

    control?.aspect(InValidation).by(afterThe({ invalid: true }));

    expect(await control?.aspect(InMode).read).toBe('-on');
  });
  it('reflects form validity with custom mode', async () => {

    const [{ control }] = await bootstrap({ byValidity: { invalid: 'on' } });

    control?.aspect(InValidation).by(afterThe({ invalid: true }));

    expect(await control?.aspect(InMode).read).toBe('on');
  });
  it('does not reflect form validity when disabled', async () => {

    const [{ control }] = await bootstrap({ byValidity: false });

    control?.aspect(InValidation).by(afterThe({ invalid: true }));

    expect(await control?.aspect(InMode).read).toBe('on');
  });
  it('reflects form element mode by field by default', async () => {

    const [{ element: form }, { control: field }] = await bootstrap();

    form!.aspect(InMode).own.it = 'off';

    expect(await field?.aspect(InMode).read).toBe('off');
  });
  it('does not reflect form element mode by field when disabled', async () => {

    const [{ element: form }, { control: field }] = await bootstrap({ byForm: false });

    form!.aspect(InMode).own.it = 'off';

    expect(await field?.aspect(InMode).read).toBe('on');
  });
  it('handles adding to non-form container', async () => {

    const form = inGroup<{ test: string }>({ test: '' });
    const [, { control: field }] = await bootstrap();

    form.controls.set('test', field);
    form.aspect(InMode).own.it = 'off';

    expect(await field?.aspect(InMode).read).toBe('off');
  });

  async function bootstrap(options?: FormModePreset.Options): Promise<[form: Form, field: Field<string>]> {

    @Component(
        'test-form',
        {
          extend: { type: MockElement },
          feature: {
            needs: options ? [] : FormModePreset,
            setup: setup => {
              if (options) {
                setup.provide(new FormModePreset(options));
              }
            },
          },
        },
    )
    class TestFormComponent {

      @SharedForm()
      readonly form: Form;

      constructor(context: ComponentContext) {
        this.form = Form.by<any>(
            opts => inGroup({}, opts),
            opts => inFormElement(context.element, opts),
        );
      }

    }

    @Component(
        'test-field',
        {
          extend: { type: MockElement },
          feature: {
            needs: TestFormComponent,
          },
        },
    )
    class TestFieldComponent {

      @SharedField()
      readonly field: Field<string>;

      constructor() {
        this.field = Field.by(opts => inValue('test', opts));
      }

    }

    const fieldDef = await testDefinition(TestFieldComponent);
    const formDef = await fieldDef.get(BootstrapContext).whenDefined(TestFormComponent);

    const formEl = doc.body.appendChild(doc.createElement('test-form'));
    const fieldEl = formEl.appendChild(doc.createElement('test-field'));

    const form = (await formDef.mountTo(formEl).get(FormShare.Default))!;
    const field = (await fieldDef.mountTo(fieldEl).get(FieldShare.Default))!;

    expect(form).not.toBe(field);

    return [form, field];
  }

});
