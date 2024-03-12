/**
 * System
*/

import { isStringEnum } from '@system/Utility';

/**
 * Relative Imports
*/

import { Profile, ProfileProvider } from './types';

/**
 * Public Functions
*/

export function isProfile(object: unknown): object is Profile
{
    return isProfileProvider((object as Profile).provider);
}

export function isProfileProvider(object: unknown): object is ProfileProvider
{
    return isStringEnum(ProfileProvider)(object);
}
