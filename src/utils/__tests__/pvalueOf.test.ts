import {
  Machine,
  PCurrencySymbol,
  PValue,
  bs,
  int,
  pfn,
  list,
  pList,
  pPair,
  pair,
  PTokenName,
  ptraceInt,
} from "@harmoniclabs/plu-ts";
import { pvalueOf } from "../pvalueOf";

const PTokenAndQty = pair(PTokenName.type, int);

const mkTokenAndQty = pPair(PTokenName.type, int);

const mkTokensAndQtys = pList(PTokenAndQty);

const mkAssetClass = pPair(PCurrencySymbol.type, list(PTokenAndQty));

const mkAssetClasses = pList(pair(PCurrencySymbol.type, list(PTokenAndQty)));

const pvalueSingleton = pfn(
  [PCurrencySymbol.type, PTokenName.type, int],
  PValue.type
)((cs, tn, qty) => {
  return PValue.from(
    mkAssetClasses([
      mkAssetClass(cs, mkTokensAndQtys([mkTokenAndQty(tn, qty)])),
    ])
  );
});

const pvalueTwoTokens = pfn(
  [PCurrencySymbol.type, PTokenName.type, int, PTokenName.type, int],
  PValue.type
)((cs, tn0, qty0, tn1, qty1) => {
  return PValue.from(
    mkAssetClasses([
      mkAssetClass(
        cs,
        mkTokensAndQtys([mkTokenAndQty(tn0, qty0), mkTokenAndQty(tn1, qty1)])
      ),
    ])
  );
});

const pvalueTwoAssets = pfn(
  [PCurrencySymbol.type, PCurrencySymbol.type, PTokenName.type, int, int],
  PValue.type
)((cs0, cs1, tn, qty0, qty1) => {
  return PValue.from(
    mkAssetClasses([
      mkAssetClass(cs0, mkTokensAndQtys([mkTokenAndQty(tn, qty0)])),
      mkAssetClass(cs1, mkTokensAndQtys([mkTokenAndQty(tn, qty1)])),
    ])
  );
});

test("pvalueOf applied to a singleton", () => {
  const doStuff = pfn(
    [bs, bs, int],
    int
  )((cs, tn, qty) => {
    const testVal = pvalueSingleton.$(cs).$(tn).$(qty);
    const resQty = pvalueOf.$(cs).$(tn).$(testVal);
    return ptraceInt.$(resQty);
  });

  console.log(
    Machine.eval(
      doStuff
        .$("00000000000000000000000000000000000000000000000000000000")
        .$("c0ffee")
        .$(10)
    )
  );
});

test("pvalueOf applied to a value with one symbol and two tokens", () => {
  const doStuff = pfn(
    [bs, bs, int, bs, int],
    int
  )((cs, tn0, qty0, tn1, qty1) => {
    // const testVal = pvalueSingleton.$(cs).$(tn).$(qty);
    const testVal = pvalueTwoTokens.$(cs).$(tn0).$(qty0).$(tn1).$(qty1);
    const resQty = pvalueOf.$(cs).$(tn0).$(testVal);
    return ptraceInt.$(resQty);
  });

  console.log(
    Machine.eval(
      doStuff
        .$("00000000000000000000000000000000000000000000000000000000")
        .$("c0ffee")
        .$(10)
        .$("deadbeef")
        .$(6)
    )
  );
});

test("pvalueOf applied to a value with two symbols with one tokens each", () => {
  const doStuff = pfn(
    [bs, bs, bs, int, int],
    int
  )((cs0, cs1, tn, qty0, qty1) => {
    const testVal = pvalueTwoAssets.$(cs0).$(cs1).$(tn).$(qty0).$(qty1);
    const resQty = pvalueOf.$(cs0).$(tn).$(testVal);
    return ptraceInt.$(resQty);
  });

  console.log(
    Machine.eval(
      doStuff
        .$("00000000000000000000000000000000000000000000000000000000")
        .$("11111111111111111111111111111111111111111111111111111111")
        .$("c0ffee")
        .$(6)
        .$(10)
    )
  );
});
