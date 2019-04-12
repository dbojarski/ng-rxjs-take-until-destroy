import * as chai from 'chai';
import * as spies from 'chai-spies';
import { Observable, of } from 'rxjs';

import { TakeUntilDestroy } from './take-until-destroy.decorator';

chai.use(spies);

const expect = chai.expect;
const spy = chai.spy;

class SomeClass {
  @TakeUntilDestroy
  getObservable() {
    return of(5);
  }

  @TakeUntilDestroy
  getNumber() {
    return 5;
  }

  @TakeUntilDestroy
  testArgAndContext(...args: any[]) {
    this.mockFunction.apply(this, args);
    return of(null);
  }

  mockFunction(...args: any[]) {
  }
}

class ExtendedClass extends SomeClass {
  ngOnDestroy(...args:any[]) {
    this.mockFunction(...args);
  }
}

describe('TakeUntilDestroy', () => {
  it(`should add 'tud_onDestroyTrigger' to the class`, () => {
    const component = new SomeClass();

    component.getObservable();

    expect(component.tud_onDestroyTrigger instanceof Observable).to.be.true;
  });

  it(`after decorated function call, should add 'ngOnDestroy' if doesn't exist`, () => {
    const component = new SomeClass();

    component.getObservable();

    expect(component.ngOnDestroy).not.to.be.null;
  });

  it(`should extend 'ngOnDestroy' if it's already defined in the component`, () => {
    const component = new ExtendedClass();

    spy.on(component, 'mockFunction');

    component.ngOnDestroy();

    expect(component.mockFunction).to.have.been.called();
  });

  it(`should call original 'ngOnDestroy' and perform 'next' and 'complete' functions on 'tud_onDestroyTrigger'`, () => {
    const component = new ExtendedClass();

    component.getObservable();

    spy.on(component, 'mockFunction');
    spy.on(component.tud_onDestroyTrigger, 'next');
    spy.on(component.tud_onDestroyTrigger, 'complete');

    component.ngOnDestroy();

    expect(component.mockFunction).to.have.been.called();
    expect(component.tud_onDestroyTrigger.next).to.have.been.called();
    expect(component.tud_onDestroyTrigger.complete).to.have.been.called();
  });

  it(`should return unchanged function and display a warning if this function doesn't return an observable`, () => {
    const component = new SomeClass();

    spy.on(console, 'warn', () => null);  // a warning visible in browser's console

    component.getNumber();

    expect(component.tud_onDestroyTrigger).to.be.an('undefined');
    expect(console.warn).to.have.been.called();
  });

  it('should call the decorated function retaining original this and arguments', () => {
    const component = new SomeClass();

    // we need to spy on other function, because it's not possible to spy on a getter directly
    spy.on(component, 'mockFunction');
    component.testArgAndContext('arg');

    expect(component.mockFunction).to.have.been.called.with('arg');
    // @todo is there a way to test this value using those Chai spies? Jasmine has it...
  });

  it('should preserve arguments and context passed to ngOnDestroy', () => {
    const component = new ExtendedClass();

    spy.on(component, 'mockFunction');
    component.getObservable();
    component.ngOnDestroy('arg');

    expect(component.mockFunction).to.have.been.called.with('arg');
  });

  it('should not call the decorated function before it\'s explicitely called', () => {
    const spy = chai.spy(() => {});

    class Klass {
      @TakeUntilDestroy
      fn() {
        spy();
        return of(null);
      }
    }

    const instance = new Klass();

    instance.fn();
    expect(spy).to.have.been.called.once;
  });
});
