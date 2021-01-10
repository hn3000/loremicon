
import { Util } from '../src/util';

import { TestClass } from "tsunit.external/tsUnitAsync";

export class UtilTest extends TestClass {

  testRandomCorrectness() {
    let u = new Util(1);

    let x = 0;
    for (var i = 0; i < 10000; ++i) {
      x = u._minirnd();
    }

    this.areIdentical(1043618065, (u as any)._current);
  }

  testRandomNumberRange() {
    let u = new Util();
    for (var i = 0; i < 10000000; ++i) {
      let x = u._minirnd();
      this.isTrue(x <= 1.0);
      this.isTrue(x >= 0.0);
    }
  }

  testRandomNumberRange2() {
    let u = new Util();
    for (var i = 0; i < 10000000; ++i) {
      let x = u.rnd(3,7);
      this.isTrue(x <= 7.0);
      this.isTrue(x >= 3.0);
    }
  }
  testRandomNumberRangeSeedZero() {
    let u = new Util(0);
    let w = [];
    for (var i = 0; i < 10000000; ++i) {
      let x = u.rnd(0,65536);
      w.push(x);
      if (w.length > 5) {
        w.shift();
      }
      const t = w.filter(a => w.filter(b => a === b).length > 3);
      this.isTrue(1 >= t.length, "no long runs "+t.join(','));
      this.isTrue(x >= 0.0, "more than 0.0");
      this.isTrue(x <= 65536.0, "less than 65536");
    }
  }

  testNextRnd() {
    let u = new Util(0);

    for (var i = 0; i < 10000000; ++i) {
      let nextPreview1 = u.rndPreview(0,1e12);
      let nextPreview2 = u.rndPreview(0,1e12);
      let nextRandom = u.rnd(0,1e12);
      this.areIdentical(nextPreview1, nextPreview2);
      this.areIdentical(nextPreview1, nextRandom);
    }
  }

  testRandomNumberRangeSeedString0() {
    let u = new Util('0' as any);
    let w = [];
    for (var i = 0; i < 10000000; ++i) {
      let x = u.rnd(0,65536);
      w.push(x);
      if (w.length > 5) {
        w.shift();
      }
      const t = w.filter(a => w.filter(b => a === b).length > 2);
      this.isTrue(1 >= t.length, "no long runs"+t.join(','));
      this.isTrue(x >= 0.0, "more than 0.0");
      this.isTrue(x <= 65536.0, "less than 65536");
    }
  }

  testRandomColors() {
    let u = new Util('0' as any);
    const reColor = /^#[\da-f]{6}$/;
    for (var i = 0; i < 10000000; ++i) {
      const rndColor = u.rndColor();
      if (!reColor.exec(rndColor)) {
        this.isTrue(false, "expected color, got "+rndColor);
      }
    }
  }
}
