enum MinecraftNouns {
    Creeper = "Creeper",
    Enderman = "Enderman",
    Zombie = "Zombie",
    Skeleton = "Skeleton",
    Villager = "Villager",
    Pillageur = "Pillageur",
    Nether = "Nether",
    End = "End",
    Biome = "Biome",
    Block = "Block",
    Diamond = "Diamond",
    Redstone = "Redstone",
    Iron = "Iron",
    Gold = "Gold",
    Wood = "Wood",
    Cobblestone = "Cobblestone",
    Sword = "Sword",
    Pickaxe = "Pickaxe",
    Armor = "Armor",
    Shield = "Shield",
    Bow = "Bow",
    Potion = "Potion",
    Totem = "Totem",
    Beacon = "Beacon",
    Bed = "Bed",
    Furnace = "Furnace",
    Portal = "Portal",
    EnderDragon = "Ender Dragon",
    Wither = "Wither",
    Minecart = "Minecart",
    Boat = "Boat",
    Spawner = "Spawner",
    Stronghold = "Stronghold",
    Jungle = "Jungle",
    Desert = "Desert",
    Ocean = "Ocean",
    Mountain = "Mountain",
    Village = "Village",
    Ravine = "Ravine",
    Dungeon = "Dungeon",
    Obsidian = "Obsidian",
    Ghast = "Ghast",
    Piglin = "Piglin",
    Blaze = "Blaze",
    Bee = "Bee",
    Horse = "Horse",
    Wolf = "Wolf",
    Sheep = "Sheep",
    Cow = "Cow",
    Chicken = "Chicken",
    Pig = "Pig",
    Goat = "Goat",
    Warden = "Warden"
}

enum MinecraftAdjectives {
    Block = "block",
    Ore = "ore",
    Item = "item",
    Armor = "armor",
    Tool = "tool",
    Biome = "biome",
    Ingot = "ingot",
    Shovel = "shovel",
    Pickaxe = "pickaxe",
    Helmet = "helmet",
    Chestplate = "chestplate",
    Leggings = "leggings",
    Boots = "boots",
    Sword = "sword",
    Potion = "potion",
    Enchantment = "enchantment",
    Furnace = "furnace",
    CraftingTable = "crafting_table",
    Portal = "portal",
    Stronghold = "stronghold",
    Structure = "structure",
    Mineral = "mineral",
    Dimension = "dimension",
    Entity = "entity",
    Mob = "mob",
    LightSource = "light_source",
    Drop = "drop",
    SpawnEgg = "spawn_egg"
}

type MinecraftName = `${MinecraftNouns}_${MinecraftAdjectives}`

function generateMinecraftName(): MinecraftName {
    const randomNoun = getRandomEnumValue(MinecraftNouns);
    const randomAdjective = getRandomEnumValue(MinecraftAdjectives);
    return `${randomNoun}_${randomAdjective}`;
}

function getRandomEnumValue<T extends typeof MinecraftNouns | typeof MinecraftAdjectives>(anEnum: T): T[keyof T] {
    const enumValues = Object.values(anEnum) as T[keyof T][];
    const randomIndex = Math.floor(Math.random() * enumValues.length);
    return enumValues[randomIndex];
}

export default generateMinecraftName