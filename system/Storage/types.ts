export interface StorageItem<Ty>
{
    data: Ty;
    writtenAt: Date;
}

export enum StorageMode
{
    Local,
    Remote,
}

export interface StorageOptions
{
    //
}

