'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { BarChart3, PlusCircle, ChevronDown, Trash2, XCircle, Wallet } from 'lucide-react';
import Navbar from '../../components/Navbar';
import { Chart as ChartJS, Title, Legend, ArcElement, CategoryScale, LinearScale } from 'chart.js';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
ChartJS.register(Title, Legend, ArcElement, CategoryScale, LinearScale);
import Link from 'next/link';

// Utility function for bank savings account
function bankSavingsTime(initial: number, yearly: number, rate: number, target: number): number {
  if (initial >= target) return 0; // If already reached, return 0 years.

  let years = 0;
  let balance = initial;
  const yearlyRate = rate / 100; // Convert annual rate to yearly rate

  while (balance < target) {
    balance *= 1 + yearlyRate; // Apply compound interest
    balance += yearly; // Add yearly contribution
    years++;

    // Prevent infinite loop
    if (years > 100) break;
  }

  return years;
}

// Utility function for compound investments (FD, Govt. Bonds, Index Funds)
function compoundInvestmentTime(initial: number, yearly: number, rate: number, target: number): number {
  if (initial >= target) return 0; // Already reached

  let years = 0;
  let balance = initial;
  const yearlyRate = rate / 100; // Convert annual rate to yearly rate

  while (balance < target) {
    balance *= 1 + yearlyRate; // Apply compound interest
    balance += yearly; // Add yearly deposit
    years++;

    if (years > 100) break; // Prevent infinite loops
  }

  return years;
}

