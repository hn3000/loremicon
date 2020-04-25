
import { position, box } from '../src/position';

import { TestClass } from "tsunit.external/tsUnitAsync";
import { UnitFactorsLength } from '../src/dimension';


export class PositionTest extends TestClass {
    testDimensionFromNumbers() {
        let d = position(12, 23);
        this.areIdentical(12, d.x());
        this.areIdentical(23, d.y());
    }

    testDimensionRelative1Arg() {
        let d = position(12, 23).relative(1);
        this.areIdentical(13, d.x());
        this.areIdentical(24, d.y());
    }

    testDimensionRelative2Args() {
        let d = position(12, 23).relative(3,4);
        this.areIdentical(15, d.x());
        this.areIdentical(27, d.y());
    }

    testDimensionLeftBy() {
        let d = position(12, 23).leftBy(1);
        this.areIdentical(11, d.x());
        this.areIdentical(23, d.y());
    }
    testDimensionRightBy() {
        let d = position(12, 23).rightBy(1);
        this.areIdentical(13, d.x());
        this.areIdentical(23, d.y());
    }

    testDimensionAboveBy() {
        let d = position(12, 23).aboveBy(1);
        this.areIdentical(12, d.x());
        this.areIdentical(22, d.y());
    }
    testDimensionBelowBy() {
        let d = position(12, 23).belowBy(1);
        this.areIdentical(12, d.x());
        this.areIdentical(24, d.y());
    }

    testBoxFromNumbers() {
        let b = box(position(1,2),position(33,44));
        this.areIdentical(1, b.left());
        this.areIdentical(2, b.top());
        this.areIdentical(33, b.right());
        this.areIdentical(44, b.bottom());

        this.areIdentical(32, b.width());
        this.areIdentical(42, b.height());
    }

    testBoxHasCenter() {
        let b = box(1,1, 33,45);
        this.areIdentical(1, b.left());
        this.areIdentical(1, b.top());
        this.areIdentical(33, b.right());
        this.areIdentical(45, b.bottom());

        this.areIdentical(32, b.width());
        this.areIdentical(44, b.height());
        this.areIdentical(17, b.center().x());
        this.areIdentical(23, b.center().y());
    }

    testInsideBoxIsSmaller() {
        let b = box(1,2,33,44).insideBox(1);
        this.areIdentical(2, b.left());
        this.areIdentical(3, b.top());
        this.areIdentical(32, b.right());
        this.areIdentical(43, b.bottom());
    }
    testInsideBoxIsSmallerWithDifferentDXandDY() {
        let b = box(position(1,2),position(33,44)).insideBox(10,20);
        this.areIdentical(11, b.left());
        this.areIdentical(22, b.top());
        this.areIdentical(23, b.right());
        this.areIdentical(24, b.bottom());
        this.areIdentical(12, b.width());
        this.areIdentical(2, b.height());
    }
    testOutsideBoxIsLarger() {
        let b = box(position(1,2),position(33,44)).outsideBox(1);
        this.areIdentical(0, b.left());
        this.areIdentical(1, b.top());
        this.areIdentical(34, b.right());
        this.areIdentical(45, b.bottom());
        this.areIdentical(34, b.width());
        this.areIdentical(44, b.height());
    }
    testOutsideBoxIsLargerWithDifferentDXandDY() {
        let b = box(position(10,20),position(33,44)).outsideBox(10,20);
        this.areIdentical(0, b.left());
        this.areIdentical(0, b.top());
        this.areIdentical(43, b.right());
        this.areIdentical(64, b.bottom());
        this.areIdentical(43, b.width());
        this.areIdentical(64, b.height());
    }
    testResolvedBoxStaysResolved() {
        let env = { ...UnitFactorsLength, em: 17 };
        let b = box(position(0,0),position(400,300)).resolve(env).insideBox('1em');
        this.areIdentical(17, b.left());
        this.areIdentical(17, b.top());
        this.areIdentical(400-17, b.right());
        this.areIdentical(300-17, b.bottom());
        this.areIdentical(400-34, b.width());
        this.areIdentical(300-34, b.height());
    }
    testBoxLayout() {
        let b = box(position(0,0),position(400,300));
        let bi = b.insideBox(10);
        let bl = box(bi.topLeft(), bi.bottomLeft().rightBy(100));
        let bc = box(bl.topRight(), bi.bottomRight());

        this.areIdentical(10, bi.left());
        this.areIdentical(10, bi.top());
        this.areIdentical(390, bi.right());
        this.areIdentical(290, bi.bottom());
        this.areIdentical(10, bi.bottomLeft().x());
        this.areIdentical(290, bi.bottomLeft().y(), 'bi.bottomLeft().y()');
        this.areIdentical(390, bi.bottomRight().x());
        this.areIdentical(290, bi.bottomRight().y(), 'bi.bottomRight().y()');

        this.areIdentical(10, bl.left());
        this.areIdentical(10, bl.top());
        this.areIdentical(110, bl.right());
        this.areIdentical(290, bl.bottom());

        this.areIdentical(110, bc.left(), 'bc.left');
        this.areIdentical(10, bc.top(), 'bc.top');
        this.areIdentical(390, bc.right(), 'bc.right');
        this.areIdentical(290, bc.bottom(), 'bc.bottom');
    }

