
import { parseColor, Util } from '../src/util';

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

  testParseRGB() {
    let color = parseColor('rgb(120 121 123)');
    this.areIdentical(120, color[0]);
    this.areIdentical(121, color[1]);
    this.areIdentical(123, color[2]);
    this.areIdentical(255, color[3]);
    color = parseColor('rgb(60% 65% 70% / 125)');
    this.areIdentical(153, color[0]);
    this.areIdentical(166, color[1]);
    this.areIdentical(179, color[2]);
    this.areIdentical(125, color[3]);
  }
  testParseRGBA() {
    let color = parseColor('rgba(120 121 123 / 50%)');
    this.areIdentical(120, color[0]);
    this.areIdentical(121, color[1]);
    this.areIdentical(123, color[2]);
    this.areIdentical(128, color[3]);
    color = parseColor('rgba(120 121 123)');
    this.areIdentical(120, color[0]);
    this.areIdentical(121, color[1]);
    this.areIdentical(123, color[2]);
    this.areIdentical(255, color[3]);
  }
  testParseHexColors() {
    let color = parseColor('#123');
    this.areIdentical(0x11, color[0]);
    this.areIdentical(0x22, color[1]);
    this.areIdentical(0x33, color[2]);
    this.areIdentical(0xff, color[3]);
    color = parseColor('#123a');
    this.areIdentical(0x11, color[0]);
    this.areIdentical(0x22, color[1]);
    this.areIdentical(0x33, color[2]);
    this.areIdentical(0xaa, color[3]);
    color = parseColor('#123456');
    this.areIdentical(0x12, color[0]);
    this.areIdentical(0x34, color[1]);
    this.areIdentical(0x56, color[2]);
    this.areIdentical(0xff, color[3]);
    color = parseColor('#123456cd');
    this.areIdentical(0x12, color[0]);
    this.areIdentical(0x34, color[1]);
    this.areIdentical(0x56, color[2]);
    this.areIdentical(0xcd, color[3]);
  }
  testParseNamedColors() {
    let color = parseColor('not-a-colorname');
    this.areIdentical(0, color[0]);
    this.areIdentical(0, color[1]);
    this.areIdentical(0, color[2]);
    this.areIdentical(0, color[3]);

    color = parseColor('magenta');
    this.areIdentical(255, color[0]);
    this.areIdentical(0, color[1]);
    this.areIdentical(255, color[2]);
    this.areIdentical(255, color[3]);

    color = parseColor('hotpink');
    this.areIdentical(0xff, color[0]);
    this.areIdentical(0x69, color[1]);
    this.areIdentical(0xb4, color[2]);
    this.areIdentical(255, color[3]);
  }
}
