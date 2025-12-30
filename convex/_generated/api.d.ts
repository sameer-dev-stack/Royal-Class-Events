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
import type * as admin from "../admin.js";
import type * as backfill_zones from "../backfill_zones.js";
import type * as battle_of_decks_seed from "../battle_of_decks_seed.js";
import type * as bootstrap from "../bootstrap.js";
import type * as clearData from "../clearData.js";
import type * as collaboration from "../collaboration.js";
import type * as communications from "../communications.js";
import type * as dashboard from "../dashboard.js";
import type * as events from "../events.js";
import type * as explore from "../explore.js";
import type * as files from "../files.js";
import type * as intelligence from "../intelligence.js";
import type * as patch from "../patch.js";
import type * as pricing from "../pricing.js";
import type * as registrations from "../registrations.js";
import type * as roles from "../roles.js";
import type * as search from "../search.js";
import type * as seatMapExamples from "../seatMapExamples.js";
import type * as seatMaps from "../seatMaps.js";
import type * as seatRecommendations from "../seatRecommendations.js";
import type * as seats from "../seats.js";
import type * as seed from "../seed.js";
import type * as seedDev from "../seedDev.js";
import type * as seedRoles from "../seedRoles.js";
import type * as sslcommerz from "../sslcommerz.js";
import type * as tickets from "../tickets.js";
import type * as users from "../users.js";
import type * as venueDesigns from "../venueDesigns.js";
import type * as whiteout_seed from "../whiteout_seed.js";
import type * as zones from "../zones.js";

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
  admin: typeof admin;
  backfill_zones: typeof backfill_zones;
  battle_of_decks_seed: typeof battle_of_decks_seed;
  bootstrap: typeof bootstrap;
  clearData: typeof clearData;
  collaboration: typeof collaboration;
  communications: typeof communications;
  dashboard: typeof dashboard;
  events: typeof events;
  explore: typeof explore;
  files: typeof files;
  intelligence: typeof intelligence;
  patch: typeof patch;
  pricing: typeof pricing;
  registrations: typeof registrations;
  roles: typeof roles;
  search: typeof search;
  seatMapExamples: typeof seatMapExamples;
  seatMaps: typeof seatMaps;
  seatRecommendations: typeof seatRecommendations;
  seats: typeof seats;
  seed: typeof seed;
  seedDev: typeof seedDev;
  seedRoles: typeof seedRoles;
  sslcommerz: typeof sslcommerz;
  tickets: typeof tickets;
  users: typeof users;
  venueDesigns: typeof venueDesigns;
  whiteout_seed: typeof whiteout_seed;
  zones: typeof zones;
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
