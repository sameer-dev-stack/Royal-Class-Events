/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as TEST_INTELLIGENCE from "../TEST_INTELLIGENCE.js";
import type * as dashboard from "../dashboard.js";
import type * as events from "../events.js";
import type * as explore from "../explore.js";
import type * as files from "../files.js";
import type * as intelligence from "../intelligence.js";
import type * as pricing from "../pricing.js";
import type * as registrations from "../registrations.js";
import type * as search from "../search.js";
import type * as seed from "../seed.js";
import type * as sslcommerz from "../sslcommerz.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  TEST_INTELLIGENCE: typeof TEST_INTELLIGENCE;
  dashboard: typeof dashboard;
  events: typeof events;
  explore: typeof explore;
  files: typeof files;
  intelligence: typeof intelligence;
  pricing: typeof pricing;
  registrations: typeof registrations;
  search: typeof search;
  seed: typeof seed;
  sslcommerz: typeof sslcommerz;
  users: typeof users;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {};
