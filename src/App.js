import React, { useState } from 'react';
import { BarChart3, Home, Plus, Trash2, Search, Calculator } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [properties, setProperties] = useState([]);
  const [clients, setClients] = useState([]);
  const [deals, setDeals] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [comparables, setComparables] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const addProperty = (property) => {
    setProperties([...properties, { ...property, id: Date.now() }]);
  };

  const deleteProperty = (id) => {
    setProperties(properties.filter(p => p.id !== id));
  };

  const addClient = (client) => {
    setClients([...clients, { ...client, id: Date.now() }]);
  };

  const deleteClient = (id) => {
    setClients(clients.filter(c => c.id !== id));
  };

  const addDeal = (deal) => {
    setDeals([...deals, { ...deal, id: Date.now() }]);
  };

  const deleteDeal = (id) => {
    setDeals(deals.filter(d => d.id !== id));
  };

  const searchProperties = async (area, minBudget, maxBudget, type) => {
    setIsSearching(true);
    const mockResults = generateMockResults(area, minBudget, maxBudget, type);
    setSearchResults(mockResults);
    generateComparables(mockResults);
    setIsSearching(false);
  };

  const generateMockResults = (area, minBudget, maxBudget, type) => {
    const propertyTypes = type === 'all' ? ['Flat', 'House', 'Terraced'] : [type];
    const results = [];
    
    for (let i = 0; i < 8; i++) {
      const price = minBudget + Math.random() * (maxBudget - minBudget);
      const beds = Math.floor(Math.random() * 4) + 1;
      const sqft = 500 + beds * 400 + Math.random() * 500;
      
      results.push({
        id: `search-${Date.now()}-${i}`,
        address: `${i + 1} ${['Oak', 'Elm', 'Maple'][Math.floor(Math.random() * 3)]} Street, ${area}`,
        area,
        price: Math.round(price),
        beds,
        sqft: Math.round(sqft),
        type: propertyTypes[Math.floor(Math.random() * propertyTypes.length)],
        pricePerSqft: Math.round(price / sqft),
        source: ['Rightmove', 'Zoopla'][Math.floor(Math.random() * 2)]
      });
    }
    
    return results.sort((a, b) => a.price - b.price);
  };

  const generateComparables = (results) => {
    if (results.length === 0) return;
    
    const grouped = {};
    results.forEach(prop => {
      if (!grouped[prop.type]) {
        grouped[prop.type] = [];
      }
      grouped[prop.type].push(prop);
    });

    const comps = Object.entries(grouped).map(([type, props]) => {
      const avgPrice = props.reduce((sum, p) => sum + p.price, 0) / props.length;
      const avgSqft = props.reduce((sum, p) => sum + p.sqft, 0) / props.length;
      const avgPricePerSqft = Math.round(avgPrice / avgSqft);
      
      return {
        type,
        count: props.length,
        avgPrice: Math.round(avgPrice),
        avgSqft: Math.round(avgSqft),
        avgPricePerSqft,
        minPrice: Math.min(...props.map(p => p.price)),
        maxPrice: Math.max(...props.map(p => p.price))
      };
    });

    setComparables(comps);
  };

  const analyzeInvestment = (property) => {
    const targetPricePerSqft = comparables.length > 0 
      ? Math.min(...comparables.map(c => c.avgPricePerSqft)) * 0.92
      : property.pricePerSqft;

    const marketValue = Math.round(targetPricePerSqft * property.sqft);
    const profit = marketValue - property.price;
    const profitMargin = ((profit / property.price) * 100).toFixed(1);
    const isGoodDeal = profit > 0 && profitMargin >= 15;

    return {
      marketValue,
      profit,
      profitMargin,
      isGoodDeal,
      grade: isGoodDeal ? 'A+' : profitMargin > 0 ? 'B' : 'C'
    };
  };

  const calculateMortgage = (propertyValue, depositPercent, interestRate, mortgageTerm) => {
    const deposit = propertyValue * (depositPercent / 100);
    const principal = propertyValue - deposit;
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = mortgageTerm * 12;
    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    
    return {
      deposit,
      mortgageAmount: principal,
      monthlyPayment,
      annualPayment: monthlyPayment * 12,
      totalInterest: monthlyPayment * numberOfPayments - principal,
      totalRepayment: monthlyPayment * numberOfPayments
    };
  };

  const calculateDealMetrics = (deal) => {
    const totalCost = deal.purchasePrice + deal.renovationCost;
    const profit = deal.arv - totalCost;
    const roi = ((profit / totalCost) * 100).toFixed(2);
    
    return { totalCost, profit, roi };
  };

  const totalDeals = deals.length;
  const totalInvestment = deals.reduce((sum, d) => sum + d.purchasePrice + d.renovationCost, 0);
  const avgRoi = deals.length > 0 ? (deals.reduce((sum, d) => sum + parseFloat(calculateDealMetrics(d).roi), 0) / deals.length).toFixed(2) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <Home className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">UK Property Investment Hub</h1>
          </div>

          <div className="flex gap-8 overflow-x-auto">
            <button onClick={() => setActiveTab('dashboard')} className={`py-2 px-2 border-b-2 font-medium whitespace-nowrap ${activeTab === 'dashboard' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600'}`}>
              Dashboard
            </button>
            <button onClick={() => setActiveTab('search')} className={`py-2 px-2 border-b-2 font-medium whitespace-nowrap ${activeTab === 'search' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600'}`}>
              Find Properties
            </button>
            <button onClick={() => setActiveTab('comparables')} className={`py-2 px-2 border-b-2 font-medium whitespace-nowrap ${activeTab === 'comparables' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600'}`}>
              Comparables
            </button>
            <button onClick={() => setActiveTab('properties')} className={`py-2 px-2 border-b-2 font-medium whitespace-nowrap ${activeTab === 'properties' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600'}`}>
              Portfolio
            </button>
            <button onClick={() => setActiveTab('clients')} className={`py-2 px-2 border-b-2 font-medium whitespace-nowrap ${activeTab === 'clients' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600'}`}>
              Investors
            </button>
            <button onClick={() => setActiveTab('deals')} className={`py-2 px-2 border-b-2 font-medium whitespace-nowrap ${activeTab === 'deals' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600'}`}>
              Deals
            </button>
            <button onClick={() => setActiveTab('calculators')} className={`py-2 px-2 border-b-2 font-medium whitespace-nowrap ${activeTab === 'calculators' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600'}`}>
              Calculators
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">Investment Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm font-medium text-gray-600">Active Deals</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{totalDeals}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm font-medium text-gray-600">Total Investment</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">£{totalInvestment.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm font-medium text-gray-600">Properties Saved</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{properties.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm font-medium text-gray-600">Avg ROI</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{avgRoi}%</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm font-medium text-gray-600">Investors</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">{clients.length}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'search' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">Find & Analyze Properties</h2>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                <input type="text" placeholder="Area (e.g., London)" defaultValue="London" onChange={(e) => window.searchArea = e.target.value} className="px-3 py-2 border border-gray-300 rounded-lg" />
                <input type="number" placeholder="Min Budget" defaultValue="200000" onChange={(e) => window.minBudget = e.target.value} className="px-3 py-2 border border-gray-300 rounded-lg" />
                <input type="number" placeholder="Max Budget" defaultValue="500000" onChange={(e) => window.maxBudget = e.target.value} className="px-3 py-2 border border-gray-300 rounded-lg" />
                <select onChange={(e) => window.type = e.target.value} className="px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="all">All Types</option>
                  <option value="Flat">Flat</option>
                  <option value="House">House</option>
                </select>
                <button onClick={() => searchProperties(window.searchArea || 'London', parseFloat(window.minBudget) || 200000, parseFloat(window.maxBudget) || 500000, window.type || 'all')} disabled={isSearching} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium">
                  {isSearching ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-2xl font-bold">Found {searchResults.length} Properties</h3>
                {searchResults.map(result => {
                  const analysis = analyzeInvestment(result);
                  return (
                    <div key={result.id} className={`rounded-lg shadow p-6 border-l-4 ${analysis.isGoodDeal ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{result.address}</h3>
                          <p className="text-sm text-gray-600">{result.beds} bed • {result.sqft} sqft</p>
                        </div>
                        <div className={`px-4 py-2 rounded font-bold text-white ${analysis.isGoodDeal ? 'bg-green-600' : 'bg-red-600'}`}>
                          {analysis.isGoodDeal ? '✅ GO' : '❌ NO-GO'}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4 text-sm">
                        <div><p className="text-gray-600">Asking</p><p className="font-bold">£{result.price.toLocaleString()}</p></div>
                        <div><p className="text-gray-600">Market</p><p className="font-bold text-blue-600">£{analysis.marketValue.toLocaleString()}</p></div>
                        <div><p className="text-gray-600">Profit</p><p className={`font-bold ${analysis.profit > 0 ? 'text-green-600' : 'text-red-600'}`}>£{analysis.profit.toLocaleString()}</p></div>
                        <div><p className="text-gray-600">%</p><p className={`font-bold text-lg ${analysis.profitMargin > 0 ? 'text-green-600' : 'text-red-600'}`}>{analysis.profitMargin}%</p></div>
                        <div><p className="text-gray-600">Grade</p><p className={`font-bold text-xl ${analysis.isGoodDeal ? 'text-green-600' : 'text-gray-600'}`}>{analysis.grade}</p></div>
                        <div><p className="text-gray-600">Source</p><p className="font-medium">{result.source}</p></div>
                      </div>

                      <button onClick={() => addProperty(result)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium">
                        Save to Portfolio
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'comparables' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">Market Comparables</h2>
            
            {comparables.length === 0 ? (
              <p className="text-gray-600">Run a search first to generate comparables.</p>
            ) : (
              <div className="space-y-4">
                {comparables.map((comp, idx) => (
                  <div key={idx} className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">{comp.type} Properties ({comp.count} found)</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="bg-blue-50 p-4 rounded">
                        <p className="text-sm text-gray-600">Avg Price</p>
                        <p className="text-xl font-bold text-blue-600">£{comp.avgPrice.toLocaleString()}</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded">
                        <p className="text-sm text-gray-600">Price/Sqft</p>
                        <p className="text-xl font-bold text-green-600">£{comp.avgPricePerSqft}</p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded">
                        <p className="text-sm text-gray-600">Min Price</p>
                        <p className="text-xl font-bold text-purple-600">£{comp.minPrice.toLocaleString()}</p>
                      </div>
                      <div className="bg-orange-50 p-4 rounded">
                        <p className="text-sm text-gray-600">Max Price</p>
                        <p className="text-xl font-bold text-orange-600">£{comp.maxPrice.toLocaleString()}</p>
                      </div>
                      <div className="bg-red-50 p-4 rounded">
                        <p className="text-sm text-gray-600">Avg Size</p>
                        <p className="text-xl font-bold text-red-600">{comp.avgSqft} sqft</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'properties' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">Property Portfolio</h2>

            {properties.length === 0 ? (
              <p className="text-gray-600">No properties saved yet.</p>
            ) : (
              <div className="space-y-4">
                {properties.map(prop => (
                  <div key={prop.id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{prop.address}</h3>
                        <p className="text-sm text-gray-600">{prop.beds} bed • £{prop.price.toLocaleString()}</p>
                      </div>
                      <button onClick={() => deleteProperty(prop.id)} className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'clients' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-gray-900">Investors</h2>
              <button onClick={() => {
                const name = prompt('Investor Name:');
                const budget = prompt('Budget (£):');
                if (name) addClient({ name, budget });
              }} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>

            {clients.length === 0 ? (
              <p className="text-gray-600">No investors added.</p>
            ) : (
              <div className="space-y-4">
                {clients.map(client => (
                  <div key={client.id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{client.name}</h3>
                        <p className="text-sm text-gray-600">Budget: £{client.budget}</p>
                      </div>
                      <button onClick={() => deleteClient(client.id)} className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'deals' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-gray-900">Deal Analysis</h2>
              <button onClick={() => {
                const purchasePrice = parseFloat(prompt('Purchase Price (£):') || 0);
                const renovationCost = parseFloat(prompt('Renovation Cost (£):') || 0);
                const arv = parseFloat(prompt('ARV (£):') || 0);
                if (purchasePrice) addDeal({ purchasePrice, renovationCost, arv });
              }} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                <Plus className="w-4 h-4" /> Add Deal
              </button>
            </div>

            {deals.length === 0 ? (
              <p className="text-gray-600">No deals analyzed.</p>
            ) : (
              <div className="space-y-4">
                {deals.map(deal => {
                  const metrics = calculateDealMetrics(deal);
                  return (
                    <div key={deal.id} className="bg-white rounded-lg shadow p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Deal #{deal.id}</h3>
                        <button onClick={() => deleteDeal(deal.id)} className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div><p className="text-gray-600">Purchase</p><p className="font-bold">£{deal.purchasePrice.toLocaleString()}</p></div>
                        <div><p className="text-gray-600">Renovation</p><p className="font-bold">£{deal.renovationCost.toLocaleString()}</p></div>
                        <div><p className="text-gray-600">Profit</p><p className="font-bold text-green-600">£{metrics.profit.toLocaleString()}</p></div>
                        <div><p className="text-gray-600">ROI</p><p className="font-bold text-green-600">{metrics.roi}%</p></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'calculators' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">Calculators</h2>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Mortgage Calculator</h3>
              <MortgageCalc calculateMortgage={calculateMortgage} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MortgageCalc({ calculateMortgage }) {
  const [propertyValue, setPropertyValue] = useState(300000);
  const [deposit, setDeposit] = useState(25);
  const [rate, setRate] = useState(5.5);
  const [term, setTerm] = useState(25);
  const [result, setResult] = useState(null);

  const handleCalc = () => {
    setResult(calculateMortgage(propertyValue, deposit, rate, term));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <input type="number" placeholder="Property Value (£)" value={propertyValue} onChange={(e) => setPropertyValue(parseFloat(e.target.value))} className="px-3 py-2 border border-gray-300 rounded-lg" />
        <input type="number" placeholder="Deposit (%)" value={deposit} onChange={(e) => setDeposit(parseFloat(e.target.value))} className="px-3 py-2 border border-gray-300 rounded-lg" />
        <input type="number" placeholder="Rate (%)" value={rate} onChange={(e) => setRate(parseFloat(e.target.value))} className="px-3 py-2 border border-gray-300 rounded-lg" />
        <input type="number" placeholder="Term (yrs)" value={term} onChange={(e) => setTerm(parseFloat(e.target.value))} className="px-3 py-2 border border-gray-300 rounded-lg" />
      </div>
      <button onClick={handleCalc} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium">Calculate</button>
      {result && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
          <div><p className="text-sm text-gray-600">Monthly</p><p className="font-bold">£{result.monthlyPayment.toLocaleString()}</p></div>
          <div><p className="text-sm text-gray-600">Annual</p><p className="font-bold">£{result.annualPayment.toLocaleString()}</p></div>
          <div><p className="text-sm text-gray-600">Interest</p><p className="font-bold">£{result.totalInterest.toLocaleString()}</p></div>
          <div><p className="text-sm text-gray-600">Total</p><p className="font-bold">£{result.totalRepayment.toLocaleString()}</p></div>
        </div>
      )}
    </div>
  );
}
