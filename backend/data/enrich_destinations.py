"""
Enrich DimDestination with tourist-facing attributes:
famous_for, travel_vibe, best_time_to_visit, typical_dwell_time, entry_fee.
"""

import sys
from pathlib import Path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from sqlalchemy import text
from app.database.connection import get_db

ENRICHMENT_DATA = {
    "TN-CHE-01": {
        "famous_for": "Second longest urban natural beach in the world, iconic 19th-century lighthouse, vibrant evening sea breeze, traditional sundal street food, and historic statues along Kamarajar Promenade.",
        "travel_vibe": "playful",
        "best_time_to_visit": "November to February (Evenings 4:30 PM - 8:00 PM)",
        "typical_dwell_time": "2 - 3 hours",
        "entry_fee": "Free (Lighthouse ₹20)",
    },
    "TN-MAM-01": {
        "famous_for": "UNESCO World Heritage 7th-century Shore Temple facing the Bay of Bengal, monolithic Pancha Rathas, Arjuna's Penance stone bas-relief, and sea-spray stone sculptures.",
        "travel_vibe": "ancient",
        "best_time_to_visit": "October to March (Early mornings or golden hour)",
        "typical_dwell_time": "3 - 4 hours",
        "entry_fee": "₹40 for Indians, ₹600 for Foreigners",
    },
    "TN-NIL-01": {
        "famous_for": "The 'Queen of Hill Stations', scenic pedal boating across 65-acre Ooty Lake, British-era Government Botanical Garden with 1,000+ exotic floral species, and misty eucalyptus hills.",
        "travel_vibe": "nature",
        "best_time_to_visit": "April to June (Summer) & September to November",
        "typical_dwell_time": "Half to Full Day",
        "entry_fee": "Garden ₹50, Boating ₹150 - ₹400",
    },
    "TN-KOD-01": {
        "famous_for": "The 'Princess of Hill Stations', star-shaped mountain lake cycling, 400-foot vertical Pillar Rock cliffs, Coaker's Walk misty valley panoramas, and fragrant pine tree forests.",
        "travel_vibe": "nature",
        "best_time_to_visit": "October to May",
        "typical_dwell_time": "Full Day",
        "entry_fee": "Free (Viewpoints ₹10 - ₹20)",
    },
    "TN-MDU-01": {
        "famous_for": "Historic 2,500-year-old architectural jewel of Madurai, 14 towering gopuram gateways sculpted with thousands of vibrant mythological deities, and the Hall of Thousand Pillars.",
        "travel_vibe": "ancient",
        "best_time_to_visit": "October to March (Chithirai Festival in April)",
        "typical_dwell_time": "2 - 4 hours",
        "entry_fee": "Free (Museum ₹50)",
    },
    "TN-RAM-01": {
        "famous_for": "Sacred coastal Char Dham pilgrimage shrine, longest carved granite temple corridor in the world with 1,212 pillars, and 22 holy water theerthams for purifying ritual baths.",
        "travel_vibe": "ancient",
        "best_time_to_visit": "October to April",
        "typical_dwell_time": "3 - 4 hours",
        "entry_fee": "Free (Special Entry ₹50 - ₹100)",
    },
    "TN-KAN-01": {
        "famous_for": "Unique confluence of Indian Ocean, Arabian Sea, and Bay of Bengal, monumental 133-foot Thiruvalluvar granite statue on sea rock, and Swami Vivekananda meditation mandapam.",
        "travel_vibe": "creative",
        "best_time_to_visit": "October to March (Spectacular sunrise and sunset)",
        "typical_dwell_time": "3 - 4 hours",
        "entry_fee": "Ferry ₹50, Memorial ₹20",
    },
    "TN-YER-01": {
        "famous_for": "'Jewel of the South' in Shevaroy Hills, serene emerald lake boating, coffee and spice plantations, and panoramic cliff overlooks from Lady's Seat.",
        "travel_vibe": "nature",
        "best_time_to_visit": "October to June",
        "typical_dwell_time": "Half Day",
        "entry_fee": "Free (Boating ₹100 - ₹250)",
    },
    "TN-THA-01": {
        "famous_for": "UNESCO World Heritage Brihadisvara Temple built in 1010 AD by Emperor Raja Raja Chola I, monolithic 80-tonne granite Vimana apex dome, and majestic Nandi pavilion.",
        "travel_vibe": "ancient",
        "best_time_to_visit": "November to February",
        "typical_dwell_time": "2 - 3 hours",
        "entry_fee": "Free",
    },
    "TN-HOG-01": {
        "famous_for": "The 'Niagara of India' on river Kaveri, adrenaline-filled round bamboo coracle boat navigation, natural medicinal water spray baths, and fresh river fish delicacies.",
        "travel_vibe": "playful",
        "best_time_to_visit": "July to October (Post-monsoon full flow)",
        "typical_dwell_time": "Half to Full Day",
        "entry_fee": "Coracle ₹750 per boat",
    },
    "TN-CHI-01": {
        "famous_for": "Cosmic dance of Lord Shiva as Nataraja, 108 Bharatnatyam classical dance mudras carved in stone gopurams, and the sacred golden-roofed Pon Ambalam sanctuary.",
        "travel_vibe": "creative",
        "best_time_to_visit": "October to March (Natyanjali Dance Festival in Feb)",
        "typical_dwell_time": "2 - 3 hours",
        "entry_fee": "Free",
    },
    "TN-COU-01": {
        "famous_for": "'Spa of South India' in the Western Ghats, seasonal waterfalls enriched with therapeutic medicinal forest herbs, and natural mineral-rich hydrotherapy bathing pools.",
        "travel_vibe": "playful",
        "best_time_to_visit": "June to September (Southwest Monsoon)",
        "typical_dwell_time": "2 - 3 hours",
        "entry_fee": "Free",
    },
    "TN-COO-01": {
        "famous_for": "High-altitude tranquil Nilgiri garden with century-old trees and manicured rose lawns, Highfield Tea Factory tours, and scenic Toy Train rides.",
        "travel_vibe": "nature",
        "best_time_to_visit": "September to May",
        "typical_dwell_time": "2 - 3 hours",
        "entry_fee": "Park ₹40",
    },
    "TN-VAL-01": {
        "famous_for": "Untamed Western Ghat plateau at 3,500 feet, 40 thrilling hairpin bends through mist, sprawling emerald tea estates, and wild Nilgiri Tahr mountain goat sightings.",
        "travel_vibe": "nature",
        "best_time_to_visit": "September to March",
        "typical_dwell_time": "1 - 2 Days",
        "entry_fee": "Free",
    },
    "TN-MUD-01": {
        "famous_for": "Dense tropical tiger reserve sanctuary at Nilgiri biosphere crossroads, open-jeep jungle safaris spotting Asian elephants, leopards, deer, and Theppakadu elephant interactions.",
        "travel_vibe": "nature",
        "best_time_to_visit": "October to May",
        "typical_dwell_time": "Half Day",
        "entry_fee": "Safari ₹350 - ₹1,200",
    },
    "TN-DHA-01": {
        "famous_for": "Haunting abandoned ghost town ruined in the 1964 cyclone, the narrow tip where Indian Ocean meets Bay of Bengal, and mythological origin of Ram Setu.",
        "travel_vibe": "ancient",
        "best_time_to_visit": "October to March (Day trips 9 AM - 5 PM)",
        "typical_dwell_time": "2 - 3 hours",
        "entry_fee": "Free",
    },
    "TN-PIC-01": {
        "famous_for": "World's second largest mangrove wetland ecosystem, rowing through 4,400 interconnected natural canal labyrinths under green tree canopies, and birdwatching.",
        "travel_vibe": "playful",
        "best_time_to_visit": "November to February",
        "typical_dwell_time": "2 - 3 hours",
        "entry_fee": "Boating ₹200 - ₹500",
    },
    "TN-YEL-01": {
        "famous_for": "Relaxing valley retreat across 14 rural hamlets, calm pedal boating on Punganoor artificial lake, nature adventure parks, and gentle forest hiking trails.",
        "travel_vibe": "playful",
        "best_time_to_visit": "November to February",
        "typical_dwell_time": "Half Day",
        "entry_fee": "Boating ₹75",
    },
    "TN-VED-01": {
        "famous_for": "India's oldest water bird sanctuary established in 1798, annual nesting haven for 40,000+ migratory birds including painted storks, pelicans, and grey herons.",
        "travel_vibe": "nature",
        "best_time_to_visit": "November to February (Peak nesting period)",
        "typical_dwell_time": "2 - 3 hours",
        "entry_fee": "Entry ₹25",
    },
    "TN-VEL-01": {
        "famous_for": "Imposing 16th-century granite fort surrounded by a massive wet moat, Jalakanteswarar temple featuring masterwork monolithic Vijayanagara pillar carvings, and museum.",
        "travel_vibe": "ancient",
        "best_time_to_visit": "October to March",
        "typical_dwell_time": "2 - 3 hours",
        "entry_fee": "Free (Museum ₹20)",
    },
}

