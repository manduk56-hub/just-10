# Minecraft texture sources

These are Minecraft game textures mirrored by PrismarineJS/minecraft-assets, not original artwork created for this site. Existing footer attribution and the unofficial fan-game notice apply.

Added for the vanilla hotbar layout (Java Edition 1.21.8):

- `hotbar.png` (182 × 22): https://raw.githubusercontent.com/PrismarineJS/minecraft-assets/master/data/1.21.8/gui/sprites/hud/hotbar.png
- `hotbar_selection.png` (24 × 23): https://raw.githubusercontent.com/PrismarineJS/minecraft-assets/master/data/1.21.8/gui/sprites/hud/hotbar_selection.png
- `diamond_sword.png` (16 × 16): https://raw.githubusercontent.com/PrismarineJS/minecraft-assets/master/data/1.21.8/items/diamond_sword.png
- `torch.png` (16 × 16): https://raw.githubusercontent.com/PrismarineJS/minecraft-assets/master/data/1.21.8/blocks/torch.png

Hotbar placement follows the original strip's 20-pixel slot pitch. Selection uses the original separate sprite; images are not recolored or redrawn.

Added for the best-record advancement icon (Java Edition 1.21.8):

- `challenge_frame_obtained.png` (26 × 26): https://raw.githubusercontent.com/PrismarineJS/minecraft-assets/master/data/1.21.8/gui/sprites/advancements/challenge_frame_obtained.png
- `challenge_frame_unobtained.png` (26 × 26): https://raw.githubusercontent.com/PrismarineJS/minecraft-assets/master/data/1.21.8/gui/sprites/advancements/challenge_frame_unobtained.png
- `diamond.png` (16 × 16): https://raw.githubusercontent.com/PrismarineJS/minecraft-assets/master/data/1.21.8/items/diamond.png

The challenge frames and diamond sprite above were used in the earlier best-record design.

The current best-record icon follows **Ice Bucket Challenge** (`minecraft:story/form_obsidian`), whose icon is `minecraft:obsidian` and whose default frame type is task:

- Advancement data: https://github.com/misode/mcmeta/blob/1.21.8-data/data/minecraft/advancement/story/form_obsidian.json
- `task_frame_obtained.png` (26 × 26): https://raw.githubusercontent.com/PrismarineJS/minecraft-assets/master/data/1.21.8/gui/sprites/advancements/task_frame_obtained.png
- `task_frame_unobtained.png` (26 × 26): https://raw.githubusercontent.com/PrismarineJS/minecraft-assets/master/data/1.21.8/gui/sprites/advancements/task_frame_unobtained.png

The obsidian block icon is rendered with three CSS faces using the existing vanilla `obsidian.png` texture. It uses the gray frame before the first record and the gold frame once a record exists; the site does not grant Minecraft advancements.
