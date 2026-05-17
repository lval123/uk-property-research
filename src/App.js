import React, { useState } from 'react';
import { BarChart3, Home, Users, Calculator, TrendingUp, Plus, Trash2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [properties, setProperties] = useState([]);
  const [clients, setClients] = useState([]);
  const [deals, setDeals] = useState([]);
  const [filterArea, setFilterArea] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterMarket, setFilterMarket] = useState('all');

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

  const calculateRentalYield = (propertyValue, monthlyRent, annualRates, annualInsurance, annualMaintenance, annualManagement, voidPercentage) => {
    const annualRent = monthlyRent * 12;
    const voidLoss = annualRent * (voidPercentage / 100);
    const effectiveRent = annualRent - voidLoss;
    const totalExpenses = annualRates + annualInsurance + annualMaintenance + annualManagement;
    const netAnnualIncome = effectiveRent - totalExpenses;
    
    return {
      grossYield: ((annualRent / propertyValue) * 100).toFixed(2),
      netYield: ((netAnnualIncome / propertyValue) * 100).toFixed(2),
      monthlyNetCashFlow: (netAnnualIncome / 12).toFixed(2)
    };
  };

  const calculateDealMetrics = (deal) => {
    const totalCost = deal.purchasePrice + deal.renovationCost;
    const profit = deal.arv - totalCost;
    const roi = ((profit / totalCost) * 100).toFixed(2);
    
    return { totalCost, profit, roi };
  };

  const filteredProperties = properties.filter(p => {
    const areaMatch = filterArea === 'all' || p.area === filterArea;
    const typeMatch = filterType === 'all' || p.type === filterType;
    const marketMatch = filterMarket === 'all' || p.market === filterMarket;
    return areaMatch && typeMatch && marketMatch;
  });

  const totalDeals = deals.length;
  const totalInvestment = deals.reduce((sum, d) => sum + d.purchasePrice + d.renovationCost, 0);
  const totalRenovationBudget = deals.reduce((sum, d) => sum + d.renovationCost, 0);
  const avgRoi = deals.length > 0 ? (deals.reduce((sum, d) => sum + parseFloat(calculateDealMetrics(d).roi), 0) / deals.length).toFixed(2) : 0;
  const avgNetYield = deals.filter(d => d.exitStrategy === 'rent').length > 0 
    ? (deals.filter(d => d.exitStrategy === 'rent').reduce((sum, d) => sum + parseFloat(calculateRentalYield(d.propertyValue || 0, d.monthlyRent || 0, d.councilTax || 0, d.insurance || 0, d.maintenance || 0, 0, d.voidPeriod || 0).netYield), 0) / deals.filter(d => d.exitStrategy === 'rent').length).toFixed(2)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Home className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">UK Property Research Hub</h1>
          </div>
        </div>

        <div className="border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 flex gap-8">
            <button onClick={() => setActiveTab('dashboard')} className={`py-4 px-2 border-b-2 font-medium transition ${activeTab === 'dashboard' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'}`}>
              <div className="flex items-center gap-2"><BarChart3 className="w-4 h-4" /> Dashboard</div>
            </button>
            <button onClick={() => setActiveTab('properties')} className={`py-4 px-2 border-b-2 font-medium transition ${activeTab === 'properties' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'}`}>
              <div className="flex items-center gap-2"><Home className="w-4 h-4" /> Properties</div>
            </button>
            <button onClick={() => setActiveTab('clients')} className={`py-4 px-2 border-b-2 font-medium transition ${activeTab === 'clients' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'}`}>
              <div className="flex items-center gap-2"><Users className="w-4 h-4" /> Clients</div>
            </button>
            <button onClick={() => setActiveTab('deals')} className={`py-4 px-2 border-b-2 font-medium transition ${activeTab === 'deals' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'}`}>
              <div className="flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Deal Stacking</div>
            </button>
            <button onClick={() => setActiveTab('calculators')} className={`py-4 px-2 border-b-2 font-medium transition ${activeTab === 'calculators' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'}`}>
              <div className="flex items-center gap-2"><Calculator className="w-4 h-4" /> Calculators</div>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm font-medium text-gray-600">Total Deals</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{totalDeals}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm font-medium text-gray-600">Total Investment</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">£{totalInvestment.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm font-medium text-gray-600">Renovation Budget</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">£{totalRenovationBudget.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm font-medium text-gray-600">Avg ROI</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{avgRoi}%</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm font-medium text-gray-600">Avg Net Yield</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{avgNetYield}%</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'properties' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-gray-900">Properties</h2>
              <button onClick={() => {
                const address = prompt('Address:');
                const area = prompt('Area (e.g., London, Manchester):');
                const postcode = prompt('Postcode:');
                const type = prompt('Type (e.g., Flat, House, Commercial):');
                const bedrooms = prompt('Bedrooms:');
                const askingPrice = prompt('Asking Price (£):');
                const agent = prompt('Agent:');
                const listingUrl = prompt('Listing URL:');
                const market = prompt('Market (on/off):');
                
                if (address) {
                  addProperty({ address, area, postcode, type, bedrooms, askingPrice, agent, listingUrl, market });
                }
              }} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                <Plus className="w-4 h-4" /> Add Property
              </button>
            </div>

            <div className="flex gap-4 bg-white p-4 rounded-lg shadow">
              <select value={filterArea} onChange={(e) => setFilterArea(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg">
                <option value="all">All Areas</option>
                {[...new Set(properties.map(p => p.area))].map(area => <option key={area} value={area}>{area}</option>)}
              </select>
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg">
                <option value="all">All Types</option>
                {[...new Set(properties.map(p => p.type))].map(type => <option key={type} value={type}>{type}</option>)}
              </select>
              <select value={filterMarket} onChange={(e) => setFilterMarket(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg">
                <option value="all">All Markets</option>
                <option value="on">On-Market</option>
                <option value="off">Off-Market</option>
              </select>
            </div>

            <div className="space-y-4">
              {filteredProperties.map(prop => (
                <div key={prop.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{prop.address}</h3>
                      <p className="text-sm text-gray-600">{prop.area} • {prop.postcode}</p>
                    </div>
                    <button onClick={() => deleteProperty(prop.id)} className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div><p className="text-gray-600">Type</p><p className="font-medium">{prop.type}</p></div>
                    <div><p className="text-gray-600">Bedrooms</p><p className="font-medium">{prop.bedrooms}</p></div>
                    <div><p className="text-gray-600">Asking Price</p><p className="font-medium">£{prop.askingPrice}</p></div>
                    <div><p className="text-gray-600">Market</p><p className="font-medium">{prop.market}</p></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'clients' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-gray-900">Clients</h2>
              <button onClick={() => {
                const name = prompt('Client Name:');
                const budget = prompt('Budget (£):');
                const location = prompt('Preferred Location:');
                const investmentType = prompt('Investment Type (buy-to-let/flip/commercial/mixed):');
                
                if (name) {
                  addClient({ name, budget, location, investmentType });
                }
              }} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                <Plus className="w-4 h-4" /> Add Client
              </button>
            </div>

            <div className="space-y-4">
              {clients.map(client => (
                <div key={client.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{client.name}</h3>
                      <p className="text-sm text-gray-600">{client.location}</p>
                    </div>
                    <button onClick={() => deleteClient(client.id)} className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><p className="text-gray-600">Budget</p><p className="font-medium">£{client.budget}</p></div>
                    <div><p className="text-gray-600">Investment Type</p><p className="font-medium">{client.investmentType}</p></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'deals' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-gray-900">Deal Stacking</h2>
              <button onClick={() => {
                const purchasePrice = parseFloat(prompt('Purchase Price (£):') || 0);
                const renovationCost = parseFloat(prompt('Renovation Cost (£):') || 0);
                const arv = parseFloat(prompt('After Repair Value (£):') || 0);
                const exitStrategy = prompt('Exit Strategy (flip/rent):');
                const timeline = prompt('Timeline (months):');
                const propertyValue = prompt('Property Value (£):');
                const monthlyRent = prompt('Monthly Rent (£):');
                const councilTax = parseFloat(prompt('Council Tax (£/month):') || 0);
                const insurance = parseFloat(prompt('Insurance (£/month):') || 0);
                const maintenance = parseFloat(prompt('Maintenance (£/month):') || 0);
                const voidPeriod = parseFloat(prompt('Void Period (%):') || 0);
                
                if (purchasePrice) {
                  addDeal({ 
                    purchasePrice, 
                    renovationCost, 
                    arv, 
                    exitStrategy, 
                    timeline, 
                    propertyValue,
                    monthlyRent,
                    councilTax,
                    insurance,
                    maintenance,
                    voidPeriod
                  });
                }
              }} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                <Plus className="w-4 h-4" /> Add Deal
              </button>
            </div>

            <div className="space-y-4">
              {deals.map(deal => {
                const metrics = calculateDealMetrics(deal);
                const yield_ = deal.exitStrategy === 'rent' ? calculateRentalYield(deal.propertyValue || 0, deal.monthlyRent || 0, deal.councilTax || 0, deal.insurance || 0, deal.maintenance || 0, 0, deal.voidPeriod || 0) : null;
                
                return (
                  <div key={deal.id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Deal #{deal.id}</h3>
                        <p className="text-sm text-gray-600">Exit: {deal.exitStrategy}</p>
                      </div>
                      <button onClick={() => deleteDeal(deal.id)} className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                      <div><p className="text-gray-600">Purchase</p><p className="font-medium">£{deal.purchasePrice.toLocaleString()}</p></div>
                      <div><p className="text-gray-600">Renovation</p><p className="font-medium">£{deal.renovationCost.toLocaleString()}</p></div>
                      <div><p className="text-gray-600">Total Cost</p><p className="font-bold text-blue-600">£{metrics.totalCost.toLocaleString()}</p></div>
                      <div><p className="text-gray-600">ARV</p><p className="font-medium">£{deal.arv.toLocaleString()}</p></div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div><p className="text-gray-600">Profit</p><p className="font-bold text-green-600">£{metrics.profit.toLocaleString()}</p></div>
                      <div><p className="text-gray-600">ROI</p><p className="font-bold text-green-600">{metrics.roi}%</p></div>
                      <div><p className="text-gray-600">Timeline</p><p className="font-medium">{deal.timeline} months</p></div>
                    </div>

                    {yield_ && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="font-medium text-gray-900 mb-3">Rental Yield Analysis</h4>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div><p className="text-gray-600">Gross Yield</p><p className="font-medium text-pink-600">{yield_.grossYield}%</p></div>
                          <div><p className="text-gray-600">Net Yield</p><p className="font-medium text-pink-600">{yield_.netYield}%</p></div>
                          <div><p className="text-gray-600">Monthly Cash Flow</p><p className="font-medium">£{yield_.monthlyNetCashFlow}</p></div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'calculators' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">Calculators</h2>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Mortgage Calculator</h3>
              <MortgageCalculator calculateMortgage={calculateMortgage} />
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Rental Yield Calculator</h3>
              <RentalYieldCalculator calculateRentalYield={calculateRentalYield} />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-blue-900 mb-4">Financial Metrics Guide</h3>
              <div className="space-y-3 text-sm text-blue-800">
                <div><strong>Gross Yield:</strong> Annual rent ÷ property value × 100</div>
                <div><strong>Net Yield:</strong> (Annual rent - expenses) ÷ property value × 100</div>
                <div><strong>ROI:</strong> Profit ÷ total cost × 100</div>
                <div><strong>UK Mortgage Rates:</strong> 4-6% typical for buy-to-let</div>
                <div><strong>Rental Yields:</strong> 4-8% gross, 2-5% net typical</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MortgageCalculator({ calculateMortgage }) {
  const [propertyValue, setPropertyValue] = useState(300000);
  const [deposit, setDeposit] = useState(25);
  const [rate, setRate] = useState(5.5);
  const [term, setTerm] = useState(25);
  const [result, setResult] = useState(null);

  const handleCalculate = () => {
    const r = calculateMortgage(propertyValue, deposit, rate, term);
    setResult(r);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <input type="number" placeholder="Property Value (£)" value={propertyValue} onChange={(e) => setPropertyValue(parseFloat(e.target.value))} className="px-3 py-2 border border-gray-300 rounded-lg" />
        <input type="number" placeholder="Deposit (%)" value={deposit} onChange={(e) => setDeposit(parseFloat(e.target.value))} className="px-3 py-2 border border-gray-300 rounded-lg" />
        <input type="number" placeholder="Interest Rate (%)" value={rate} onChange={(e) => setRate(parseFloat(e.target.value))} className="px-3 py-2 border border-gray-300 rounded-lg" />
        <input type="number" placeholder="Mortgage Term (years)" value={term} onChange={(e) => setTerm(parseFloat(e.target.value))} className="px-3 py-2 border border-gray-300 rounded-lg" />
      </div>
      <button onClick={handleCalculate} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium">Calculate</button>
      
      {result && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
          <div><p className="text-gray-600 text-sm">Deposit</p><p className="font-bold text-lg">£{result.deposit.toLocaleString()}</p></div>
          <div><p className="text-gray-600 text-sm">Mortgage Amount</p><p className="font-bold text-lg">£{result.mortgageAmount.toLocaleString()}</p></div>
          <div><p className="text-gray-600 text-sm">Monthly Payment</p><p className="font-bold text-lg">£{result.monthlyPayment.toLocaleString()}</p></div>
          <div><p className="text-gray-600 text-sm">Annual Payment</p><p className="font-bold text-lg">£{result.annualPayment.toLocaleString()}</p></div>
          <div><p className="text-gray-600 text-sm">Total Interest</p><p className="font-bold text-lg">£{result.totalInterest.toLocaleString()}</p></div>
          <div><p className="text-gray-600 text-sm">Total Repayment</p><p className="font-bold text-lg">£{result.totalRepayment.toLocaleString()}</p></div>
        </div>
      )}
    </div>
  );
}

function RentalYieldCalculator({ calculateRentalYield }) {
  const [propertyValue, setPropertyValue] = useState(300000);
  const [monthlyRent, setMonthlyRent] = useState(1200);
  const [rates, setRates] = useState(120);
  const [insurance, setInsurance] = useState(80);
  const [maintenance, setMaintenance] = useState(100);
  const [management, setManagement] = useState(10);
  const [result, setResult] = useState(null);

  const handleCalculate = () => {
    const r = calculateRentalYield(propertyValue, monthlyRent, rates * 12, insurance * 12, maintenance * 12, (monthlyRent * management / 100) * 12, 5);
    setResult(r);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <input type="number" placeholder="Property Value (£)" value={propertyValue} onChange={(e) => setPropertyValue(parseFloat(e.target.value))} className="px-3 py-2 border border-gray-300 rounded-lg" />
        <input type="number" placeholder="Monthly Rent (£)" value={monthlyRent} onChange={(e) => setMonthlyRent(parseFloat(e.target.value))} className="px-3 py-2 border border-gray-300 rounded-lg" />
        <input type="number" placeholder="Monthly Council Tax (£)" value={rates} onChange={(e) => setRates(parseFloat(e.target.value))} className="px-3 py-2 border border-gray-300 rounded-lg" />
        <input type="number" placeholder="Monthly Insurance (£)" value={insurance} onChange={(e) => setInsurance(parseFloat(e.target.value))} className="px-3 py-2 border border-gray-300 rounded-lg" />
        <input type="number" placeholder="Monthly Maintenance (£)" value={maintenance} onChange={(e) => setMaintenance(parseFloat(e.target.value))} className="px-3 py-2 border border-gray-300 rounded-lg" />
        <input type="number" placeholder="Management Fee (%)" value={management} onChange={(e) => setManagement(parseFloat(e.target.value))} className="px-3 py-2 border border-gray-300 rounded-lg" />
      </div>
      <button onClick={handleCalculate} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium">Calculate</button>
      
      {result && (
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
          <div><p className="text-gray-600 text-sm">Gross Yield</p><p className="font-bold text-lg">{result.grossYield}%</p></div>
          <div><p className="text-gray-600 text-sm">Net Yield</p><p className="font-bold text-lg">{result.netYield}%</p></div>
          <div><p className="text-gray-600 text-sm">Monthly Cash Flow</p><p className="font-bold text-lg">£{result.monthlyNetCashFlow}</p></div>
        </div>
      )}
    </div>
  );
}
