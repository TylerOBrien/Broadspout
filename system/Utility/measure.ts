/**
 * Types/Interfaces
*/

export enum UnitSystem
{
    Metric = 1,
    Imperial,
}

export enum Distance
{
    Centimetre = 3,
    Metre,
    Kilometre,
    Inch,
    Feet,
    Yard,
    Mile,
}

enum MetaDistance
{
    Min = Distance.Centimetre,
    Max = Distance.Mile,
}

export enum Mass
{
    Gram = MetaDistance.Max + 1,
    Kilogram,
    Ounce,
    Pound,
}

enum MetaMass
{
    Min = Mass.Gram,
    Max = Mass.Pound,
}

export enum Volume
{
    Millilitre = MetaMass.Max + 1,
    Litre,
    Ounce,
}

enum MetaVolume
{
    Min = Volume.Millilitre,
    Max = Volume.Ounce,
}

export enum Area
{
    Hectare = MetaVolume.Max + 1,
    Acre,
}

enum MetaArea
{
    Min = Area.Hectare,
    Max = Area.Acre,
}

export enum SameType
{
    Unit = MetaArea.Max + 1,
    System,
}

export type SomeUnit = Distance | Mass | Volume | Area;

/**
 * Guards
*/

/**
 * @return {boolean}
 */
function isDistance(
    which: Distance | Mass | Volume | Area): boolean
{
    return which >= MetaDistance.Min && which <= MetaDistance.Max;
}

/**
 * @return {boolean}
 */
function isMass(
    which: Distance | Mass | Volume | Area): boolean
{
    return which >= MetaMass.Min && which <= MetaMass.Max;
}

/**
 * @return {boolean}
 */
function isVolume(
    which: Distance | Mass | Volume | Area): boolean
{
    return which >= MetaVolume.Min && which <= MetaVolume.Max;
}

/**
 * @return {boolean}
 */
function isArea(
    which: Distance | Mass | Volume | Area): boolean
{
    return which >= MetaArea.Min && which <= MetaArea.Max;
}

/**
 * @return {boolean}
 */
function isMetric(
    which: Distance | Mass | Volume | Area): boolean
{
    if (isDistance(which)) {
        return which >= Distance.Centimetre && which <= Distance.Kilometre;
    }

    if (isMass(which)) {
        return which >= Mass.Gram && which <= Mass.Kilogram;
    }

    if (isVolume(which)) {
        return which >= Volume.Millilitre && which <= Volume.Litre;
    }

    if (isArea(which)) {
        return which === Area.Hectare;
    }
}

/**
 * @return {boolean}
 */
function isImperial(
    which: Distance | Mass | Volume | Area): boolean
{
    if (isDistance(which)) {
        return which >= Distance.Inch && which <= Distance.Mile;
    }

    if (isMass(which)) {
        return which >= Mass.Ounce && which <= Mass.Pound;
    }

    if (isVolume(which)) {
        return which === Volume.Ounce;
    }

    if (isArea(which)) {
        return which === Area.Acre;
    }
}

/**
 * Functions
*/

/**
 * Returns the given amount in the smallest possible measurement type.
 *
 * @param {number} amount
 * @param {Distance | Mass | Volume | Area} type
 *
 * @return {number}
 */
function base(
    amount: number,
    type: Distance | Mass | Volume | Area): number
{
    switch (type) {
    case Distance.Centimetre: return amount;
    case Distance.Metre:      return amount * 100;
    case Distance.Kilometre:  return amount * 100000;
    case Distance.Inch:       return amount;
    case Distance.Feet:       return amount * 12;
    case Distance.Yard:       return amount * 36;
    case Distance.Mile:       return amount * 63360;
    }

    return null;
}

/**
 * Returns the measurement type most equivalent to the given measurement type
 * from what is assumed to be a different measurement system.
 *
 * In other words this will take the centimetre type, for example, and return
 * the inch type if given the imperial system as an inch is most similar to a
 * centimetre.
 *
 * @param {Distance | Mass | Volume | Area} type
 * @param {UnitSystem} system
 *
 * @return {Distance | Mass | Volume | Area}
 */
function equiv(
    type: Distance | Mass | Volume | Area,
    system: UnitSystem): Distance | Mass | Volume | Area
{
    switch (type) {
    case Distance.Centimetre: return system === UnitSystem.Metric   ? Distance.Centimetre : Distance.Inch;
    case Distance.Metre:      return system === UnitSystem.Metric   ? Distance.Metre      : Distance.Feet;
    case Distance.Kilometre:  return system === UnitSystem.Metric   ? Distance.Kilometre  : Distance.Mile;
    case Distance.Inch:       return system === UnitSystem.Imperial ? Distance.Inch       : Distance.Centimetre;
    case Distance.Feet:       return system === UnitSystem.Imperial ? Distance.Feet       : Distance.Metre;
    case Distance.Yard:       return system === UnitSystem.Imperial ? Distance.Yard       : Distance.Metre;
    case Distance.Mile:       return system === UnitSystem.Imperial ? Distance.Mile       : Distance.Kilometre;
    }

    return null;
}

/**
 * Returns the given amount in metric.
 *
 * If the given type is metric it will be returned unchanged.
 *
 * If the given type is imperial it will be converted to the closest possible
 * metric equivalent.
 *
 * @param {number} amount
 * @param {Distance | Mass | Volume | Area} type
 *
 * @return {number}
 */
function metric(
    amount: number,
    type: Distance | Mass | Volume | Area): number
{
    if (isMetric(type)) {
        return amount;
    }

    switch (type) {
    case Distance.Inch: return amount * 2.54; // centimetres
    case Distance.Feet: return amount * 0.3048; // metres
    case Distance.Yard: return amount * 0.9144; // metres
    case Distance.Mile: return amount * 1.609344; // kilometres
    }

    return null;
}

/**
 * @param {number} amount
 * @param {Distance | Mass | Volume | Area} from
 * @param {Distance | Mass | Volume | Area} to
 *
 * @return {number}
 */
function convert(
    amount: number,
    from: Distance | Mass | Volume | Area,
    to: Distance | Mass | Volume | Area): number
{
    if (from === to) {
        return amount;
    }

    if (!same(SameType.Unit, from, to)) {
        return null;
    }

    const fromBase = base(metric(amount, from), equiv(from, UnitSystem.Metric));
    const toBase = base(metric(1, to), equiv(to, UnitSystem.Metric));

    return fromBase / toBase;
}

/**
 * @return {boolean}
 */
function same(
    type: SameType,
    first: Distance | Mass | Volume | Area,
    second: Distance | Mass | Volume | Area): boolean
{
    switch (type) {
    case SameType.System:
        if (isMetric(first))   return isMetric(second);
        if (isImperial(first)) return isImperial(second);
        break;
    case SameType.Unit:
        if (isDistance(first)) return isDistance(second);
        if (isMass(first))     return isMass(second);
        if (isVolume(first))   return isVolume(second);
        if (isArea(first))     return isArea(second);
        break;
    }

    return false;
}

/**
 * Utility
*/

export const Measure = {
    base,
    metric,
    convert,
    same,
};
