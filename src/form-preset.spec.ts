import {
  InBuilder,
  InControl,
  InElement,
  inFormElement,
  InFormElement,
  InGroup,
  inGroup,
  InNamespaceAliaser,
  InRenderScheduler,
  inValue,
} from '@frontmeans/input-aspects';
import { newManualRenderScheduler, RenderScheduler } from '@frontmeans/render-scheduler';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import {
  Component,
  ComponentContext,
  ComponentRenderScheduler,
  ComponentSlot,
  DefaultNamespaceAliaser,
  DefinitionContext,
} from '@wesib/wesib';
import { MockElement, testElement } from '@wesib/wesib/testing';
import { cxConstAsset } from '../../../proc7ts/context-builder/src';
import { Field } from './field';
import { FieldShare } from './field.share';
import { Form } from './form';
import { FormPreset } from './form-preset';
import { FormShare } from './form.share';
import { SharedField } from './shared-field.amendment';
import { SharedForm } from './shared-form.amendment';
import { MockFn, MockObject } from './spec';

describe('FormPreset', () => {
  it('is applied to field', async () => {

    const setup = jest.fn();

    @Component(
        'test-element',
        {
          extend: { type: MockElement },
          define(defContext) {
            defContext.perComponent(cxConstAsset(FormPreset, { setupField: setup }));
          },
        },
    )
    class TestComponent {

      @SharedField()
      readonly field = new Field<string>({ control: inValue('test') });

    }

    const element = new (await testElement(TestComponent))();
    const context = await ComponentSlot.of(element).whenReady;
    const field = await context.get(FieldShare.Default);

    expect(field?.sharer).toBe(context);
    expect(field?.control).toBeInstanceOf(InControl);

    expect(setup).toHaveBeenCalledWith(expect.objectContaining({ sharer: context, field }));
  });
  it('is applied to form', async () => {

    const setup = jest.fn();

    @Component(
        'test-element',
        {
          extend: { type: MockElement },
          define(defContext) {
            defContext.perComponent(cxConstAsset(FormPreset, { setupForm: setup }));
          },
        },
    )
    class TestComponent {

      @SharedForm()
      readonly form: Form;

      constructor(context: ComponentContext) {
        this.form = new Form(Form.forElement(inGroup({}), context.element));
      }

    }

    const element = new (await testElement(TestComponent))();
    const context = await ComponentSlot.of(element).whenReady;
    const form = await context.get(FormShare.Default);

    expect(form?.sharer).toBe(context);
    expect(form?.control).toBeInstanceOf(InGroup);
    expect(form?.element).toBeInstanceOf(InElement);

    expect(setup).toHaveBeenCalledWith(expect.objectContaining({ sharer: context, form }));
  });
  it('tracks field rule changes', async () => {

    let defContext!: DefinitionContext;
    let controlCounter = 0;

    @Component(
        'test-element',
        {
          extend: { type: MockElement },
          define(defCtx) {
            defContext = defCtx;
          },
        },
    )
    class TestComponent {

      @SharedField()
      readonly field = new Field<string>(() => ({ control: inValue(`test${++controlCounter}`) }));

    }

    const element = new (await testElement(TestComponent))();
    const context = await ComponentSlot.of(element).whenReady;
    const field = (await context.get(FieldShare.Default))!;

    expect(field.control?.it).toBe('test1');

    const preset: MockObject<FormPreset.Spec> = {
      setupField: jest.fn<void, []>(),
    };

    defContext.perComponent(cxConstAsset(FormPreset, preset));
    expect(preset.setupField).toHaveBeenCalledTimes(1);
    expect(field.control?.it).toBe('test2');
  });
  it('tracks form rule changes', async () => {

    let defContext!: DefinitionContext;
    let controlCounter = 0;

    @Component(
        'test-element',
        {
          extend: { type: MockElement },
          define(defCtx) {
            defContext = defCtx;
          },
        },
    )
    class TestComponent {

      @SharedForm()
      readonly form: Form;

      constructor(context: ComponentContext) {
        this.form = new Form(() => Form.forElement(inGroup({ counter: ++controlCounter }), context.element));
      }

    }

    const element = new (await testElement(TestComponent))();
    const context = await ComponentSlot.of(element).whenReady;
    const form = (await context.get(FormShare.Default))!;

    expect(form.control?.it.counter).toBe(1);

    const preset: MockObject<FormPreset.Spec> = {
      setupForm: jest.fn<void, []>(),
    };

    defContext.perComponent(cxConstAsset(FormPreset, preset));
    expect(preset.setupForm).toHaveBeenCalledTimes(1);
    expect(form.control?.it.counter).toBe(2);
  });

  describe('FormPreset', () => {
    it('returns string representation', () => {
      expect(String(FormPreset)).toBe('[FormPreset]');
    });
  });

  describe('defaults', () => {

    let mockRenderScheduler: MockFn<RenderScheduler>;
    let context: ComponentContext;
    let form: Form;
    let field: Field<string>;

    beforeEach(async () => {

      mockRenderScheduler = jest.fn(newManualRenderScheduler());

      @Component(
          'test-element',
          {
            extend: { type: MockElement },
            feature: {
              setup(setup) {
                setup.perComponent(cxConstAsset(ComponentRenderScheduler, mockRenderScheduler));
              },
            },
          },
      )
      class TestComponent {

        @SharedField()
        readonly field = Field.by(opts => inValue('test', opts));

        @SharedForm()
        readonly form: Form;

        constructor(context: ComponentContext) {
          this.form = Form.by(
              opts => inGroup<any>({}, opts),
              opts => inFormElement(context.element, opts),
          );
        }

      }

      const element = new (await testElement(TestComponent))();

      context = await ComponentSlot.of(element).whenReady;
      form = (await context.get(FormShare.Default))!;
      field = (await context.get(FieldShare.Default))!;
    });

    describe('form control', () => {
      it('delegates `InRenderScheduler` to `ComponentRenderScheduler`', () => {

        const scheduler = form.control!.aspect(InRenderScheduler);
        const opts = { node: document.createElement('div') };

        scheduler(opts);

        expect(mockRenderScheduler).toHaveBeenLastCalledWith({ ...opts });
      });
      it('sets `InNamespaceAliaser` to `DefaultNamespaceAliaser`', () => {
        expect(form.control!.aspect(InNamespaceAliaser)).toBe(context.get(DefaultNamespaceAliaser));
      });
    });

    describe('form element', () => {
      it('delegates `InRenderScheduler` to `ComponentRenderScheduler`', () => {

        const scheduler = form.element!.aspect(InRenderScheduler);
        const opts = { node: document.createElement('div') };

        scheduler(opts);

        expect(mockRenderScheduler).toHaveBeenLastCalledWith({ ...opts });
      });
      it('sets `InNamespaceAliaser` to `DefaultNamespaceAliaser`', () => {
        expect(form.element!.aspect(InNamespaceAliaser)).toBe(context.get(DefaultNamespaceAliaser));
      });
    });

    describe('field', () => {
      it('delegates `InRenderScheduler` to `ComponentRenderScheduler`', () => {

        const scheduler = field.control!.aspect(InRenderScheduler);
        const opts = { node: document.createElement('div') };

        scheduler(opts);

        expect(mockRenderScheduler).toHaveBeenLastCalledWith({ ...opts });
      });
      it('sets `InNamespaceAliaser` to `DefaultNamespaceAliaser`', () => {
        expect(field.control!.aspect(InNamespaceAliaser)).toBe(context.get(DefaultNamespaceAliaser));
      });
    });

  });

  describe('instance', () => {
    describe('setupField', () => {

      let controlCounter: number;
      let defContext: DefinitionContext;
      let context: ComponentContext;
      let formPreset: FormPreset.Tracker;

      beforeEach(async () => {
        controlCounter = 0;

        @Component(
            'test-element',
            {
              extend: { type: MockElement },
              define(defCtx) {
                defContext = defCtx;
              },
            },
        )
        class TestComponent {
        }

        const element = new (await testElement(TestComponent))();

        context = await ComponentSlot.of(element).whenReady;
        formPreset = context.get(FormPreset);
      });

      describe('setupField', () => {
        it('reflects rule changes', () => {

          const createControls = (builder: Field.Builder<number, any>): Field.Controls<number> => ({
            control: builder.control.build(opts => inValue(++controlCounter, opts)),
          });
          const field = new Field<number>(createControls);

          field.sharedBy(context);

          const builder1: Field.Builder<number, any> = {
            sharer: context,
            field,
            control: new InBuilder<InControl<number>>(),
          };

          formPreset.setupField(builder1);
          expect(createControls(builder1).control.it).toBe(2);

          defContext.perComponent(cxConstAsset(
              FormPreset,
              {
                setupField: (builder: Field.Builder<any, any>) => {
                  builder.control.setup(ctl => ctl.it += 10);
                },
              },
          ));

          const builder2: Field.Builder<number, any> = {
            sharer: context,
            field,
            control: new InBuilder<InControl<number>>(),
          };

          formPreset.setupField(builder2);
          expect(createControls(builder2).control.it).toBe(14);
        });
      });

      describe('setupForm', () => {
        it('reflects rule changes', () => {

          const createControls = (
              builder: Form.Builder<{ counter: number }, any, any>,
          ): Form.Controls<{ counter: number }> => Form.forElement(
              builder.control.build(opts => inGroup({ counter: ++controlCounter }, opts)),
              context.element,
          );
          const form = new Form<{ counter: number }>(createControls);

          form.sharedBy(context);

          const builder1: Form.Builder<{ counter: number }, any, any> = {
            sharer: context,
            form,
            control: new InBuilder<InControl<{ counter: number }>>(),
            element: new InBuilder<InFormElement>(),
          };

          formPreset.setupForm(builder1);
          expect(createControls(builder1).control.it.counter).toBe(2);

          defContext.perComponent(cxConstAsset(
              FormPreset,
              {
                setupForm: (builder: Form.Builder<any, any, any>) => {
                  builder.control.setup(ctl => ctl.it.counter += 10);
                },
              },
          ));

          const builder2: Form.Builder<{ counter: number }, any, any> = {
            sharer: context,
            form,
            control: new InBuilder<InControl<{ counter: number }>>(),
            element: new InBuilder<InFormElement>(),
          };

          formPreset.setupForm(builder2);
          expect(createControls(builder2).control.it.counter).toBe(14);
        });
      });

      describe('track', () => {
        it('reflects rule changes', () => {

          const receiver = jest.fn();

          formPreset.track(receiver);
          expect(receiver).toHaveBeenCalledTimes(1);

          defContext.perComponent(cxConstAsset(FormPreset, {}));
          expect(receiver).toHaveBeenCalledTimes(2);
        });
      });
    });
  });

});