export default function BudgetManager() {
  const [income, setIncome] = useState('');
  const [categories, setCategories] = useState([{ name: '', amount: '', recurring: false }]);
  const [savingsGoal, setSavingsGoal] = useState('');
  const [showRecurringExpenses, setShowRecurringExpenses] = useState(false);
  const [nextMonthExpenses, setNextMonthExpenses] = useState([]);

  // Load data from localStorage when the component mounts
  useEffect(() => {
    const storedIncome = localStorage.getItem('income');
    const storedCategories = localStorage.getItem('categories');
    const storedSavingsGoal = localStorage.getItem('savingsGoal');
    const storedNextMonthExpenses = localStorage.getItem('nextMonthExpenses');

    if (storedIncome) setIncome(storedIncome);
    if (storedCategories) setCategories(JSON.parse(storedCategories));
    if (storedSavingsGoal) setSavingsGoal(storedSavingsGoal);
    if (storedNextMonthExpenses) setNextMonthExpenses(JSON.parse(storedNextMonthExpenses));
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('income', income);
  }, [income]);

  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('savingsGoal', savingsGoal);
  }, [savingsGoal]);

  useEffect(() => {
    localStorage.setItem('nextMonthExpenses', JSON.stringify(nextMonthExpenses));
  }, [nextMonthExpenses]);

  const handleCategoryChange = (index, field, value) => {
    const updatedCategories = [...categories];
    updatedCategories[index][field] = value;
    setCategories(updatedCategories);

    if (field === 'recurring' && value) {
      setNextMonthExpenses([...nextMonthExpenses, updatedCategories[index]]);
    }
  };

  const addCategory = () => {
    setCategories([...categories, { name: '', amount: '', recurring: false }]);
  };

  const removeCategory = (index) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  const removeNextMonthExpense = (index) => {
    setNextMonthExpenses(nextMonthExpenses.filter((_, i) => i !== index));
  };

  const totalExpenses = categories.reduce((acc, cat) => acc + Number(cat.amount || 0), 0);
  const remainingBudget = Number(income) - totalExpenses;
  const nextMonthFixedExpenses = nextMonthExpenses.reduce((acc, exp) => acc + Number(exp.amount || 0), 0);

  // Convert monthly values to yearly values
  const yearlyIncome = Number(income) * 12;
  const yearlyExpenses = totalExpenses * 12;
  const yearlyRemainingBudget = remainingBudget * 12;

  const yearsToGoal = savingsGoal && yearlyRemainingBudget > 0 ? (savingsGoal / yearlyRemainingBudget) : 'N/A';
  const bankSavingsYears = savingsGoal && yearlyRemainingBudget > 0 ? bankSavingsTime(0, yearlyRemainingBudget, 2, savingsGoal) : 'N/A';
  const fdYears = savingsGoal && yearlyRemainingBudget > 0 ? compoundInvestmentTime(0, yearlyRemainingBudget, 6, savingsGoal) : 'N/A';
  const govtYears = savingsGoal && yearlyRemainingBudget > 0 ? compoundInvestmentTime(0, yearlyRemainingBudget, 9, savingsGoal) : 'N/A';
  const indexYears = savingsGoal && yearlyRemainingBudget > 0 ? compoundInvestmentTime(0, yearlyRemainingBudget, 13, savingsGoal) : 'N/A';

  const budgetData = [
    { name: 'Default', years: yearsToGoal },
    { name: 'Bank Savings', years: bankSavingsYears },
    { name: 'Fixed Deposit', years: fdYears },
    { name: 'Govt Investment', years: govtYears },
    { name: 'Index Investment', years: indexYears },
  ];

  const categoryLabels = categories.map((cat) => cat.name);
  const categoryAmounts = categories.map((cat) => Number(cat.amount || 0));
  const categoryBudget = categories.map((cat) => 0);

  const pieData = useMemo(
    () => ({
      labels: categoryLabels,
      datasets: [
        {
          label: 'Expenses Distribution',
          data: categoryAmounts,
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#FF9F40'],
          borderColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#FF9F40'],
          borderWidth: 1,
        },
        {
          label: 'Budget Distribution',
          data: categoryBudget,
          backgroundColor: ['#FF7373', '#5BC0EB', '#FFD166', '#6B8B3A', '#FF6A13'],
          borderColor: ['#FF7373', '#5BC0EB', '#FFD166', '#6B8B3A', '#FF6A13'],
          borderWidth: 1,
        },
      ],
    }),
    [categoryLabels, categoryAmounts, categoryBudget]
  );

  return (
    <>
      <Navbar />
      <div className="container py-8 bg-blue-50 text-gray-90">
        <div className="flex items-center space-x-2 mb-6">
          <BarChart3 className="h-6 w-6 text-blue-700" />
          <h1 className="text-2xl font-bold text-blue-800">Budget Manager</h1>
        </div>

        <Card className="p-6 mb-6 shadow-lg rounded-lg border border-blue-200">
          <h2 className="text-lg font-semibold mb-4">Enter Your Monthly Details</h2>

          <Label htmlFor="income" className="font-medium text-black">
            Monthly Income
          </Label>
          <Input
            id="income"
            type="number"
            value={income}
            onChange={(e) => setIncome(e.target.value < 1 ? '' : e.target.value)}
            placeholder="Enter your income"
            className="mb-4 bg-white"
          />

          <h3 className="mt-4 font-semibold text-black">Expenses</h3>
          <div className="flex flex-wrap gap-4">
            {categories.map((category, index) => (
              <div key={index} className="w-full md:w-1/3 lg:w-1/4 p-4 border rounded-lg bg-gray-50 relative">
                <h4 className="font-medium">{index + 1}. Expense Category</h4>
                <Label className="mt-2">Category Type</Label>
                <select
                  className="w-full border rounded p-2"
                  value={category.name}
                  onChange={(e) => handleCategoryChange(index, 'name', e.target.value)}
                >
                  <option value="">Select Type</option>
                  <option value="Rent">Rent</option>
                  <option value="Food, Travel & Bills">Food, Travel & Bills</option>
                  <option value="Lifestyle">Lifestyle</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Loan">Loan</option>
                  <option value="EMI">EMI</option>
                </select>
                <Label className="mt-2">Amount</Label>
                <Input
                  type="number"
                  value={category.amount}
                  onChange={(e) => handleCategoryChange(index, 'amount', e.target.value)}
                  placeholder="Enter amount"
                />
                <div className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    checked={category.recurring}
                    onChange={() => handleCategoryChange(index, 'recurring', !category.recurring)}
                    className="mr-2"
                  />
                  <Label>Recurring</Label>
                </div>
                <button onClick={() => removeCategory(index)} className="absolute top-2 right-2 text-red-500">
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
          <Button onClick={addCategory} className="mt-2">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Category
          </Button>
        </Card>

        <Card className="p-6 mb-6 shadow-lg rounded-lg border border-gray-200">
          <h3 className="font-semibold">Savings Goal</h3>
          <Label htmlFor="savingsGoal">Target Amount</Label>
          <Input
            id="savingsGoal"
            type="number"
            value={savingsGoal}
            onChange={(e) => setSavingsGoal(e.target.value)}
            placeholder="Enter your savings goal"
          />
          <Link href={`/investments?monthlyInvestment=${remainingBudget}`} className="mt-4 inline-block">
            <Button className="w-full bg-blue-300 hover:bg-blue-500">
              <Wallet className="mr-2 h-4 w-4" />
              Optimize Investments with Remaining Budget
            </Button>
          </Link>
        </Card>

        <Card className="p-6 shadow-lg rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Budget Summary</h2>

          <div className="flex justify-between text-sm">
            <span>Total Expenses:</span>
            <span className="font-semibold">₹{totalExpenses.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Remaining Budget:</span>
            <span className={`font-semibold ${remainingBudget < 0 ? 'text-red-500' : 'text-green-500'}`}>
              ₹{remainingBudget.toLocaleString()}
            </span>
          </div>

          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgetData} layout="vertical">
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip />
                <Bar dataKey="years" fill="#4A90E2" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4">
            <Button onClick={() => setShowRecurringExpenses(!showRecurringExpenses)}>
              Next Month Fixed Expenses ₹{nextMonthFixedExpenses} <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
            {showRecurringExpenses && (
              <ul className="mt-2 border p-2 rounded bg-gray-100">
                {nextMonthExpenses.map((exp, index) => (
                  <li key={index} className="flex justify-between items-center">
                    {exp.name}: ₹{exp.amount}
                    <button onClick={() => removeNextMonthExpense(index)} className="text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Progress value={(totalExpenses / (Number(income) || 1)) * 100} className="mt-4" />
        </Card>

        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
       {/* Actual Expenses and Savings Pie Chart */}
       <Card className="p-6 bg-white shadow-md rounded-lg">
  <h2 className="text-lg font-medium mb-4 text-gray-900">Actual Expenses and Savings</h2>
  <div className="flex flex-col md:flex-row items-center gap-6">
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={useMemo(
            () => [
              { name: 'Rent', value: Number(categories.find((cat) => cat.name === 'Rent')?.amount || 0) },
              { name: 'Food, Travel & Bills', value: Number(categories.find((cat) => cat.name === 'Food, Travel & Bills')?.amount || 0) },
              { name: 'Loan', value: Number(categories.find((cat) => cat.name === 'Loan')?.amount || 0) },
              { name: 'EMI', value: Number(categories.find((cat) => cat.name === 'EMI')?.amount || 0) },
              { name: 'Lifestyle', value: Number(categories.find((cat) => cat.name === 'Lifestyle')?.amount || 0) },
              { name: 'Entertainment', value: Number(categories.find((cat) => cat.name === 'Entertainment')?.amount || 0) },
              { name: 'Savings', value: remainingBudget > 0 ? remainingBudget : 0 },
            ],
            [categories, remainingBudget] // Recalculate when categories or remainingBudget changes
          )}
          dataKey="value"
          cx="50%"
          cy="50%"
          label
          outerRadius={100}
        >
          {['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#FF9F40', '#FF7373', '#5BC0EB'].map((color, index) => (
            <Cell key={`cell-${index}`} fill={color} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>

    {/* Legend for Actual Expenses and Savings */}
    <div className="space-y-2">
      {[
        { name: 'Rent', color: '#FF6384' },
        { name: 'Food, Travel & Bills', color: '#36A2EB' },
        { name: 'Loan', color: '#FFCE56' },
        { name: 'EMI', color: '#4BC0C0' },
        { name: 'Lifestyle', color: '#FF9F40' },
        { name: 'Entertainment', color: '#FF7373' },
        { name: 'Savings', color: '#5BC0EB' },
      ].map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
          <span className="text-sm text-gray-700">{item.name}</span>
        </div>
      ))}
    </div>
  </div>
</Card>

  {/* Recommended Budget Allocation Pie Chart */}
  <Card className="p-6 bg-white shadow-md rounded-lg">
    <h2 className="text-lg font-medium mb-4 text-gray-900">Recommended Budget Allocation</h2>
    <div className="flex flex-col md:flex-row items-center gap-6">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={[
              { name: 'Rent, Food, Travel, Loan, EMI', value: 0.5 * Number(income) },
              { name: 'Lifestyle, Entertainment', value: 0.3 * Number(income) },
              { name: 'Savings', value: 0.2 * Number(income) },
            ]}
            dataKey="value"
            cx="50%"
            cy="50%"
            label
            outerRadius={100}
          >
            {['#8884d8', '#82ca9d', '#ffc658'].map((color, index) => (
              <Cell key={`cell-${index}`} fill={color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend for Recommended Budget Allocation */}
      <div className="space-y-2">
        {[
          { name: 'Rent, Food, Travel, Loan, EMI', color: '#8884d8' },
          { name: 'Lifestyle, Entertainment', color: '#82ca9d' },
          { name: 'Savings', color: '#ffc658' },
        ].map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-sm text-gray-700">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  </Card>
</div>
      </div>
    </>
  );
}