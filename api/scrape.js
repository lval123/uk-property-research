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
    // Build Rightmove URL
    const typeParam = type && type !== 'all' ? `&propertyType=${encodeURIComponent(type)}` : '';
    const priceMin = minPrice ? `&minPrice=${minPrice}` : '';
    const priceMax = maxPrice ? `&maxPrice=${maxPrice}` : '';
    
    const url = `https://www.rightmove.co.uk/property-for-sale/find.html?searchLocation=${encodeURIComponent(area)}${priceMin}${priceMax}${typeParam}&sortType=6&index=0&pageSize=25`;

    console.log('Fetching:', url);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-GB,en;q=0.9',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      timeout: 15000
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();

    // Parse properties from HTML
    const properties = parseProperties(html, area);

    if (properties.length === 0) {
      return res.json({
        success: false,
        message: 'No properties found',
        data: generateMockData(area, minPrice, maxPrice, type),
        isMock: true
      });
    }

    res.json({
      success: true,
      count: properties.length,
      data: properties.slice(0, 25),
      isMock: false
    });

  } catch (error) {
    console.error('Error:', error.message);
    
    res.json({
      success: false,
      message: 'Scraping failed, using demo data',
      data: generateMockData(area, minPrice, maxPrice, type),
      isMock: true
    });
  }
}

function parseProperties(html, area) {
  const properties = [];
  
  // Extract JSON data from HTML (Rightmove stores data in window.__INITIAL_STATE__)
  const jsonMatch = html.match(/window\.__INITIAL_STATE__\s*=\s*({.*?})<\/script>/s);
  
  if (jsonMatch) {
    try {
      const data = JSON.parse(jsonMatch[1]);
      const results = data?.properties?.list || [];
      
      results.forEach((prop, i) => {
        if (properties.length >= 25) return;
        
        try {
          const address = prop.displayAddress || '';
          const price = prop.price?.amount || 0;
          const bedrooms = prop.bedrooms || 0;
          const propertyType = prop.propertyType || 'Unknown';
          
          if (!address || price === 0) return;
          
          // Estimate sqft (rough calculation)
          const sqft = Math.max(800, (bedrooms || 2) * 400 + 400);
          
          properties.push({
            id: `rightmove-${Date.now()}-${i}`,
            address,
            area,
            price,
            beds: bedrooms || 2,
            sqft,
            type: propertyType,
            pricePerSqft: Math.round(price / sqft),
            source: 'Rightmove',
            url: `https://www.rightmove.co.uk${prop.propertyUrl}` || ''
          });
        } catch (e) {
          console.log('Parse error:', e.message);
        }
      });
    } catch (e) {
      console.log('JSON parse error:', e.message);
    }
  }

  // Fallback: regex parsing
  if (properties.length === 0) {
    const propertyRegex = /property-for-sale\/([^"]+)">([^<]+)<\/a>[\s\S]*?£([\d,]+)/g;
    let match;
    
    while ((match = propertyRegex.exec(html)) && properties.length < 25) {
      try {
        const address = match[2].trim();
        const price = parseInt(match[3].replace(/,/g, ''));
        
        if (price > 0) {
          properties.push({
            id: `rightmove-${Date.now()}-${properties.length}`,
            address,
            area,
            price,
            beds: 2,
            sqft: 1000,
            type: 'House',
            pricePerSqft: Math.round(price / 1000),
            source: 'Rightmove'
          });
        }
      } catch (e) {
        console.log('Regex error:', e.message);
      }
    }
  }

  return properties;
}

function generateMockData(area, minPrice, maxPrice, type) {
  const min = parseInt(minPrice) || 200000;
  const max = parseInt(maxPrice) || 500000;
  const propertyTypes = type && type !== 'all' ? [type] : ['Flat', 'House', 'Terraced', 'Semi-Detached'];
  const properties = [];

  for (let i = 0; i < 25; i++) {
    const price = min + Math.random() * (max - min);
    const beds = Math.floor(Math.random() * 4) + 1;
    const sqft = 500 + beds * 400 + Math.random() * 500;

    properties.push({
      id: `mock-${Date.now()}-${i}`,
      address: `${i + 1} ${['Oak', 'Elm', 'Maple', 'Pine', 'Birch', 'Cedar'][Math.floor(Math.random() * 6)]} Street, ${area}`,
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
