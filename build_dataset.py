import os
import glob
import json
import re
from collections import Counter

def clean_text(s):
    if not s:
        return ""
    return str(s).strip()

def normalize_income(inc):
    if not inc:
        return 0
    clean = re.sub(r'[^\d]', '', str(inc))
    return int(clean) if clean else 0

def normalize_age(a):
    if not a:
        return None
    m = re.search(r'\d+', str(a))
    return int(m.group(0)) if m else None

def normalize_land(l):
    if not l:
        return 0.0
    m = re.search(r'[\d\.]+', str(l))
    return float(m.group(0)) if m else 0.0

def build_data():
    files = sorted(glob.glob('kanimerala/*.json'))
    print(f"Processing {len(files)} files...")

    households = []
    all_members = []

    for idx, fpath in enumerate(files, 1):
        with open(fpath, 'r', encoding='utf-8') as f:
            data = json.load(f)

        hh = data.get('household', {})
        members = data.get('members', [])
        fname = os.path.basename(fpath)

        hh_code = f"HH-{idx:02d}"
        hh_cleaned = {
            "code": hh_code,
            "originalId": hh.get("id"),
            "file": fname,
            "headName": clean_text(hh.get("headName", "Unknown")).title(),
            "mobileNumber": clean_text(hh.get("mobileNumber")),
            "familyMembersCount": len(members) if len(members) > 0 else (hh.get("familyMembersCount") or 1),
            "houseOwnership": clean_text(hh.get("houseOwnership", "Own House")),
            "houseType": clean_text(hh.get("houseType", "Pucca (Concrete/cement house)")),
            "toiletFacility": clean_text(hh.get("toiletFacility", "Private")),
            "electricityConnection": clean_text(hh.get("electricityConnection", "Yes")),
            "electricityHours": clean_text(hh.get("electricityAvailabilityHours", "24")),
            "solarPanels": clean_text(hh.get("solarPanelsAvailable", "No")),
            "mobileNetwork": clean_text(hh.get("mobileNetwork", "Jio")),
            "drinkingWater": clean_text(hh.get("drinkingWaterAvailability", "Tap Water")),
            "waterSource": clean_text(hh.get("waterSource", "Government Pipe Water")),
            "drainageFacility": clean_text(hh.get("drainageFacility", "No")),
            "povertyStatus": clean_text(hh.get("povertyStatus", "BPL (Income ₹1 Lakh or Less)")),
            "mainIncomeSource": clean_text(hh.get("mainIncomeSource", "Agriculture")).title(),
            "annualIncome": normalize_income(hh.get("annualIncome")),
            "landOwnership": clean_text(hh.get("landOwnership", "None")),
            "landAreaOwned": normalize_land(hh.get("landAreaOwned")),
            "agriculturalInputs": clean_text(hh.get("agriculturalInputsText")),
            "irrigationSystem": clean_text(hh.get("irrigationSystem", "None")),
            "agriculturalProduce": clean_text(hh.get("agriculturalProduce", "None")).title(),
            "livestockDetails": clean_text(hh.get("livestockDetails", "None")),
            "cookingFuel": clean_text(hh.get("cookingFuel", "LPG")),
            "memberMigrate": clean_text(hh.get("memberMigrate", "No")),
            "governmentSchemes": clean_text(hh.get("governmentSchemesText")),
            "appliances": clean_text(hh.get("appliancesListText")),
            "vehicles": {
                "twoWheeler": hh.get("vehiclePetrol2Wheeler", 0),
                "cycle": hh.get("vehicleCycle", 0),
                "sixPlusWheeler": hh.get("vehicle6PlusWheeler", 0),
                "other": hh.get("vehicleOther", 0)
            },
            "remarks": clean_text(hh.get("remarks")),
            "surveyorName": clean_text(hh.get("surveyorName", "UBA Student Team")),
            "surveyDate": hh.get("surveyDate"),
            "membersCount": len(members),
            "members": []
        }

        # Clean members
        for midx, m in enumerate(members, 1):
            m_cleaned = {
                "id": m.get("id") or f"{hh_code}-M{midx:02d}",
                "householdCode": hh_code,
                "name": clean_text(m.get("name", "Member")).title(),
                "relation": clean_text(m.get("relation", "Member")),
                "age": normalize_age(m.get("age")),
                "gender": clean_text(m.get("gender", "Unspecified")).capitalize(),
                "education": clean_text(m.get("education", "Illiterate")),
                "category": clean_text(m.get("category", "ST")).upper(),
                "occupation": clean_text(m.get("occupation", "None")).title(),
                "bankStatus": clean_text(m.get("bankAccountStatus", "No Bank Account")),
                "bankName": clean_text(m.get("bankName", "")),
                "healthProblems": clean_text(m.get("healthProblems", "No")),
                "underTreatment": clean_text(m.get("underTreatment", "No")),
                "mnregaJobCard": clean_text(m.get("mnregaJobCard", "No")),
                "contactNumber": clean_text(m.get("contactNumber"))
            }
            hh_cleaned["members"].append(m_cleaned)
            all_members.append(m_cleaned)

        households.append(hh_cleaned)

    # Compute key village metrics
    total_hh = len(households)
    total_pop = len(all_members)
    females = sum(1 for m in all_members if m["gender"].lower() == "female")
    males = sum(1 for m in all_members if m["gender"].lower() == "male")
    
    categories = Counter(m["category"] for m in all_members)
    bpl_count = sum(1 for h in households if "BPL" in h["povertyStatus"])
    apl_count = sum(1 for h in households if "APL" in h["povertyStatus"])
    pucca_count = sum(1 for h in households if "Pucca" in h["houseType"])
    kutcha_count = sum(1 for h in households if "Kutcha" in h["houseType"])
    
    private_toilet = sum(1 for h in households if h["toiletFacility"].lower() == "private")
    open_defecation = sum(1 for h in households if "open" in h["toiletFacility"].lower())
    
    mineral_water_buyers = sum(1 for h in households if "mineral" in h["drinkingWater"].lower())
    tap_water_users = sum(1 for h in households if "tap" in h["drinkingWater"].lower())
    
    drainage_issues = sum(1 for h in households if any(w in h["drainageFacility"].lower() for w in ["no", "open", "problem", "none"]))
    drainage_ok = sum(1 for h in households if h["drainageFacility"].lower() == "yes")
    
    mnrega_holders = sum(1 for m in all_members if m["mnregaJobCard"].lower() == "yes")
    bank_account_holders = sum(1 for m in all_members if "account" in m["bankStatus"].lower() and "no bank" not in m["bankStatus"].lower())

    # Age groups
    age_groups = {
        "0-14 Children": sum(1 for m in all_members if m["age"] is not None and m["age"] < 15),
        "15-24 Youth": sum(1 for m in all_members if m["age"] is not None and 15 <= m["age"] <= 24),
        "25-44 Working Adults": sum(1 for m in all_members if m["age"] is not None and 25 <= m["age"] <= 44),
        "45-59 Middle-aged": sum(1 for m in all_members if m["age"] is not None and 45 <= m["age"] <= 59),
        "60+ Senior Citizens": sum(1 for m in all_members if m["age"] is not None and m["age"] >= 60)
    }

    # Education breakdown
    education_counts = Counter(m["education"] for m in all_members)
    
    # Top crops
    crops = []
    for h in households:
        prod = h["agriculturalProduce"]
        if prod and prod.lower() not in ["none", "no"]:
            for item in prod.split(","):
                c = item.strip().title()
                if c and c not in ["None", "No"]:
                    if "Mango" in c:
                        crops.append("Mango")
                    else:
                        crops.append(c)
    top_crops = Counter(crops).most_common(8)

    # Health issues summary
    health_issues = []
    for m in all_members:
        hp = m["healthProblems"]
        if hp and hp.lower() not in ["no", "none", ""]:
            health_issues.append({
                "person": m["name"],
                "age": m["age"],
                "gender": m["gender"],
                "issue": hp,
                "householdCode": m["householdCode"]
            })

    # Grievances summary
    grievances = []
    for h in households:
        rem = h["remarks"]
        if rem and rem.lower() not in ["no", "no problem", "none", ""]:
            # Categorize
            cats = []
            low = rem.lower()
            if "drain" in low or "dairange" in low or "driange" in low:
                cats.append("Drainage & Sanitation")
            if "water" in low or "tank" in low or "borewell" in low:
                cats.append("Drinking Water & Overhead Tank")
            if "road" in low or "transport" in low or "bus" in low:
                cats.append("Roads & Public Bus Transit")
            if "land" in low or "pattalu" in low or "paatalu" in low or "patalu" in low:
                cats.append("Land Pattas & Housing Site Allotment")
            if "hospital" in low or "health" in low:
                cats.append("Healthcare & Hospital Access")
            if "scheme" in low or "eligible" in low or "pension" in low or "fention" in low:
                cats.append("Welfare Schemes & Pension Sanctions")
            if not cats:
                cats.append("General Infrastructure & Housing")

            grievances.append({
                "code": h["code"],
                "headName": h["headName"],
                "text": rem,
                "categories": cats,
                "mobile": h["mobileNumber"]
            })

    village_info = {
        "villageName": "Kanimerala (Kanimerla)",
        "mandal": "Mylavaram Mandal",
        "district": "NTR District (formerly Krishna District)",
        "state": "Andhra Pradesh",
        "pincode": "521230",
        "geography": "Horticultural belt situated 16 km from Mylavaram and 24 km from Nuzvid, famous for mango plantations and Banjara Thandas.",
        "surveyProgram": "Unnat Bharat Abhiyan (UBA) Baseline Household Survey",
        "surveyDateRange": "June 7, 2026",
        "totalHouseholdsSurveyed": total_hh,
        "totalPopulationSurveyed": total_pop
    }

    metrics = {
        "summary": {
            "totalHouseholds": total_hh,
            "totalPopulation": total_pop,
            "females": females,
            "males": males,
            "sexRatio": round((females / males) * 1000 if males else 1000),
            "stPercentage": round((categories.get("ST", 0) / total_pop) * 100, 1),
            "bplPercentage": round((bpl_count / total_hh) * 100, 1),
            "puccaHousingPercentage": round((pucca_count / total_hh) * 100, 1),
            "mineralWaterBuyingPercentage": round((mineral_water_buyers / total_hh) * 100, 1),
            "drainageDeficitPercentage": round((drainage_issues / total_hh) * 100, 1),
            "mnregaCardPercentage": round((mnrega_holders / total_pop) * 100, 1),
            "bankAccountPercentage": round((bank_account_holders / total_pop) * 100, 1)
        },
        "categories": dict(categories),
        "ageGroups": age_groups,
        "education": dict(education_counts),
        "topCrops": dict(top_crops),
        "housing": {
            "Pucca": pucca_count,
            "Kutcha": kutcha_count,
            "Semi-Pucca": total_hh - pucca_count - kutcha_count
        },
        "toilets": {
            "Private": private_toilet,
            "Open Defecation": open_defecation
        },
        "water": {
            "Mineral Water Cans (Buying)": mineral_water_buyers,
            "Tap Water Direct": tap_water_users,
            "Not Available / Other": total_hh - mineral_water_buyers - tap_water_users
        },
        "drainage": {
            "Adequate Drainage": drainage_ok,
            "Deficit / Problem / None": drainage_issues
        },
        "networks": dict(Counter(h["mobileNetwork"] for h in households))
    }

    output_js = f"""// Kanimerala Village UBA Survey Dataset
// Auto-generated by build_dataset.py from 49 field survey records

var KANIMERALA_DATA = {{
    villageInfo: {json.dumps(village_info, indent=4, ensure_ascii=False)},
    metrics: {json.dumps(metrics, indent=4, ensure_ascii=False)},
    households: {json.dumps(households, indent=4, ensure_ascii=False)},
    members: {json.dumps(all_members, indent=4, ensure_ascii=False)},
    grievances: {json.dumps(grievances, indent=4, ensure_ascii=False)},
    healthCases: {json.dumps(health_issues, indent=4, ensure_ascii=False)}
}};

if (typeof window !== 'undefined') {{
    window.KANIMERALA_DATA = KANIMERALA_DATA;
}}

if (typeof module !== 'undefined' && module.exports) {{
    module.exports = KANIMERALA_DATA;
}}
"""

    with open('js/data.js', 'w', encoding='utf-8') as f:
        f.write(output_js)

    print(f"Data written to js/data.js! Total HH: {total_hh}, Members: {total_pop}, Grievances: {len(grievances)}, Health cases: {len(health_issues)}")

if __name__ == "__main__":
    build_data()
