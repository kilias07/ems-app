#!/usr/bin/env node
/* eslint-disable */
// @ts-nocheck
"use strict";

// Stub PnP manifest to prevent the Desktop-level .pnp.cjs from being
// picked up by esbuild's Go binary when bundling this project.
// This project uses pnpm, not Yarn PnP.

const RAW_RUNTIME_STATE =
'{\
  "__info": ["Stub PnP manifest for ems-app (pnpm project)"],\
  "enableTopLevelFallback": true,\
  "ignorePatternData": null,\
  "fallbackExclusionList": [],\
  "fallbackPool": [],\
  "packageRegistryData": [\
    [null, [[".","workspace:."], null]]\
  ]\
}';

module.exports = {};