def migrate_and_enrich():
    db = next(get_db())
    print(">>> Checking / adding columns to dim_destination...")

    columns_to_add = [
        ("famous_for", "TEXT"),
        ("travel_vibe", "VARCHAR(100)"),
        ("best_time_to_visit", "VARCHAR(255)"),
        ("typical_dwell_time", "VARCHAR(100)"),
        ("entry_fee", "VARCHAR(100)"),
    ]

    for col_name, col_type in columns_to_add:
        try:
            db.execute(text(f"ALTER TABLE dim_destination ADD COLUMN IF NOT EXISTS {col_name} {col_type};"))
            db.commit()
            print(f"  + Added column {col_name} ({col_type})")
        except Exception as e:
            db.rollback()
            # If SQLite or dialect doesn't support IF NOT EXISTS in alter
            try:
                db.execute(text(f"ALTER TABLE dim_destination ADD COLUMN {col_name} {col_type};"))
                db.commit()
                print(f"  + Added column {col_name} ({col_type}) via fallback")
            except Exception:
                db.rollback()
                print(f"  * Column {col_name} already exists or alter skipped")

    print(">>> Updating destination records in Supabase...")
    updated_count = 0
    for dest_id, data in ENRICHMENT_DATA.items():
        stmt = text("""
            UPDATE dim_destination
            SET famous_for = :famous_for,
                travel_vibe = :travel_vibe,
                best_time_to_visit = :best_time_to_visit,
                typical_dwell_time = :typical_dwell_time,
                entry_fee = :entry_fee
            WHERE destination_id = :destination_id
        """)
        res = db.execute(stmt, {
            "destination_id": dest_id,
            "famous_for": data["famous_for"],
            "travel_vibe": data["travel_vibe"],
            "best_time_to_visit": data["best_time_to_visit"],
            "typical_dwell_time": data["typical_dwell_time"],
            "entry_fee": data["entry_fee"],
        })
        if res.rowcount > 0:
            updated_count += 1

    db.commit()
    print(f">>> Successfully enriched {updated_count} / {len(ENRICHMENT_DATA)} destinations in Supabase!")

if __name__ == "__main__":
    migrate_and_enrich()
