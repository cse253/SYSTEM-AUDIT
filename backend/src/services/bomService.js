/**
 * BOM & Production Variance Calculation Service
 * Formula:
 * Consumption Variance % = ((Actual Consumption - Planned Consumption) / Planned Consumption) * 100
 * Yield Variance % = ((Actual Output - Expected Output) / Expected Output) * 100
 * Variance flagged if absolute value exceeds 3.0%
 */

const round2 = (num) => Math.round((num + Number.EPSILON) * 100) / 100;

const calculateProductionVariances = ({
  expectedOutput,
  actualOutput,
  rawMaterials, // array of { material, plannedQuantity, actualQuantity, unitCost }
  packagingMaterials, // array of { material, plannedQuantity, actualQuantity, damagedQuantity, unitCost }
}) => {
  // 1. Yield Variance
  const yieldVarianceQuantity = actualOutput - expectedOutput;
  const yieldVariancePercentage = expectedOutput > 0
    ? round2(((actualOutput - expectedOutput) / expectedOutput) * 100)
    : 0;
  const isYieldFlagged = Math.abs(yieldVariancePercentage) > 3.0;

  // 2. Raw Material Consumption Variances
  let totalRawMaterialCost = 0;
  const processedRawMaterials = rawMaterials.map((rm) => {
    const planned = Number(rm.plannedQuantity);
    const actual = Number(rm.actualQuantity);
    const varianceQty = round2(actual - planned);
    const variancePct = planned > 0 ? round2(((actual - planned) / planned) * 100) : 0;
    const isFlagged = Math.abs(variancePct) > 3.0;
    const cost = round2(actual * (rm.unitCost || 0));
    totalRawMaterialCost += cost;

    return {
      material: rm.material,
      materialName: rm.materialName,
      plannedQuantity: planned,
      actualQuantity: actual,
      unit: rm.unit,
      varianceQuantity: varianceQty,
      variancePercentage: variancePct,
      isVarianceFlagged: isFlagged,
      unitCost: rm.unitCost || 0,
      totalCost: cost,
    };
  });

  // 3. Packaging Consumption & Scrap
  let totalPackagingCost = 0;
  const processedPackaging = packagingMaterials.map((pm) => {
    const planned = Number(pm.plannedQuantity);
    const actual = Number(pm.actualQuantity);
    const damaged = Number(pm.damagedQuantity || 0);
    const totalUsed = actual + damaged;
    const cost = round2(totalUsed * (pm.unitCost || 0));
    totalPackagingCost += cost;

    return {
      material: pm.material,
      materialName: pm.materialName,
      plannedQuantity: planned,
      actualQuantity: actual,
      damagedQuantity: damaged,
      totalQuantityUsed: totalUsed,
      unit: pm.unit,
      unitCost: pm.unitCost || 0,
      totalCost: cost,
    };
  });

  return {
    yieldVarianceQuantity,
    yieldVariancePercentage,
    isYieldFlagged,
    rawMaterials: processedRawMaterials,
    packagingMaterials: processedPackaging,
    totalRawMaterialCost: round2(totalRawMaterialCost),
    totalPackagingCost: round2(totalPackagingCost),
  };
};

module.exports = {
  calculateProductionVariances,
  round2,
};
