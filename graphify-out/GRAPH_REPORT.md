# Graph Report - Tessera_legacy  (2026-11-27)

## Corpus Check
- 172 files · ~216,773 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 2 file(s) not represented in the graph (top: (none) 1, .css 1)

## Summary
- 1832 nodes · 3152 edges · 139 communities (125 shown, 14 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- react
- BattleArena.tsx
- SoundManager
- googleSyncService.ts
- buried-relic-3
- useGameStore.ts
- package.json
- extract_pmd_tiles.cjs
- OverworldMap.tsx
- deploy.yml
- pmdTileEngine.ts
- App.tsx
- ground
- ref_fs
- GachaModal.tsx
- generate_authentic_pixel_tiles.js
- realms.ts
- Game Design & Technical Architecture Document
- pil
- tilesets
- BattleErrorBoundary
- build_pmd_game_assets.js
- generate_enhanced_props.py
- frosty-forest
- ref_zlib
- process_map_assets.cjs
- generate_pixel_bamboo.js
- generate_pixel_crater_assets.js
- compilerOptions
- ⚔️ Pentavow
- bigMaps.ts
- buried-relic-2
- great-canyon
- murky-cave
- generate_hd_torii.cjs
- 3. Core Systems & Architecture
- buried-relic-1
- darknight-relic
- desert-region
- mt-faraway-2
- howling-forest-1
- howling-forest-2
- ice-maze
- joyous-tower
- lapis-cave
- lightning-field
- magma-cavern-1
- magma-cavern-2
- meteor-cave
- mt-blaze
- mt-faraway-1
- mt-steel-1
- mt-steel-2
- mt-thunder
- mt-thunder-peak
- extract_swords.py
- generate_hd_bamboo_and_jizo.cjs
- extract_single_tileset
- find_straw_in_assets.js
- SpriteRenderer.tsx
- generate_pixel_torii.js
- extract_suikoden_monsters.py
- numpy
- PmdWeatherOverlay.tsx
- omggif
- extract_shorelines.cjs
- make_perfect_pmd_tiles.js
- verify_canonical_blob.cjs
- crop_endless_zoom.js
- crop_pmd_zoom.js
- build_portal_spritesheets.js
- extract_all_portals.js
- generate_pixel_tiles.js
- inspect_water_colors.cjs
- make_progression_preview.js
- test_palette_extract.cjs
- test_tiled_previews.js
- jpeg-js
- blizzard
- embers
- hail
- rain
- snow
- snowDungeon
- sunny
- crop_clean_river_zoom.js
- decode_legend_bitmasks.cjs
- extract_arcane_transparent.js
- battlegrounds.ts
- find_header_groups.cjs
- generate_water_tile.js
- inspect_buried_relic.cjs
- split_reg2.js
- test_seamless.js
- verify_group_tiles.cjs
- extract_arcane_grid.js
- extract_assets.js
- find_y_lines.cjs
- generate_grand_taiko_bridge.js
- crop_east_edge.js
- crop_lantern_zoom.js
- crop_preview_clean.js
- deploy_pure_sakura.js
- extract_pmd_assets.js
- extract_pmd_clean.js
- extract_pure_tiles.js
- extract_tileset_candidates.js
- find_grid_lines.cjs
- generate_pmd_tile_data.js
- generate_taiko_bridge.js
- tilesets
- inspect_headers.cjs
- inspect_legend.cjs
- inspect_palette_grid.cjs
- inspect_right_side.cjs
- inspect_tileset_full.js
- measure_torii.js
- test_all_elements_bounds.js
- pmd_weather/manifest.json
- fog
- sandstorm
- analyze_portal_cycle.js
- crop_pure_sakura.js
- generate_lantern.js
- measure_portal_bounds.js
- vercel.json
- decode_sequential.js
- extract_portal_animations.js
- find_straw.js
- test_shoreline_assembly.cjs

## God Nodes (most connected - your core abstractions)
1. `SoundManager` - 65 edges
2. `react` - 35 edges
3. `useGameStore()` - 33 edges
4. `OverworldMap()` - 31 edges
5. `tilesets` - 28 edges
6. `wall` - 26 edges
7. `ground` - 26 edges
8. `water` - 26 edges
9. `BattleArena()` - 24 edges
10. `ElementType` - 22 edges

## Surprising Connections (you probably didn't know these)
- `3.1 State Management (`src/state/useGameStore.ts`)` --references--> `BattleInstance`  [INFERRED]
  PROJECT_ADVANCEMENT.md → src/types/game.ts
- `App()` --calls--> `BattleErrorBoundary`  [EXTRACTED]
  src/App.tsx → src/components/battle/BattleErrorBoundary.tsx
- `App()` --calls--> `BottomDock()`  [EXTRACTED]
  src/App.tsx → src/components/layout/BottomDock.tsx
- `App()` --calls--> `OverworldMap()`  [EXTRACTED]
  src/App.tsx → src/components/map/OverworldMap.tsx
- `App()` --calls--> `useGameStore()`  [EXTRACTED]
  src/App.tsx → src/state/useGameStore.ts

## Import Cycles
- None detected.

## Communities (139 total, 14 thin omitted)

### Community 0 - "react"
Cohesion: 0.11
Nodes (25): lucide-react, react, Props, State, CLASS_CONFIGS, ClassConfig, NoviceGuideTrackerProps, BottomDockProps (+17 more)

### Community 1 - "BattleArena.tsx"
Cohesion: 0.09
Nodes (38): AnimeElementalSlash(), AnimeElementalSlashProps, AttackArchetype, BattleArena(), BattleArenaProps, getUnarmedFallbackWeapon(), BossStrikeData, BossStrikeVisual() (+30 more)

### Community 3 - "googleSyncService.ts"
Cohesion: 0.06
Nodes (50): CoopBattleHealEvent, CoopBattleHitEvent, CoopEmoteEvent, CoopState, emoteListeners, handleIncomingLeave(), handleIncomingPresence(), healListeners (+42 more)

### Community 4 - "buried-relic-3"
Cohesion: 0.13
Nodes (15): atlasUrl, category, groundAlt1Indices, groundAlt2Indices, id, name, sparkleFrames, sparkleIndices (+7 more)

### Community 5 - "useGameStore.ts"
Cohesion: 0.05
Nodes (67): 3.1 State Management (`src/state/useGameStore.ts`), AnimatedWeaponIconProps, ClassIconProps, ALL_CUSTOMIZATION_PARTS, CustomizationPart, DEFAULT_UNLOCKED_PARTS, PART_MAP, PartCategory (+59 more)

### Community 6 - "package.json"
Cohesion: 0.07
Nodes (38): dependencies, lucide-react@^1.16.0, react@^18.3.1, react-dom@^18.3.1, trystero@^0.27.0, devDependencies, autoprefixer@^10.4.20, isomorphic-git@^1.44.19 (+30 more)

### Community 7 - "extract_pmd_tiles.cjs"
Cohesion: 0.06
Nodes (25): atlasBuf, atlasPath, baseSparkleRgb, baseWaterRgb, bitmaskToTileIndex, extractedRegistry, fs, getPixel() (+17 more)

### Community 8 - "OverworldMap.tsx"
Cohesion: 0.12
Nodes (28): NoviceGuideTracker(), RealmPortal(), RealmPortalProps, AccountChoiceModal, CoopModal, DungeonModal, FootstepFx, GachaModal (+20 more)

### Community 9 - "deploy.yml"
Cohesion: 0.07
Nodes (30): runs-on, steps, concurrency, cancel-in-progress, group, environment, needs, runs-on (+22 more)

### Community 10 - "pmdTileEngine.ts"
Cohesion: 0.16
Nodes (20): PmdTilemapCanvas(), init(), AutotiledCell, computeAutotileGrid(), imageCache, loadImageCached(), loadPmdManifest(), MAP_GRID_COLS (+12 more)

### Community 11 - "App.tsx"
Cohesion: 0.13
Nodes (29): AccountChoiceModal, App(), BattleArena, GachaModal, HeroOnboardingModal, JobModal, LoadoutModal, ViewLoadingFallback() (+21 more)

### Community 12 - "ground"
Cohesion: 0.10
Nodes (44): colors, colors, colors, ground, wall, water, colors, colors (+36 more)

### Community 13 - "ref_fs"
Cohesion: 0.08
Nodes (15): pngRefs, searchPngs(), code, lines, content, fs, notFound, content (+7 more)

### Community 14 - "GachaModal.tsx"
Cohesion: 0.23
Nodes (17): AnimatedWeaponIcon(), AstralSummonsAltar(), AstralSummonsAltarProps, ClassIcon(), SpriteRenderer(), DungeonModal(), GachaModal(), HeroOnboardingModal() (+9 more)

### Community 15 - "generate_authentic_pixel_tiles.js"
Cohesion: 0.09
Nodes (21): abyssGrid, abyssLookup, abyssPNG, AP, cobbleGrid, cobbleLookup, cobblePNG, CP (+13 more)

### Community 16 - "realms.ts"
Cohesion: 0.22
Nodes (10): ALL_BATTLEGROUND_REALMS, battlegroundToRealm(), FROST_TILESETS, getBossAndMobsForBattleground(), GOLD_ELECTRIC_TILESETS, OCEAN_TILESETS, REALM_MAP, VIOLET_DARK_TILESETS (+2 more)

### Community 17 - "Game Design & Technical Architecture Document"
Cohesion: 0.09
Nodes (22): 1. Google Antigravity Master Execution Prompt, 2. Core Concept & Gameplay Loop, 3.1 Overworld Map: *The Whispering Glade*, 3.2 Autonomous AI Players & Drop-In System, 3. World, Map & Seamless Co-op Mechanics, 4.1 No-Mana Weapon Hotbar, 4.2 Elemental Affinity Matrix, 4.3 Boss Threat (Aggro) & Role Synergy (+14 more)

### Community 18 - "pil"
Cohesion: 0.13
Nodes (6): extract_one(), find_bands(), main(), place_on_canvas(), slice_row_cells(), fix_portal_sheet()

### Community 19 - "tilesets"
Cohesion: 0.13
Nodes (15): atlasUrl, category, groundAlt1Indices, groundAlt2Indices, id, name, sparkleFrames, sparkleIndices (+7 more)

### Community 21 - "build_pmd_game_assets.js"
Cohesion: 0.17
Nodes (9): grass24, grass48, img, lilyBuf, lotusBuf, reedBuf, water24, water48 (+1 more)

### Community 22 - "generate_enhanced_props.py"
Cohesion: 0.38
Nodes (20): gen_brazier_fire(), gen_cactus(), gen_crater_boulder(), gen_dead_tree(), gen_desert_pillar(), gen_fox_statue(), gen_ice_crystal(), gen_jizo_statue() (+12 more)

### Community 23 - "frosty-forest"
Cohesion: 0.13
Nodes (15): atlasUrl, category, groundAlt1Indices, groundAlt2Indices, id, name, sparkleFrames, sparkleIndices (+7 more)

### Community 24 - "ref_zlib"
Cohesion: 0.11
Nodes (9): img, findExact(), readPNG(), target, fs, img, zlib, { width, height, pixels } (+1 more)

### Community 25 - "process_map_assets.cjs"
Cohesion: 0.11
Nodes (16): cluster1, cluster2, crc32(), crcTable, encodePng(), makeChunk(), fs, lotusKeyed (+8 more)

### Community 26 - "generate_pixel_bamboo.js"
Cohesion: 0.11
Nodes (16): bambooGrid, bambooLookup, bambooPNG, BP, clusterGrid, clusterLeaves, clusterPNG, createPNG() (+8 more)

### Community 27 - "generate_pixel_crater_assets.js"
Cohesion: 0.11
Nodes (16): boulderGrid, boulderLookup, boulderPNG, BP, circlePNG, corePNG, CP, createPNG() (+8 more)

### Community 28 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+9 more)

### Community 29 - "⚔️ Pentavow"
Cohesion: 0.12
Nodes (16): 1. ⚔️ Hero Onboarding & 3 Archetype Classes, 2. 🌾 Zero-Weapon Start & Equipment Farming, 3. 🌐 Real-Time P2P Co-op Multiplayer (Zero Server Cost), 4. ☁️ Google Cloud Save Sync & Guest Mode, 🌐 **Backup Mirror:**, 🕹️ Controls, 🌟 Game Inspiration & AI Architecture, 🎮 Gameplay Heritage (+8 more)

### Community 30 - "bigMaps.ts"
Cohesion: 0.12
Nodes (17): AUTUMN_GOLD_TILESETS, buildBigMap(), COASTAL_AQUA_TILESETS, CORE_REALM_SPECS, COSMIC_VIOLET_TILESETS, createRng(), DESERT_GOLD_TILESETS, FROST_TILESETS (+9 more)

### Community 31 - "buried-relic-2"
Cohesion: 0.13
Nodes (15): atlasUrl, category, groundAlt1Indices, groundAlt2Indices, id, name, sparkleFrames, sparkleIndices (+7 more)

### Community 32 - "great-canyon"
Cohesion: 0.13
Nodes (15): atlasUrl, category, groundAlt1Indices, groundAlt2Indices, id, name, sparkleFrames, sparkleIndices (+7 more)

### Community 33 - "murky-cave"
Cohesion: 0.13
Nodes (15): atlasUrl, category, groundAlt1Indices, groundAlt2Indices, id, name, sparkleFrames, sparkleIndices (+7 more)

### Community 34 - "generate_hd_torii.cjs"
Cohesion: 0.16
Nodes (15): buf, crc32(), crcTable, CX, encodePng(), makeChunk(), fillRect(), fs (+7 more)

### Community 35 - "3. Core Systems & Architecture"
Cohesion: 0.13
Nodes (14): 1. Executive Summary & Vision, 2. Directory Structure & File Map, 3.2 Combat System (`src/components/battle/BattleArena.tsx`), 3.3 Overworld & Tilemap Engine (`src/utils/pmdTileEngine.ts`), 3.4 Job & Evolution System (`src/data/jobs.ts`), 3.5 Weapons & Forge System (`src/data/weapons.ts` & `src/components/modals/LoadoutModal.tsx`), 3.6 Audio Engine (`src/utils/audioManager.ts`), 3.7 P2P Co-op & Cloud Sync (`src/services/coopMultiplayer.ts`) (+6 more)

### Community 36 - "buried-relic-1"
Cohesion: 0.13
Nodes (15): atlasUrl, category, groundAlt1Indices, groundAlt2Indices, id, name, sparkleFrames, sparkleIndices (+7 more)

### Community 37 - "darknight-relic"
Cohesion: 0.13
Nodes (15): atlasUrl, category, groundAlt1Indices, groundAlt2Indices, id, name, sparkleFrames, sparkleIndices (+7 more)

### Community 38 - "desert-region"
Cohesion: 0.13
Nodes (15): atlasUrl, category, groundAlt1Indices, groundAlt2Indices, id, name, sparkleFrames, sparkleIndices (+7 more)

### Community 39 - "mt-faraway-2"
Cohesion: 0.13
Nodes (15): atlasUrl, category, groundAlt1Indices, groundAlt2Indices, id, name, sparkleFrames, sparkleIndices (+7 more)

### Community 40 - "howling-forest-1"
Cohesion: 0.13
Nodes (15): atlasUrl, category, groundAlt1Indices, groundAlt2Indices, id, name, sparkleFrames, sparkleIndices (+7 more)

### Community 41 - "howling-forest-2"
Cohesion: 0.13
Nodes (15): atlasUrl, category, groundAlt1Indices, groundAlt2Indices, id, name, sparkleFrames, sparkleIndices (+7 more)

### Community 42 - "ice-maze"
Cohesion: 0.13
Nodes (15): atlasUrl, category, groundAlt1Indices, groundAlt2Indices, id, name, sparkleFrames, sparkleIndices (+7 more)

### Community 43 - "joyous-tower"
Cohesion: 0.13
Nodes (15): atlasUrl, category, groundAlt1Indices, groundAlt2Indices, id, name, sparkleFrames, sparkleIndices (+7 more)

### Community 44 - "lapis-cave"
Cohesion: 0.13
Nodes (15): atlasUrl, category, groundAlt1Indices, groundAlt2Indices, id, name, sparkleFrames, sparkleIndices (+7 more)

### Community 45 - "lightning-field"
Cohesion: 0.13
Nodes (15): atlasUrl, category, groundAlt1Indices, groundAlt2Indices, id, name, sparkleFrames, sparkleIndices (+7 more)

### Community 46 - "magma-cavern-1"
Cohesion: 0.13
Nodes (15): atlasUrl, category, groundAlt1Indices, groundAlt2Indices, id, name, sparkleFrames, sparkleIndices (+7 more)

### Community 47 - "magma-cavern-2"
Cohesion: 0.13
Nodes (15): atlasUrl, category, groundAlt1Indices, groundAlt2Indices, id, name, sparkleFrames, sparkleIndices (+7 more)

### Community 48 - "meteor-cave"
Cohesion: 0.13
Nodes (15): atlasUrl, category, groundAlt1Indices, groundAlt2Indices, id, name, sparkleFrames, sparkleIndices (+7 more)

### Community 49 - "mt-blaze"
Cohesion: 0.13
Nodes (15): atlasUrl, category, groundAlt1Indices, groundAlt2Indices, id, name, sparkleFrames, sparkleIndices (+7 more)

### Community 50 - "mt-faraway-1"
Cohesion: 0.13
Nodes (15): atlasUrl, category, groundAlt1Indices, groundAlt2Indices, id, name, sparkleFrames, sparkleIndices (+7 more)

### Community 51 - "mt-steel-1"
Cohesion: 0.13
Nodes (15): atlasUrl, category, groundAlt1Indices, groundAlt2Indices, id, name, sparkleFrames, sparkleIndices (+7 more)

### Community 52 - "mt-steel-2"
Cohesion: 0.13
Nodes (15): atlasUrl, category, groundAlt1Indices, groundAlt2Indices, id, name, sparkleFrames, sparkleIndices (+7 more)

### Community 53 - "mt-thunder"
Cohesion: 0.13
Nodes (15): atlasUrl, category, groundAlt1Indices, groundAlt2Indices, id, name, sparkleFrames, sparkleIndices (+7 more)

### Community 54 - "mt-thunder-peak"
Cohesion: 0.13
Nodes (15): atlasUrl, category, groundAlt1Indices, groundAlt2Indices, id, name, sparkleFrames, sparkleIndices (+7 more)

### Community 55 - "extract_swords.py"
Cohesion: 0.26
Nodes (10): extract_sn2_sheet(), extract_sn3_axes(), extract_sn3_bows(), extract_sn3_spears(), extract_sn3_swords(), find_y_bands(), flood_fill_black_to_alpha(), format_as_32x32_icon() (+2 more)

### Community 56 - "generate_hd_bamboo_and_jizo.cjs"
Cohesion: 0.14
Nodes (11): BAMBOO, clusterBuf, crc32(), crcTable, encodePng(), makeChunk(), fs, JIZO (+3 more)

### Community 57 - "extract_single_tileset"
Cohesion: 0.13
Nodes (12): apply_palette_frame(), clean_tile(), detect_grid(), detect_palette_tables(), extract_single_tileset(), main(), match_palette_table(), extract_pmd_tiles() (+4 more)

### Community 58 - "find_straw_in_assets.js"
Cohesion: 0.18
Nodes (9): readPNG(), scanDir(), scanPng(), strawPixels, target, readPNG(), scanDir(), getAllPngs() (+1 more)

### Community 59 - "SpriteRenderer.tsx"
Cohesion: 0.21
Nodes (12): AnimatedBossSprite(), AnimatedCharacterSprite(), AnimatedEnemySprite(), BOSS_CONFIGS, BossConfig, ENEMY_CONFIGS, EnemyConfig, normalizeJobKey() (+4 more)

### Community 60 - "generate_pixel_torii.js"
Cohesion: 0.22
Nodes (8): C, createPNG(), grid, kasagiTopY, pngBuffer, ropeY, setSymmetric(), setTexel()

### Community 61 - "extract_suikoden_monsters.py"
Cohesion: 0.24
Nodes (4): clean_frame(), get_sorted_anim_frames(), measure_fg_rgb(), pack_monster()

### Community 62 - "numpy"
Cohesion: 0.23
Nodes (12): extract_row_frames(), flood_fill_black_to_alpha(), main(), render_aligned_32x32_strip(), extract_embers(), extract_fog(), extract_hail(), extract_misc() (+4 more)

### Community 63 - "PmdWeatherOverlay.tsx"
Cohesion: 0.24
Nodes (11): buildParticles(), imageCache, loadWeatherImage(), PetalOrSpark, PmdWeatherOverlay(), PmdWeatherOverlayProps, tileImage(), tileSpriteSheetFrame() (+3 more)

### Community 64 - "omggif"
Cohesion: 0.20
Nodes (8): omggif@^1.0.10, omggif, buf, canvas, reader, buf, canvas, reader

### Community 65 - "extract_shorelines.cjs"
Cohesion: 0.22
Nodes (10): buf, crc32(), crcTable, crop(), encodePng(), makeChunk(), fs, jpeg (+2 more)

### Community 66 - "make_perfect_pmd_tiles.js"
Cohesion: 0.18
Nodes (7): grass24, grass48, img, lotusBuf, water24, water48, writePNG()

### Community 67 - "verify_canonical_blob.cjs"
Cohesion: 0.20
Nodes (8): bitmaskSet, canonicalSet, fs, getPixel(), img, legendMap, sampleBlock(), zlib

### Community 68 - "crop_endless_zoom.js"
Cohesion: 0.20
Nodes (7): cropBuf, cropH, cropW, cropX0, cropY0, img, writePNG()

### Community 69 - "crop_pmd_zoom.js"
Cohesion: 0.20
Nodes (7): cropBuf, cropH, cropW, cropX0, cropY0, img, writePNG()

### Community 70 - "build_portal_spritesheets.js"
Cohesion: 0.22
Nodes (6): buf, canvas, elements, frames, reader, savePNG()

### Community 71 - "extract_all_portals.js"
Cohesion: 0.22
Nodes (6): buf, canvas, elements, frames, reader, savePNG()

### Community 72 - "generate_pixel_tiles.js"
Cohesion: 0.28
Nodes (7): cobblePalette, cobblePNG, createPNG(), grassPalette, grassPNG, pseudo(), stones

### Community 73 - "inspect_water_colors.cjs"
Cohesion: 0.22
Nodes (6): colorsG8_T0, colorsG8_T4, colorsG9_T0, fs, img, zlib

### Community 74 - "make_progression_preview.js"
Cohesion: 0.22
Nodes (6): buf, canvas, frames, reader, sampleFrames, savePNG()

### Community 75 - "test_palette_extract.cjs"
Cohesion: 0.22
Nodes (5): fs, img, sparklePalette, waterPalette, zlib

### Community 76 - "test_tiled_previews.js"
Cohesion: 0.22
Nodes (6): grassTile, img, preview192, water192, waterTile, writePNG()

### Community 77 - "jpeg-js"
Cohesion: 0.25
Nodes (6): jpeg-js@^0.4.4, jpeg-js, buf, colActivity, decoded, spans

### Community 78 - "blizzard"
Cohesion: 0.25
Nodes (8): blizzard, cols, fh, file, fps, frames, fw, rows

### Community 79 - "embers"
Cohesion: 0.25
Nodes (8): embers, cols, fh, file, fps, frames, fw, rows

### Community 80 - "hail"
Cohesion: 0.25
Nodes (8): hail, cols, fh, file, fps, frames, fw, rows

### Community 81 - "rain"
Cohesion: 0.25
Nodes (8): rain, cols, fh, file, fps, frames, fw, rows

### Community 82 - "snow"
Cohesion: 0.25
Nodes (8): snow, cols, fh, file, fps, frames, fw, rows

### Community 83 - "snowDungeon"
Cohesion: 0.25
Nodes (8): snowDungeon, cols, fh, file, fps, frames, fw, rows

### Community 84 - "sunny"
Cohesion: 0.25
Nodes (8): sunny, cols, fh, file, fps, frames, fw, rows

### Community 85 - "crop_clean_river_zoom.js"
Cohesion: 0.25
Nodes (5): cropBuf, cropH, cropW, img, writePNG()

### Community 86 - "decode_legend_bitmasks.cjs"
Cohesion: 0.29
Nodes (6): fs, getPixel(), img, legendTiles, sampleBlock(), zlib

### Community 87 - "extract_arcane_transparent.js"
Cohesion: 0.25
Nodes (5): buf, canvas, frames, reader, savePNG()

### Community 88 - "battlegrounds.ts"
Cohesion: 0.24
Nodes (9): PmdTilemapCanvasProps, ALL_BATTLEGROUNDS, BATTLEGROUND_MAP, BattlegroundDefinition, MapArchetype, PmdTilesetId, PropTheme, GeneratedBigMap (+1 more)

### Community 89 - "find_header_groups.cjs"
Cohesion: 0.25
Nodes (5): colStarts, fs, headerSeparators, img, zlib

### Community 90 - "generate_water_tile.js"
Cohesion: 0.25
Nodes (6): createPNG(), flowerPNG, koiPNG, lotusPNG, waterPal, waterPNG

### Community 91 - "inspect_buried_relic.cjs"
Cohesion: 0.25
Nodes (5): colorCounts, fs, img, sorted, zlib

### Community 92 - "split_reg2.js"
Cohesion: 0.25
Nodes (6): buf, decoded, greenCols, greenRows, redCols, redRows

### Community 93 - "test_seamless.js"
Cohesion: 0.32
Nodes (5): buf, createPNG(), getMasterPx(), makeSeamlessTile(), { width, height, data }

### Community 94 - "verify_group_tiles.cjs"
Cohesion: 0.29
Nodes (6): fs, getPixel(), groupNames, img, isTilePresent(), zlib

### Community 95 - "extract_arcane_grid.js"
Cohesion: 0.29
Nodes (5): buf, canvas, frames, reader, savePNG()

### Community 96 - "extract_assets.js"
Cohesion: 0.38
Nodes (5): buf, decoded, extractBox(), getPx(), writePNG()

### Community 97 - "find_y_lines.cjs"
Cohesion: 0.29
Nodes (4): fs, img, yLines, zlib

### Community 98 - "generate_grand_taiko_bridge.js"
Cohesion: 0.33
Nodes (5): bridgePNG, createPNG(), deckY(), P, postXList

### Community 99 - "crop_east_edge.js"
Cohesion: 0.33
Nodes (3): cropPixels, current, writePNG()

### Community 100 - "crop_lantern_zoom.js"
Cohesion: 0.33
Nodes (3): cropPixels, current, writePNG()

### Community 101 - "crop_preview_clean.js"
Cohesion: 0.40
Nodes (3): crop(), img, writePNG()

### Community 102 - "deploy_pure_sakura.js"
Cohesion: 0.33
Nodes (3): savePNG(), unwanted, { width, height, pixels }

### Community 103 - "extract_pmd_assets.js"
Cohesion: 0.40
Nodes (3): crop(), img, writePNG()

### Community 104 - "extract_pmd_clean.js"
Cohesion: 0.40
Nodes (3): crop(), img, writePNG()

### Community 105 - "extract_pure_tiles.js"
Cohesion: 0.40
Nodes (4): buf, createPNG(), cropTile(), { width, height, data }

### Community 106 - "extract_tileset_candidates.js"
Cohesion: 0.40
Nodes (4): buf, createPNG(), cropTile(), { width, height, data }

### Community 107 - "find_grid_lines.cjs"
Cohesion: 0.33
Nodes (3): fs, img, zlib

### Community 108 - "generate_pmd_tile_data.js"
Cohesion: 0.33
Nodes (4): grass, grassB64, water, waterB64

### Community 109 - "generate_taiko_bridge.js"
Cohesion: 0.40
Nodes (4): bridgePNG, createPNG(), deckY(), P

### Community 110 - "tilesets"
Cohesion: 0.29
Nodes (6): category, id, name, tilesets, normal-maze, tileSize

### Community 111 - "inspect_headers.cjs"
Cohesion: 0.33
Nodes (3): fs, img, zlib

### Community 112 - "inspect_legend.cjs"
Cohesion: 0.33
Nodes (3): fs, img, zlib

### Community 113 - "inspect_palette_grid.cjs"
Cohesion: 0.33
Nodes (3): fs, img, zlib

### Community 114 - "inspect_right_side.cjs"
Cohesion: 0.33
Nodes (3): fs, img, zlib

### Community 115 - "inspect_tileset_full.js"
Cohesion: 0.40
Nodes (4): buf, createPNG(), cropToPNG(), { width, height, data }

### Community 116 - "measure_torii.js"
Cohesion: 0.33
Nodes (4): leftPosts, midY, rightPosts, { width, height, pixels }

### Community 117 - "test_all_elements_bounds.js"
Cohesion: 0.33
Nodes (5): buf, canvas, elements, frames, reader

### Community 118 - "pmd_weather/manifest.json"
Cohesion: 0.40
Nodes (4): cloudShadows, fh, file, fw

### Community 119 - "fog"
Cohesion: 0.40
Nodes (5): fog, darkFile, fh, fw, lightFile

### Community 120 - "sandstorm"
Cohesion: 0.40
Nodes (5): sandstorm, darkFile, fh, fw, lightFile

### Community 121 - "analyze_portal_cycle.js"
Cohesion: 0.40
Nodes (4): buf, canvas, phases, reader

### Community 123 - "generate_lantern.js"
Cohesion: 0.40
Nodes (3): createPNG(), lanternPNG, P

### Community 124 - "measure_portal_bounds.js"
Cohesion: 0.40
Nodes (4): buf, canvas, frames, reader

### Community 125 - "vercel.json"
Cohesion: 0.40
Nodes (4): buildCommand, framework, outputDirectory, rewrites

### Community 128 - "find_straw.js"
Cohesion: 0.67
Nodes (3): matchInImage(), readPNG(), target

### Community 138 - "test_shoreline_assembly.cjs"
Cohesion: 0.40
Nodes (3): content, fs, zlib

## Knowledge Gaps
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `BattleArena.tsx`, `useGameStore.ts`, `package.json`, `OverworldMap.tsx`, `pmdTileEngine.ts`, `App.tsx`, `GachaModal.tsx`, `SpriteRenderer.tsx`, `PmdWeatherOverlay.tsx`?**
  _High betweenness centrality (0.126) - this node is a cross-community bridge._
- **Should `react` be split into smaller, more focused modules?**
  _Cohesion score 0.11025641025641025 - nodes in this community are weakly interconnected._
- **Why does `omggif` connect `omggif` to `package.json`, `extract_all_portals.js`, `build_portal_spritesheets.js`, `make_progression_preview.js`, `measure_portal_bounds.js`, `test_all_elements_bounds.js`, `extract_arcane_transparent.js`, `analyze_portal_cycle.js`, `extract_portal_animations.js`, `decode_sequential.js`, `extract_arcane_grid.js`?**
  _High betweenness centrality (0.112) - this node is a cross-community bridge._
- **Should `BattleArena.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08673469387755102 - nodes in this community are weakly interconnected._
- **Why does `jpeg-js` connect `jpeg-js` to `extract_assets.js`, `extract_shorelines.cjs`, `package.json`, `extract_pure_tiles.js`, `extract_tileset_candidates.js`, `inspect_tileset_full.js`, `split_reg2.js`, `test_seamless.js`?**
  _High betweenness centrality (0.075) - this node is a cross-community bridge._
- **Should `SoundManager` be split into smaller, more focused modules?**
  _Cohesion score 0.14184397163120568 - nodes in this community are weakly interconnected._
- **Should `googleSyncService.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05858585858585859 - nodes in this community are weakly interconnected._