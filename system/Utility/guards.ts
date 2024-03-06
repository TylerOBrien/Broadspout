export function isStringEnum<EnumTy extends { [k: string]: string }>(enumType: EnumTy)
{
    return function (token: unknown): token is EnumTy[keyof EnumTy]
    {
        return Object.values(enumType).includes(token as EnumTy[keyof EnumTy]);
    }
}
