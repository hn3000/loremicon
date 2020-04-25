
import { dimension, dimensionProxy, Dimension, dimensionF } from '../src/dimension';

import { TestClass } from "tsunit.external/tsUnitAsync";


export class DimensionTest extends TestClass {
    testDimensionDotValueFromStringWithoutUnit() {
        this.areIdentical(12, Dimension.value('12'));
    }
    testDimensionDotValueFromStringWithUnit() {
        this.areIdentical((2*Math.PI).toFixed(7), Dimension.value('360deg').toFixed(7));
    }
    testDimensionDotValueFromStringWithCustomUnit() {
        this.areIdentical(100, Dimension.value('20xy', {xy: 5}));
    }
    testDimensionDotValueFromStringWithFloatValue() {
        this.areIdentical(12.15, Dimension.value('2.43xy', {xy: 5}));
    }
    testDimensionFromNumber() {
        let d = dimension(12);
        this.areIdentical(12, d.value());
    }
    testDimensionFromFloatNumber() {
        let d = dimension(12.43);
        this.areIdentical(12.43, d.value());
    }
    testDimensionFromStringNoUnit() {
        let d = dimension('12');
        this.areIdentical(12, d.number, 'number should be 12');
        this.areIdentical('', d.unit, 'unit should be empty');
        this.areIdentical(12, d.value());
    }
    testDimensionFromStringFloatNoUnit() {
        let d = dimension('12.43');
        this.areIdentical(12.43, d.number, 'number should be 12.43');
        this.areIdentical('', d.unit, 'unit should be empty');
        this.areIdentical(12.43, d.value());
    }
    testDimensionFromStringPx() {
        let d = dimension('12px');
        this.areIdentical(12, d.number, 'number should be 12');
        this.areIdentical('px', d.unit, 'unit should be px');
        this.areIdentical(12, d.value());
    }
    testDimensionFromStringCustomUnit() {
        let d = dimension('12x');
        this.areIdentical(12, d.number, 'number should be 12');
        this.areIdentical('x', d.unit, 'unit should be x');
        this.areIdentical(144, d.value({x: 12}));
    }
    testDimensionFromStringFloatCustomUnit() {
        let d = dimension('12.43v');
        this.areIdentical(12.43, d.number, 'number should be 12.43');
        this.areIdentical('v', d.unit, 'unit should be v');
        this.areIdentical(62.15, d.value({v: 5}));
    }
    testDimensionFromStringInch() {
        let d = dimension('12in');
        this.areIdentical(12, d.number, 'number should be 12');
        this.areIdentical('in', d.unit, 'unit should be in');
        this.areIdentical(96*12, d.value());
    }
    testDimensionFromDimensionIsIdentical() {
        let d = dimension('12in');
        let dd = dimension(d);
        this.areIdentical(d, dd, 'dimension(d) === d');
    }
    testDimensionFromInvalidStringThrows() {
        try {
            let d = dimension('12i.n');
            this.areIdentical(12, d.number, 'number should be 12');
            this.areIdentical('i.n', d.unit, 'unit should be i.n');
            this.isFalse(true, 'should never get here');
        } catch (xx) {
            this.isTrue(xx instanceof Error);
            this.areIdentical('illegal dimension string 12i.n', xx.message);
        }
    }
    testDimensionFromTwoStringsThrows() {
        try {
            let d = new Dimension('12' as any, 'uu');
            this.areIdentical(12, d.number, 'number should be 12');
            this.areIdentical('uu', d.unit, 'unit should be uu');
            this.isFalse(true, 'should never get here');
        } catch (xx) {
            this.isTrue(xx instanceof Error);
            this.areIdentical('illegal arguments (string)12, (string)uu', xx.message);
        }
    }
    testDimensionNeg() {
        let d = dimension('1000');
        let dn = d.neg();
        this.areIdentical(-1000, dn.value());
        let dd = dn.neg();
        this.areIdentical(1000, dd.value());
    }
    testDimensionNegHasIdentity() {
        let d = dimension('1000');
        let dn = d.neg();
        this.areIdentical(d, dn.neg(), 'neg of neg should be original');
        this.areIdentical(dn, d.neg(), 'neg should return only one object');
    }
    testDimensionNegHasUnitAndNumber() {
        let d = dimension('1000');
        let dn = d.neg();
        this.areIdentical(d.unit, dn.unit, 'unit of neg should be original');
        this.areIdentical(-d.number, dn.number, 'number of neg should be negative of original');
    }
    testDimensionPlus() {
        let d = dimension('1000');
        let dr = d.plus(10);
        this.areIdentical(1010, dr.value());
    }
    testDimensionPlusHasNeitherUnitNorNumber() {
        let d = dimension('1000');
        let dr = d.plus(10);
        this.areIdentical(undefined, dr.unit);
        this.areIdentical(undefined, dr.number);
    }
    testDimensionMinus() {
        let d = dimension('1000');
        let dr = d.minus(10);
        this.areIdentical(990, dr.value());
    }
    testDimensionMinusHasNeitherUnitNorNumber() {
        let d = dimension('1000');
        let dr = d.minus(10);
        this.areIdentical(undefined, dr.unit);
        this.areIdentical(undefined, dr.number);
    }
    testDimensionResolved() {
        let d = dimension('1000xx');
        let dr = d.resolve({xx:3});
        this.areIdentical(3000, dr.value());
    }
    testDimensionResolvedHasIdentity() {
        let d = dimension('1000xx');
        let env = {xx:3};
        let dr = d.resolve(env);
        let drr = dr.resolve(env);
        let dr2 = dr.resolve({...env});
        this.areIdentical(3000, dr.value());
        this.areIdentical(3000, drr.value());
        this.areIdentical(3000, dr2.value());
        this.areIdentical(dr, drr);
        this.areNotIdentical(dr, dr2);
    }
    testDimensionResolvedHasNumberAndUnit() {
        let d = dimension('1000xx');
        let env = {xx:3};
        let dr = d.resolve(env);
        this.areIdentical('xx', dr.unit);
        this.areIdentical(1000, dr.number);
    }
    testDimensionResolvedNegHasIdentity() {
        let d = dimension('1000').resolve({});
        let dn = d.neg();
        this.areIdentical(d, dn.neg(), 'neg of neg should be original');
        this.areIdentical(dn, d.neg(), 'neg should return only one object');
    }
    testDimensionResolvedPlusNegHasIdentity() {
        let d = dimension('1000').plus(1).resolve({});
        let dn = d.neg();
        this.areIdentical(d, dn.neg(), 'neg of neg should be original');
        this.areIdentical(dn, d.neg(), 'neg should return only one object');
    }
    testDimensionResolvedPlus() {
        let d = dimension('1000xx');
        let dr = d.resolve({xx:3, xy:4});
        let dp = dr.plus('10xy');
        this.areIdentical(3000+40, dp.value());
    }
    testDimensionResolvedMinus() {
        let d = dimension('1000xx');
        let dr = d.resolve({xx:3, xy:4});
        let dm = dr.minus('10xy');
        this.areIdentical(3000-40, dm.value());
    }

