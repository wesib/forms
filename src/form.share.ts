import { Class } from '@proc7ts/primitives';
import { Share } from '@wesib/generic';
import { Form } from './form';

const FormShare$map = /*#__PURE__*/ new WeakMap<Class, FormShare<any, any>>();

/**
 * A kind of component share containing a user input form.
 *
 * This class may be inherited to represent a specific type of forms. E.g. to support multiple forms within the same
 * component tree.
 *
 * @typeParam TModel - A model type of the form.
 * @typeParam TElt - A type of HTML form element.
 */
export class FormShare<TModel = any, TElt extends HTMLElement = HTMLElement> extends Share<
  Form<TModel, TElt>
> {

  /**
   * Default form share instance.
   */
  static get share(): FormShare<any, any> {
    let instance = FormShare$map.get(this);

    if (!instance) {
      instance = new this('form');
      FormShare$map.set(this, instance);
    }

    return instance;
  }

}
