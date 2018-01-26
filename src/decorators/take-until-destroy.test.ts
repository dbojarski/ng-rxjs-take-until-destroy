import * as chai from 'chai';
import * as spies from 'chai-spies';
import { TakeUntilDestroy } from './take-until-destroy.decorator';
import { Observable } from 'rxjs/Rx';

chai.use(spies);

const expect = chai.expect;
const spy = chai.spy;

class SomeClass {
  @TakeUntilDestroy
  getObservable() {
    return Observable.of(5);
  }

  @TakeUntilDestroy
  getNumber() {
    return 5;
  }

  mockFunction() {
  }
}

class ExtendedClass extends SomeClass {
  ngOnDestroy() {
    this.mockFunction();
  }
}

describe('TakeUntilDestroy', () => {
  it(`should add 'tud_onDestroyTrigger' to the class`, () => {
    const component = new SomeClass();

    component.getObservable();

    expect(component.tud_onDestroyTrigger instanceof Observable).to.be.true;
  });

  it(`before decorated function call, should set 'ngOnDestroy' on null if component doesn't have it`, () => {
    const component = new SomeClass();

    expect(component.ngOnDestroy).to.be.null;
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
});