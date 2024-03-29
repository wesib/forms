import { inFormElement, inGroup, inValue } from '@frontmeans/input-aspects';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { trackValue } from '@proc7ts/fun-events';
import { Component, ComponentContext, ComponentElement, ComponentSlot } from '@wesib/wesib';
import { MockElement, testElement } from '@wesib/wesib/testing';
import { Form } from './form';

describe('Form', () => {
  let form: Form;

  beforeEach(() => {
    form = new Form(Form.forElement(inGroup({}), document.createElement('form')));
  });

  describe('controls', () => {
    let context: ComponentContext;

    beforeEach(async () => {
      @Component({
        extend: { type: MockElement },
      })
      class TestComponent {}

      const element: ComponentElement = new (await testElement(TestComponent))();

      context = await ComponentSlot.of(element).whenReady;
    });

    it('de-duplicated', () => {
      const controls = trackValue<Form.Controls<string>>();

      form = new Form(() => controls.read);

      const control1 = inValue('test');
      const element1 = inFormElement(document.createElement('form'), { form: control1 });

      controls.it = { control: control1, element: element1 };

      form.sharedBy(context);

      expect(form.control).toBe(control1);
      expect(form.element).toBe(element1);
      expect(control1.supply.isOff).toBe(false);
      expect(element1.supply.isOff).toBe(false);

      const element2 = inFormElement(document.createElement('form'), { form: control1 });

      controls.it = { control: control1, element: element2 };
      expect(form.control).toBe(control1);
      expect(form.element).toBe(element2);
      expect(control1.supply.isOff).toBe(false);
      expect(element1.supply.isOff).toBe(true);

      const control2 = inValue('test2');

      controls.it = { control: control2, element: element2 };
      expect(form.control).toBe(control2);
      expect(form.element).toBe(element2);
      expect(control2.supply.isOff).toBe(false);
      expect(element1.supply.isOff).toBe(true);

      controls.it = undefined;
      expect(form.control).toBeUndefined();
      expect(form.element).toBeUndefined();
      expect(control2.supply.isOff).toBe(true);
      expect(element2.supply.isOff).toBe(true);
    });
  });

  describe('control', () => {
    it('throws before bound to sharer context', () => {
      expect(() => form.control).toThrow(new TypeError('[Form] is not properly shared yet'));
    });
  });

  describe('element', () => {
    it('throws before bound to sharer context', () => {
      expect(() => form.element).toThrow(new TypeError('[Form] is not properly shared yet'));
    });
  });

  describe('sharer', () => {
    it('throws before bound to sharer context', () => {
      expect(() => form.sharer).toThrow(new TypeError('[Form] is not properly shared yet'));
    });
  });

  describe('aspect', () => {
    it('is `null` by default', () => {
      expect(inValue('test').aspect(Form)).toBeNull();
    });
  });
});
