"""
Short, general facts about each disease the classifier knows.

`cause` names the pathogen and how it spreads. `management` lists general
cultural practices only: chemical choice and dose depend on the crop, the
region and local registration, so the farmer is pointed to a local expert
instead of being given a product name.
"""

ADVICE_NOTE = (
    "Confirm the diagnosis and any spray with your local agriculture officer "
    "or Krishi Vigyan Kendra before applying chemicals."
)

DISEASE_INFO: dict[str, dict] = {
    "Rice Leaf Blast (Magnaporthe grisea)": {
        "pathogen_type": "Fungus",
        "cause": "Fungus (Magnaporthe oryzae). Spores spread by wind; long leaf wetness, high humidity and excess nitrogen favour it.",
        "management": [
            "Grow blast-resistant varieties.",
            "Avoid excess nitrogen; apply it in split doses.",
            "Remove and destroy infected stubble and straw after harvest.",
        ],
    },
    "Tomato Late Blight (Phytophthora infestans)": {
        "pathogen_type": "Oomycete (water mould)",
        "cause": "Water mould (Phytophthora infestans). Spreads fast in cool, wet weather through airborne spores.",
        "management": [
            "Remove and destroy infected plants promptly.",
            "Water at the base of plants; keep foliage dry.",
            "Give plants enough spacing for air flow.",
        ],
    },
    "Banana Bunchy Top Virus (BBTV)": {
        "pathogen_type": "Virus",
        "cause": "Virus spread by the banana aphid and by planting infected suckers.",
        "management": [
            "There is no cure: uproot and destroy infected plants, including the corm.",
            "Control aphids in the plantation.",
            "Plant only virus-free (tissue-culture) material.",
        ],
    },
    "Wheat Brown Rust": {
        "pathogen_type": "Fungus",
        "cause": "Fungus (Puccinia triticina). Windborne spores; warm days with dew favour it.",
        "management": [
            "Grow rust-resistant varieties.",
            "Sow on time; avoid very late sowing.",
            "Act when the first pustules appear; ask a local expert about a fungicide.",
        ],
    },
    "Wheat Yellow Rust": {
        "pathogen_type": "Fungus",
        "cause": "Fungus (Puccinia striiformis). Windborne spores; cool, moist weather favours it.",
        "management": [
            "Grow rust-resistant varieties.",
            "Scout fields often during cool, humid spells.",
            "Act early on the first yellow stripes; ask a local expert about a fungicide.",
        ],
    },
    "Potato Early Blight (Alternaria solani)": {
        "pathogen_type": "Fungus",
        "cause": "Fungus (Alternaria solani). Attacks older or stressed leaves first; warm weather with alternating wet and dry periods favours it.",
        "management": [
            "Remove infected lower leaves.",
            "Rotate crops; do not follow potato or tomato with each other.",
            "Keep plants well fed; stressed plants are hit harder.",
        ],
    },
    "Tomato Yellow Leaf Curl Virus (ToLCNDV)": {
        "pathogen_type": "Virus",
        "cause": "Leaf-curl virus (begomovirus) spread by whiteflies.",
        "management": [
            "There is no cure: pull out infected plants early.",
            "Control whiteflies, for example with yellow sticky traps and insect nets in the nursery.",
            "Grow tolerant or resistant varieties.",
        ],
    },
    "Citrus Canker (Xanthomonas axonopodis)": {
        "pathogen_type": "Bacterium",
        "cause": "Bacterium (Xanthomonas citri). Spreads by rain splash and wind, and enters through wounds such as leaf-miner damage.",
        "management": [
            "Prune and destroy infected twigs and leaves.",
            "Control citrus leaf miner.",
            "Disinfect pruning tools between trees.",
        ],
    },
    "Corn/Maize Common Rust (Puccinia sorghi)": {
        "pathogen_type": "Fungus",
        "cause": "Fungus (Puccinia sorghi). Windborne spores; cool, humid weather favours it.",
        "management": [
            "Grow resistant hybrids.",
            "Most crops tolerate light infection; seek advice only if it is severe before tasselling.",
        ],
    },
    "Sugarcane Red Rot (Colletotrichum falcatum)": {
        "pathogen_type": "Fungus",
        "cause": "Fungus (Colletotrichum falcatum). Spreads mainly through infected seed cane (setts) and irrigation or flood water.",
        "management": [
            "Plant healthy setts of resistant varieties.",
            "Uproot and burn infected clumps.",
            "Avoid waterlogging; rotate crops in affected fields.",
        ],
    },
    "Cucumber/Muskmelon Downy Mildew": {
        "pathogen_type": "Oomycete (water mould)",
        "cause": "Water mould (Pseudoperonospora cubensis). Airborne spores; humid weather and wet leaves favour it.",
        "management": [
            "Avoid overhead watering; water in the morning.",
            "Space plants for air flow and remove infected leaves.",
            "Ask a local expert about a protective spray if it spreads.",
        ],
    },
}


def info_for(label: str) -> dict:
    """Return the facts for a class label, or an empty entry for unknown labels."""
    entry = DISEASE_INFO.get(label)
    if entry is None:
        return {"pathogen_type": None, "cause": None, "management": [], "advice_note": ADVICE_NOTE}
    return {**entry, "advice_note": ADVICE_NOTE}
