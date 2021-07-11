import { inValue } from '@frontmeans/input-aspects';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { trackValue } from '@proc7ts/fun-events';
import { Component, ComponentContext, ComponentSlot } from '@wesib/wesib';
import { MockElement, testElement } from '@wesib/wesib/testing';
import { Field } from './field';

describe('Field', () => {

  let field: Field<string>;

  beforeEach(() => {
    field = new Field({ control: inValue('test') });
  });

  describe('controls', () => {

    let context: ComponentContext;

    beforeEach(async () => {

      @Component({
        extend: { type: MockElement },
      })
      class TestComponent {
      }

      const element = new (await testElement(TestComponent))();

      context = await ComponentSlot.of(element).whenReady;
    });

    it('de-duplicated', () => {

      const controls = trackValue<Field.Controls<string>>();

      field = new Field(() => controls.read);

      const control1 = inValue('test');

      controls.it = { control: control1 };

      field.sharedBy(context);

      expect(field.body).toEqual({ field, control: control1 });
      expect(control1.supply.isOff).toBe(false);

      controls.it = { control: control1 };
      expect(field.control).toBe(control1);
      expect(control1.supply.isOff).toBe(false);

      const control2 = inValue('test2');

      controls.it = { control: control2 };
      expect(field.control).toBe(control2);
      expect(control1.supply.isOff).toBe(true);
      expect(control2.supply.isOff).toBe(false);

      controls.it = undefined;
      expect(field.control).toBeUndefined();
      expect(control2.supply.isOff).toBe(true);
    });
  });

  describe('control', () => {
    it('throws before bound to sharer context', () => {
      expect(() => field.control).toThrow(new TypeError('[Field] is not properly shared yet'));
    });
  });

  describe('sharer', () => {
    it('throws before bound to sharer context', () => {
      expect(() => field.sharer).toThrow(new TypeError('[Field] is not properly shared yet'));
    });
  });

});
