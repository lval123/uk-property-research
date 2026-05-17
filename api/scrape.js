import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { area, minPrice, maxPrice, type } = req.query;

  if (!area) {
    return res.status(400).json({ error: 'Area required' });
  }

  try {
    const typeParam = type && type !== 'all' ? `&propertyType=${type}` : '';
    const priceMin = minPrice ? `&minPrice=${minPrice}` : '';
    const priceMax = maxPrice ? `&maxPrice=${maxPrice}` : '';
    
    const url = `https://www.rightmove.co.uk/property-for-sale/find.html?searchLocation=${encodeURIComponent(area)}${priceMin}${priceMax}${typeParam}&sortType=6&index=0&pageSize=25`;

    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(data);
    const properties = [];

    $('div[data-test="propertyCard"]').each((i, elem) => {
      if (properties.length >= 25) return;

      try {
        const address = $(elem).find('h2[data-test="propertyCardHeader"] a').text().trim();
        const priceText = $(elem).find('span[data-test="propertyCardPrice"]').text().trim();
        const bedsText = $(elem).find('span[data-test="propertyCardBedrooms"]').text().trim();
        const sqftText = $(elem).find('span[data-test="propertyCardFloorArea"]').text().trim();
        const typeText = $(elem).find('span[data-test="propertyCardType"]').text().trim();

        if (!address || !priceText) return;

        // Parse price (£300,000)
        const price = parseInt(priceText.replace(/[^0-9]/g, '')) || 0;
        if (price === 0) return;

        // Parse beds (3 bed)
        const beds = parseInt(bedsText) || 0;

        // Parse sqft
        const sqft = sqftText ? parseInt(sqftText.replace(/[^0-9]/g, '')) : 1000;

        // Get type
        const propertyType = typeText || 'Unknown';

        properties.push({
          id: `rightmove-${Date.now()}-${i}`,
          address,
          area,
          price,
          beds: beds || 2,
          sqft: sqft || 1000,
          type: propertyType,
          pricePerSqft: Math.round(price / (sqft || 1000)),
          source: 'Rightmove',
          url: $(elem).find('h2 a').attr('href')
        });
      } catch (e) {
        console.log('Error parsing property:', e.message);
      }
    });

    if (properties.length === 0) {
      // Fallback to mock data if scraping fails
      return res.json({
        success: false,
        message: 'No properties found. Using demo data.',
        data: generateMockData(area, minPrice, maxPrice, type),
        isMock: true
      });
    }

    res.json({
      success: true,
      count: properties.length,
      data: properties.sort((a, b) => a.price - b.price),
      isMock: false
    });

  } catch (error) {
    console.error('Scraping error:', error.message);
    
    // Return mock data on error
    res.json({
      success: false,
      message: 'Scraping failed, using demo data',
      data: generateMockData(area, minPrice, maxPrice, type),
      isMock: true
    });
  }
}

function generateMockData(area, minPrice, maxPrice, type) {
  const min = parseInt(minPrice) || 200000;
  const max = parseInt(maxPrice) || 500000;
  const propertyTypes = type && type !== 'all' ? [type] : ['Flat', 'House', 'Terraced'];
  const properties = [];

  for (let i = 0; i < 25; i++) {
    const price = min + Math.random() * (max - min);
    const beds = Math.floor(Math.random() * 4) + 1;
    const sqft = 500 + beds * 400 + Math.random() * 500;

    properties.push({
      id: `mock-${Date.now()}-${i}`,
      address: `${i + 1} ${['Oak', 'Elm', 'Maple', 'Pine'][Math.floor(Math.random() * 4)]} Street, ${area}`,
      area,
      price: Math.round(price),
      beds,
      sqft: Math.round(sqft),
      type: propertyTypes[Math.floor(Math.random() * propertyTypes.length)],
      pricePerSqft: Math.round(price / sqft),
      source: 'Demo Data',
      isMock: true
    });
  }

  return properties.sort((a, b) => a.price - b.price);
}
