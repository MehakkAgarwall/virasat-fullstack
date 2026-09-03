const mysql = require('mysql2/promise');
require('dotenv').config();

const mapping = {
  "Ajrakh Hand Block Printing": "https://upload.wikimedia.org/wikipedia/commons/2/28/Ajrakh_Block_Printing_Geography.png",
  "Bandhani Tie-Dye": "https://upload.wikimedia.org/wikipedia/commons/6/6b/Bandhani%2C_Tie_dye_dresses_drying_in_Jaipur.jpg",
  "Bell Metal Dhokra Casting": "https://upload.wikimedia.org/wikipedia/commons/7/74/Dhokra_%28Man%29.jpg",
  "Bidri Craft": "https://upload.wikimedia.org/wikipedia/commons/6/62/Bidri_craft%2C_Hyderabad%2C_India.jpg",
  "Bidriware": "https://upload.wikimedia.org/wikipedia/commons/1/12/Bidriware_Hookah.jpg",
  "Blue Pottery": "https://upload.wikimedia.org/wikipedia/commons/2/28/Jaipur_Blue_Pottery_Vase_with_Raja-Rani_Design.jpg",
  "Brass Dokra Craft": "https://upload.wikimedia.org/wikipedia/commons/7/74/Dhokra_%28Man%29.jpg",
  "Cane & Bamboo": "https://upload.wikimedia.org/wikipedia/commons/a/a4/Bamboo_crafted_dancing_lady_from_Samaguri_Satra.jpg",
  "Kalamkari Hand Painting": "https://upload.wikimedia.org/wikipedia/commons/5/54/Kalamkari_Painting.JPG",
  "Kalamkari Painting": "https://upload.wikimedia.org/wikipedia/commons/5/54/Kalamkari_Painting.JPG",
  "Kantha Hand Embroidery": "https://upload.wikimedia.org/wikipedia/commons/2/2c/Kantha_%28Quilt%29_LACMA_AC1994.131.1.jpg",
  "Kasuti Embroidery": "https://upload.wikimedia.org/wikipedia/commons/d/df/Kasuti_embroidery.jpg",
  "Leather Puppets": "https://upload.wikimedia.org/wikipedia/commons/8/83/Hanuman_and_Ravana_in_Tholu_Bommalata%2C_the_shadow_puppet_tradition_of_Andhra_Pradesh%2C_India.JPG",
  "Marble Inlay": "https://upload.wikimedia.org/wikipedia/commons/6/64/Flowers_in_Marble%2C_the_Taj_Mahal%2C_Agra%2C_Uttar_Pradesh%2C_India.jpg",
  "Miniature Painting": "https://upload.wikimedia.org/wikipedia/commons/d/dc/Rajasthani_Miniature_painting.jpg",
  "Mysore style Painting": "https://upload.wikimedia.org/wikipedia/commons/6/65/Cheluvarayaswamy.jpg",
  "Palm Leaf Engraving": "https://upload.wikimedia.org/wikipedia/commons/1/1e/Radha_and_Krishna_tala_pattachitra_from_Odisha%2C_ink_on_palm_leaf%2C_artist_unknown.JPG",
  "Palmleaf & Pattachitra Painting": "https://upload.wikimedia.org/wikipedia/commons/1/1e/Radha_and_Krishna_tala_pattachitra_from_Odisha%2C_ink_on_palm_leaf%2C_artist_unknown.JPG",
  "Paper Machie": "https://upload.wikimedia.org/wikipedia/commons/9/95/Kashmiri_Woodcarving_And_Paper_mach%C3%A9.jpg",
  "Papier-mache": "https://upload.wikimedia.org/wikipedia/commons/d/d8/Pen_Box_%28qalamdan%29_LACMA_M.89.160a-b.jpg",
  "Patan Patola Double Ikat": "https://upload.wikimedia.org/wikipedia/commons/e/e1/Antique_Patan_Patola_Double_Ikat_Trade_Textile_courtesy_Wovensouls_Collection%2C_Singapore.jpg",
  "Pattachitra": "https://upload.wikimedia.org/wikipedia/commons/d/de/Pattachitra_Painting_%2816854531288%29.jpg",
  "Pattachitra Painting": "https://upload.wikimedia.org/wikipedia/commons/1/15/Naagaa_Dancer%2C_Raghurajpur.JPG",
  "Sandal Wood Carving": "https://upload.wikimedia.org/wikipedia/commons/5/5f/Door_of_Carved_Sandal_Wood_From_Travancore.jpg",
  "Scroll / Thanka Painting": "https://upload.wikimedia.org/wikipedia/commons/c/cc/Painting_Thangka_Lhasa_Tibet_Luca_Galuzzi_2006.jpg",
  "Shawl as Artware": "https://upload.wikimedia.org/wikipedia/commons/4/44/Blue_kani_final.jpg",
  "Sholapith": "https://upload.wikimedia.org/wikipedia/commons/8/89/Topor_Pair.jpg",
  "Stone Carving": "https://upload.wikimedia.org/wikipedia/commons/5/5d/Brihadeeswarar_Temple_02.jpg",
  "Tanjore Painting": "https://upload.wikimedia.org/wikipedia/commons/c/ca/Gajalakshmi_in_Tanjore_Painting.png",
  "Terracotta": "https://upload.wikimedia.org/wikipedia/commons/0/05/Bankura_Horses_Arnab_Dutta_2011.JPG",
  "Thanjavur Painting": "https://upload.wikimedia.org/wikipedia/commons/f/ff/Thanjavur_Painting.jpg",
  "Thewa Craft": "https://upload.wikimedia.org/wikipedia/commons/5/52/Stamp_of_India_-_2002_-_Colnect_158278_-_Handicrafts_of_India_-_Thewa.jpeg",
  "Tie & Dye and Batik Painting": "https://upload.wikimedia.org/wikipedia/commons/e/e8/Batik_Shari_design_by_Jamuna_Sen.jpg",
  "Walnut Wood Carving": "https://upload.wikimedia.org/wikipedia/commons/4/42/Walnut_wood_carving.jpg",
  "Warli Art": "https://upload.wikimedia.org/wikipedia/commons/3/34/Warli-art-2.jpg",
  "Wire Inlay and Wood Inlay": "https://upload.wikimedia.org/wikipedia/commons/2/2b/Wood_inlay_Mysore.jpg",
  "Wood Carving": "https://upload.wikimedia.org/wikipedia/commons/2/2e/Thazhathangadi_juma_masjid_Kottayam_Kerala_south_india.jpg",
  "Wood Carving Block Making": "https://upload.wikimedia.org/wikipedia/commons/c/c1/Master_artist_carves_a_woodblock_for_textile_printing.jpg"
};

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);

  let updatedRowsTotal = 0;
  for (const [craft, url] of Object.entries(mapping)) {
    const [res] = await conn.execute(
      'UPDATE artisan_profiles SET coverPhotoUrl = ? WHERE craftSpecialization = ?',
      [url, craft]
    );
    updatedRowsTotal += res.affectedRows;
  }

  const [countRes] = await conn.execute(
    "SELECT COUNT(*) as count FROM artisan_profiles WHERE coverPhotoUrl != '/placeholder-cover.jpg'"
  );

  console.log(`Final count: ${countRes[0].count}`);
  await conn.end();
}

main().catch(console.error);
