import type { Page } from "@playwright/test";
import type { Dappwright } from "@tenkeylabs/dappwright";
import assert from 'assert';

/**
 * Function to get the localStorage key value pairs
 * @param page Currently open playwright page
 * @returns Object with key value pair of localStorage items
 */
export async function getLocalStorageItems(page: Page): Promise<{ [key: string]: string }> {
    const localStorageItems = await page.evaluate(() => {
        const localStorageKeys = Object.keys(localStorage);
        const items: { [key: string]: string } = {};

        localStorageKeys.forEach((key) => {
            items[key] = localStorage.getItem(key) || '';
        });

        return items;
    });

    return localStorageItems;
}

/**
 * Compare key value pair
 * @param obj Object to compare
 * @param key expected key 
 * @param value expected value
 */
export function assertKeyValuePair(obj: Record<string, any>, key: string, value: any) {
    assert.deepStrictEqual(obj[key], value, `Expected key '${key}' with value '${value}' not found in the object.`);
}

/**
 * Function to signin to studio using metamask
 * @param page Currently open playwright page
 * @param wallet Configured Hardhat wallet
 */
export async function signInUsingMetamask(page: Page, wallet: Dappwright) {

    // Navigate to sign-in page
    await page.goto('/sign-in');

    // Click on connect wallet
    await page.getByRole('button', { name: 'Connect Wallet' }).click();

    // Get the web3Modal element
    const web3Modal = await page.$$('.web3modal-provider-wrapper');

    // Select the metamask wallet
    await web3Modal[0]?.click();

    // Connect with metamask
    await wallet.approve();

    // Assert localStorage
    assertKeyValuePair(await getLocalStorageItems(page), 'WEB3_CONNECT_CACHED_PROVIDER', '"injected"');
}