import type { Home } from '@/api/types'

/** Stable pseudo-random 0..n-1 from listing id (deterministic per home). */
function seedFromId(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i += 1) {
    h = (h * 31 + id.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

function monthlyPrincipalInterestCents(loanPrincipalDollars: number, apr: number, years: number): number {
  const principal = Math.max(0, loanPrincipalDollars)
  const monthlyRate = apr / 12
  const n = years * 12
  if (n <= 0) return 0
  if (monthlyRate <= 0) return Math.round((principal / n) * 100)
  const payment =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1)
  return Math.round(payment * 100)
}

export type MortgageEstimateMock = {
  listPriceCents: number
  downPaymentPercent: number
  downPaymentCents: number
  loanAmountCents: number
  aprPercent: number
  termYears: number
  principalInterestMonthlyCents: number
  propertyTaxMonthlyCents: number
  homeInsuranceMonthlyCents: number
  hoaMonthlyCents: number
  pmiMonthlyCents: number
  totalMonthlyCents: number
}

/**
 * Example-only mortgage breakdown (not a quote). Scales with list price; varies slightly by `home.id`.
 */
export function getMockMortgageEstimate(home: Home): MortgageEstimateMock {
  const listPriceCents = home.price_cents
  const listPrice = listPriceCents / 100
  const s = seedFromId(home.id)

  const downOptions = [20, 15, 10] as const
  const downPaymentPercent = downOptions[s % downOptions.length]!
  const downPaymentCents = Math.round((listPriceCents * downPaymentPercent) / 100)
  const loanAmountCents = listPriceCents - downPaymentCents
  const loanAmount = loanAmountCents / 100

  const aprBase = 6.25 + (s % 14) * 0.0625
  const aprPercent = Math.round(aprBase * 1000) / 1000
  const termYears = 30

  const principalInterestMonthlyCents = monthlyPrincipalInterestCents(loanAmount, aprPercent / 100, termYears)

  const effectiveTaxRateAnnual = 0.0175 + (s % 5) * 0.0004
  const propertyTaxMonthlyCents = Math.round(((listPrice * effectiveTaxRateAnnual) / 12) * 100)

  const insuranceRateAnnual = 0.0032 + (s % 4) * 0.00015
  const homeInsuranceMonthlyCents = Math.round(((listPrice * insuranceRateAnnual) / 12) * 100)

  const hoaMonthlyCents = s % 3 === 0 ? 0 : Math.round((45 + (s % 5) * 12.5) * 100)

  const pmiMonthlyCents = downPaymentPercent < 20 ? Math.round(((loanAmount * 0.005) / 12) * 100) : 0

  const totalMonthlyCents =
    principalInterestMonthlyCents +
    propertyTaxMonthlyCents +
    homeInsuranceMonthlyCents +
    hoaMonthlyCents +
    pmiMonthlyCents

  return {
    listPriceCents,
    downPaymentPercent,
    downPaymentCents,
    loanAmountCents,
    aprPercent,
    termYears,
    principalInterestMonthlyCents,
    propertyTaxMonthlyCents,
    homeInsuranceMonthlyCents,
    hoaMonthlyCents,
    pmiMonthlyCents,
    totalMonthlyCents,
  }
}

export type EnergyCostMock = {
  avgMonthlyCents: number
  summerMonthlyCents: number
  winterMonthlyCents: number
  estimatedAnnualKwh: number
  coolingPctOfBill: number
  gasMonthlyCents: number
  waterWastewaterMonthlyCents: number
}

/**
 * Example-only utility costs for Central Texas–style single-family (not a utility guarantee).
 */
export function getMockEnergyCosts(home: Home): EnergyCostMock {
  const s = seedFromId(home.id)
  const sqft = Math.max(800, home.sqft)

  const kwhPerSqftYear = 6.8 + (s % 7) * 0.35
  const estimatedAnnualKwh = Math.round(sqft * kwhPerSqftYear)

  const pricePerKwhCents = 13.2 + (s % 6) * 0.15
  const electricMonthlyBase = Math.round((estimatedAnnualKwh / 12) * pricePerKwhCents)

  const summerMultiplier = 1.28 + (s % 4) * 0.03
  const winterMultiplier = 0.82 + (s % 3) * 0.04

  const summerMonthlyCents = Math.round(electricMonthlyBase * summerMultiplier)
  const winterMonthlyCents = Math.round(electricMonthlyBase * winterMultiplier)
  const avgMonthlyCents = Math.round((summerMonthlyCents * 4 + winterMonthlyCents * 5 + electricMonthlyBase * 3) / 12)

  const coolingPctOfBill = 42 + (s % 9)
  const gasMonthlyCents = home.baths >= 2.5 && s % 2 === 0 ? Math.round((28 + (s % 5) * 4) * 100) : 0

  const waterWastewaterMonthlyCents = Math.round((52 + sqft * 0.018 + (s % 4) * 6) * 100)

  return {
    avgMonthlyCents,
    summerMonthlyCents,
    winterMonthlyCents,
    estimatedAnnualKwh,
    coolingPctOfBill,
    gasMonthlyCents,
    waterWastewaterMonthlyCents,
  }
}
