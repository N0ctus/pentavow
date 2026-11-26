$names = @(
    'sys_select1.wav', 'battle_1.wav', 'battle_2.wav', 'battle_4.wav', 'battle_5.wav', 'battle_6.wav', 'battle_7.wav',
    'test_swing1.wav', 'test_swing2.wav', 'test_swing3.wav', 'test_swing4.wav', 'battle_swing_l_1.wav',
    'btl_blow1.wav', 'btl_blow2.wav', 'btl_damage0.wav', 'btl_dead1.wav', 'btl_dmf1.wav', 'btl_dmf2.wav',
    'dmg_hundred_1.wav', 'dmg_hundred_2.wav', 'battle_bow_shot1.wav',
    'effect_fire01.wav', 'effect_blueflame.wav', 'effect_volganon.wav', 'effect_fire_start_fld.wav',
    'effect_blizzard01.wav', 'effect_ice.wav', 'effect_icewall_break01.wav', 'effect_blessing_water.wav',
    'effect_thunder01.wav', 'effect_thoron.wav', 'effect_dime_thunder.wav', 'effect_thunder_start_fld.wav',
    'effect_elwind.wav', 'effect_wind.wav', 'effect_excalibur.wav', 'effect_wind_start_fld.wav',
    'effect_light01.wav', 'effect_saints.wav', 'effect_aura.wav', 'effect_light_start_fld.wav',
    'effect_darkbreath.wav', 'effect_ruin.wav', 'effect_hell.wav', 'effect_lopu.wav',
    'effect_cure_fld.wav', 'btl_cure1.wav', 'effect_recover.wav',
    'effect_anticounter.wav', 'effect_shield01.wav', 'sys_powerup1.wav', 'sys_powerdown1.wav',
    'effect_dragon_change.wav', 'effect_roar_fld.wav', 'effect_wall_break01.wav',
    'sys_warning.wav', 'sys_stageclear1.wav', 'sys_stageclear1_end.wav',
    'jingle_lvup.wav', 'sys_levelup1.wav',
    'summon_ambience.wav', 'summon_herodic_ring.wav', 'summon_orb01.wav', 'summon_impact.wav', 'summon_light.wav',
    'summon_star03.wav', 'summon_star04.wav', 'summon_star05.wav', 'summon_rare01.wav', 'summon_light_rare.wav', 'summon_stone_flash.wav',
    'sys_home_mission.wav', 'sys_home_board.wav', 'sys_wing_get.wav', 'sys_wing_get_add.wav',
    'fs_normal_flat_1.wav', 'fs_normal_flat_2.wav', 'fs_normal_flat_3.wav'
)

$missing = @()
foreach ($n in $names) {
    if (-not (Test-Path "public\sounds\feh\$n")) {
        $missing += $n
    }
}

if ($missing.Count -eq 0) {
    Write-Output "ALL $($names.Count) VERIFIED AUDIO FILES EXIST PERFECTLY!"
} else {
    Write-Output "Missing ($($missing.Count)): $($missing -join ', ')"
}
