Wesib: Forms
============

[![NPM][npm-image]][npm-url]
[![Build Status][build-status-img]][build-status-link]
[![Code Quality][quality-img]][quality-link]
[![Coverage][coverage-img]][coverage-link]
[![GitHub Project][github-image]][github-url]
[![API Documentation][api-docs-image]][api-docs-url]

This module adapts an [Input Aspects] library for the use with components.

A `Form` instance represents some form control. While a `Field` instance represents an input field control.

When `@SharedForm()` decorates a container component property with `Form` value, this makes that form shared.

When `@SharedField()` decorates a nested component property with `Field` value, this field is added to the form
shared by closest container, and also makes this field shared.

An `@OnSubmit()`-decorated method is called when the form shared by the component (or its closest container) submitted. 

A `FormPreset` instance provided for component context can be used to modify `Form` and `Field` aspects.


[npm-image]: https://img.shields.io/npm/v/@wesib/forms.svg?logo=npm
[npm-url]: https://www.npmjs.com/package/@wesib/forms
[build-status-img]: https://github.com/wesib/forms/workflows/Build/badge.svg
[build-status-link]: https://github.com/wesib/forms/actions?query=workflow:Build
[quality-img]: https://app.codacy.com/project/badge/Grade/e52e339d226e499fb9f8fdd8c6cd6fea
[quality-link]: https://www.codacy.com/gh/wesib/forms/dashboard?utm_source=github.com&utm_medium=referral&utm_content=wesib/forms&utm_campaign=Badge_Grade
[coverage-img]: https://app.codacy.com/project/badge/Coverage/e52e339d226e499fb9f8fdd8c6cd6fea
[coverage-link]: https://www.codacy.com/gh/wesib/forms/dashboard?utm_source=github.com&utm_medium=referral&utm_content=wesib/forms&utm_campaign=Badge_Coverage
[github-image]: https://img.shields.io/static/v1?logo=github&label=GitHub&message=project&color=informational
[github-url]: https://github.com/wesib/forms
[api-docs-image]: https://img.shields.io/static/v1?logo=typescript&label=API&message=docs&color=informational
[api-docs-url]: https://wesib.github.io/forms/ 
[Input Aspects]: https://www.npmjs.com/package/@frontmeans/input-aspects
