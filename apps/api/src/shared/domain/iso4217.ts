// Liste ISO 4217 des devises (« List One » de la SIX, publiée le 2026-09-17), groupées par nombre
// de décimales des unités mineures. Les codes sans unités mineures (métaux précieux, unités de
// compte, XTS, XXX) en sont exclus : ils ne désignent pas une monnaie de paiement.
// Pas de repli sur Intl : il donne les décimales d'affichage, pas les unités mineures
// (0 pour HUF ou IDR, contre 2 dans ISO 4217), et sa liste dépend de la version d'ICU.
const CODES_BY_MINOR_UNITS: Readonly<Record<number, string>> = {
    0: 'BIF CLP DJF GNF ISK JPY KMF KRW PYG RWF UGX UYI VND VUV XAF XOF XPF',
    2: `AED AFN ALL AMD AOA ARS AUD AWG AZN BAM BBD BDT BMD BND BOB BOV BRL BSD BTN BWP BYN
        BZD CAD CDF CHE CHF CHW CNY COP COU CRC CUP CVE CZK DKK DOP DZD EGP ERN ETB EUR FJD
        FKP GBP GEL GHS GIP GMD GTQ GYD HKD HNL HTG HUF IDR ILS INR IRR JMD KES KGS KHR KPW
        KYD KZT LAK LBP LKR LRD LSL MAD MDL MGA MKD MMK MNT MOP MRU MUR MVR MWK MXN MXV MYR
        MZN NAD NGN NIO NOK NPR NZD PAB PEN PGK PHP PKR PLN QAR RON RSD RUB SAR SBD SCR SDG
        SEK SGD SHP SLE SOS SRD SSP STN SVC SYP SZL THB TJS TMT TOP TRY TTD TWD TZS UAH USD
        USN UYU UZS VED VES WST XAD XCD XCG YER ZAR ZMW ZWG`,
    3: 'BHD IQD JOD KWD LYD OMR TND',
    4: 'CLF UYW',
};

export const ISO_4217_MINOR_UNITS: ReadonlyMap<string, number> = new Map(
    Object.entries(CODES_BY_MINOR_UNITS).flatMap(([minorUnits, codes]) =>
        codes.split(/\s+/).map((code) => [code, Number(minorUnits)] as const),
    ),
);