    testBoxLayoutResolve() {
        let b = box(position('0x','0x'),position('400x','300x'));
        let bi = b.insideBox('10x');
        let bl = box(bi.topLeft(), bi.bottomLeft().rightBy('100x'));
        let bc = box(bl.topRight(), bi.bottomRight());

        this.areIdentical(10, bi.left());
        this.areIdentical(10, bi.top());
        this.areIdentical(390, bi.right());
        this.areIdentical(290, bi.bottom());
        this.areIdentical(10, bi.bottomLeft().x());
        this.areIdentical(290, bi.bottomLeft().y(), 'bi.bottomLeft().y()');
        this.areIdentical(390, bi.bottomRight().x());
        this.areIdentical(290, bi.bottomRight().y(), 'bi.bottomRight().y()');

        this.areIdentical(10, bl.left());
        this.areIdentical(10, bl.top());
        this.areIdentical(110, bl.right());
        this.areIdentical(290, bl.bottom());

        this.areIdentical(110, bc.left(), 'bc.left');
        this.areIdentical(10, bc.top(), 'bc.top');
        this.areIdentical(390, bc.right(), 'bc.right');
        this.areIdentical(290, bc.bottom(), 'bc.bottom');

        bi.resolve({x:10});
        bl.resolve({x:10});
        bc.resolve({x:10});
        this.areIdentical(100, bi.left(), 'x: 10, bi.left');
        this.areIdentical(100, bi.top(), 'x: 10, bi.top');
        this.areIdentical(3900, bi.right(), 'x: 10, bi.right');
        this.areIdentical(2900, bi.bottom(), 'x: 10, bi.bottom');
        this.areIdentical(100, bi.bottomLeft().x(), 'x: 10, bi.bottomLeft.x');
        this.areIdentical(2900, bi.bottomLeft().y(), 'bi.bottomLeft().y()');
        this.areIdentical(3900, bi.bottomRight().x());
        this.areIdentical(2900, bi.bottomRight().y(), 'bi.bottomRight().y()');

        this.areIdentical(100, bl.left());
        this.areIdentical(100, bl.top());
        this.areIdentical(1100, bl.right());
        this.areIdentical(2900, bl.bottom());

        this.areIdentical(1100, bc.left(), 'bc.left');
        this.areIdentical(100, bc.top(), 'bc.top');
        this.areIdentical(3900, bc.right(), 'bc.right');
        this.areIdentical(2900, bc.bottom(), 'bc.bottom');

    }
    testBoxLayoutBelowBy() {
        let env = { em: 10 };
        let b = box(1,0, 1001, 1000);
        let bi = b.insideBox('1em', '1em').resolve(env);
        let bl = box(bi.topLeft(), bi.topRight().belowBy(bi.width())).resolve(env);

        this.areIdentical(11, bl.left());
        this.areIdentical(10, bl.top());
        this.areIdentical(1001-10, bl.right());
        this.areIdentical(1000-10, bl.bottom());
        this.areIdentical(1000-10-10, bl.width());
        this.areIdentical(1000-10-10, bl.height());

        this.areIdentical(501, bl.center().x()); //(1 + (1001-1)/2)
        this.areIdentical(500, bl.center().y());
    }
}