    testDimensionFCanInterpolate() {
        let d1 = dimension('1000xx');
        let d2 = dimension('1000xy');
        let d = dimensionF(d1,d2, (a,b) => ((a+b)/2));
        let dr = d.resolve({xx:3, xy:4});
        this.areIdentical((-1000+2000)/2, d.value({xx:-1, xy:2}));
        this.areIdentical((3000+4000)/2, dr.value());
    }

    testDimensionFHasNeitherUnitNorNumber() {
        let d1 = dimension('1000xx');
        let d2 = dimension('1000xy');
        let d = dimensionF(d1,d2, (a,b) => ((a+b)/2));
        this.areIdentical(undefined, d.unit);
        this.areIdentical(undefined, d.number);
    }

    testDimensionProxyWorksForDestructuring() {
        let { a, b } = dimensionProxy({ a: '12pc', b: '400grad'});
        this.areIdentical(12*96/6, a.value());
        this.areIdentical((2*Math.PI).toFixed(6), b.value().toFixed(6));
    }
    testDimensionProxyAllowsDefaultValue() {
        let dp = dimensionProxy({ a: '12pc', b: '400grad'}, { c: '360deg' }, () => ({ pc: 3 }));
        let { a } = dp;
        this.areIdentical(12*3, a.value());
        this.areIdentical(a, dp.a);
    }
    testDimensionProxyReturnsSameInstance() {
        let dp = dimensionProxy({ a: '12pc', b: '400grad'}, {}, () => ({ pc: 3 }));
        let { a } = dp;
        this.areIdentical(12*3, a.value());
        this.areIdentical(a, dp.a);
    }
}
