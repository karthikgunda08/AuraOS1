
// utils/vastuUtils.ts
import { Room } from '../types'; // Import Room type

export interface RoomDataForVastu {
  roomType: string;
  mainFacingDirection: string; // This can be the Room's user-defined orientation
  placementOfEntrance?: string;
  keyObjectsDescription?: string;
  calculatedArea?: number; // Added for potential use in detailed AI prompt
  planNorthDirection?: string; // Context for interpreting mainFacingDirection
}

export interface VastuComplianceReport {
  score: number; // A conceptual score, e.g., 0-100
  summary: string;
  recommendations: string[];
  warnings: string[];
}

/**
 * Generates a basic, conceptual Vastu compliance report.
 * This is a placeholder for more complex Vastu logic.
 */
export const generateBasicVastuReport = (data: RoomDataForVastu): VastuComplianceReport => {
  const report: VastuComplianceReport = {
    score: 50, // Neutral default
    summary: "Basic Vastu considerations based on provided details.",
    recommendations: [],
    warnings: [],
  };

  const roomType = data.roomType.toLowerCase();
  // Use mainFacingDirection which now represents the room's user-defined orientation
  const roomOrientation = data.mainFacingDirection.toLowerCase(); 

  // Simple illustrative logic based on room type and its orientation
  if (roomType.includes("kitchen")) {
    if (roomOrientation.includes("south-east") || roomOrientation.includes("north-west")) {
      report.score = 85;
      report.summary = "Kitchen placement (oriented " + data.mainFacingDirection + ") seems favorable.";
      report.recommendations.push("Ensure cooking stove faces East.");
    } else {
      report.score = 30;
      report.summary = "Kitchen placement (oriented " + data.mainFacingDirection + ") might need Vastu adjustments.";
      report.warnings.push(`A kitchen oriented towards ${data.mainFacingDirection} can sometimes lead to imbalances.`);
      report.recommendations.push("Align kitchen activities with Agni (fire) dominant zones like South-East if possible.");
    }
  } else if (roomType.includes("bedroom") || roomType.includes("master bedroom")) {
     if (roomOrientation.includes("south-west")) {
        report.score = 80;
        report.summary = `Master Bedroom oriented ${data.mainFacingDirection} promotes stability.`;
        report.recommendations.push("Sleep with head towards South or West.");
     } else if (roomOrientation.includes("north-east")){
        report.score = 20;
        report.summary = `Master Bedroom oriented ${data.mainFacingDirection} is generally not recommended.`;
        report.warnings.push("North-East bedrooms can affect stability. Better for prayer/study.");
     } else {
        report.summary = `Vastu for a bedroom oriented ${data.mainFacingDirection} has specific nuances.`;
     }
  }

  if (data.placementOfEntrance) { // This is still optional user input
    if (data.placementOfEntrance.toLowerCase().includes("south") && !data.placementOfEntrance.toLowerCase().includes("south-east") && !data.placementOfEntrance.toLowerCase().includes("south-west")) {
        report.warnings.push("Entrances directly from South (center) might need remedies.");
    } else if (data.placementOfEntrance.toLowerCase().includes("north-east")){
        report.recommendations.push("An entrance in the North-East is generally very auspicious.");
        if(report.score < 70) report.score +=10;
    }
  }
  
  if(!report.recommendations.length && !report.warnings.length){
    report.recommendations.push("For detailed analysis, provide object placements or consult a Vastu expert.");
  }
  
  report.score = Math.max(0, Math.min(100, report.score));
  return report; 
};


/**
 * Provides a quick Vastu indicator summary for a given Room.
 * Leverages generateBasicVastuReport for its logic.
 */
export const getVastuQuickIndicator = (room: Room, planNorthDirection: string): { summary: string; scoreConcept: number; colorHint: string } => {
  if (!room.type || !room.orientation) {
    return {
      summary: "Room type or orientation not defined for Vastu scan.",
      scoreConcept: 0,
      colorHint: 'gray',
    };
  }

  const roomDataForScan: RoomDataForVastu = {
    roomType: room.type,
    mainFacingDirection: room.orientation, // Room's own orientation
    keyObjectsDescription: room.description,
    calculatedArea: room.calculatedArea,
    planNorthDirection: planNorthDirection, // Context of the entire plan
  };

  const basicReport = generateBasicVastuReport(roomDataForScan);
  
  let colorHintClass = 'text-slate-400'; // Default
  if (basicReport.score >= 75) colorHintClass = 'text-emerald-400'; // Good
  else if (basicReport.score >= 50) colorHintClass = 'text-yellow-400'; // Okay
  else if (basicReport.score > 0) colorHintClass = 'text-red-400'; // Needs attention
  
  return {
    summary: `${basicReport.summary} (Score: ${basicReport.score}/100)`,
    scoreConcept: basicReport.score,
    colorHint: colorHintClass,
  };
};