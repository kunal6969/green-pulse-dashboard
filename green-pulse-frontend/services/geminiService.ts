import { GoogleGenAI } from "@google/genai";
// FIX: Imported EnergyDataPoint to be used in the new streamChatResponse function.
import { ReportSummary, EnergyDataPoint } from '../types';

const createReportSummaryPrompt = (summary: ReportSummary): string => {
  return `
**Energy Performance Report Summary:**
- Building ID: ${summary.buildingId}
- Period: ${summary.startDate} to ${summary.endDate}
- Total Actual Consumption: ${summary.totalActualKwh.toFixed(1)} kWh
- Total Predicted Consumption: ${summary.totalPredictedKwh.toFixed(1)} kWh
- Net Savings: ${summary.netSavingsKwh.toFixed(1)} kWh (${summary.netSavingsKwh >= 0 ? 'Savings' : 'Over-consumption'})
- Peak Consumption: ${summary.peakConsumption.value.toFixed(1)} kWh (on ${summary.peakConsumption.time})
- Lowest Consumption: ${summary.lowestConsumption.value.toFixed(1)} kWh (on ${summary.lowestConsumption.time})
- Anomalies Detected (>20% deviation): ${summary.anomalyCount}
`;
};

/**
 * Generates a professional energy report consultation from a data summary.
 * @param summary The statistical summary of the energy data for the report period.
 * @returns A promise that resolves to the AI-generated consultation text.
 */
export const generateReportConsultation = async (summary: ReportSummary): Promise<string> => {
    if (!process.env.API_KEY) {
        console.error("API_KEY environment variable not set.");
        return "AI consultation is unavailable: API key is not configured.";
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const dataSummaryPrompt = createReportSummaryPrompt(summary);
    
    const systemInstruction = `You are GreenPulse AI, an expert energy consultant. Your task is to analyze the provided energy performance summary and generate a professional, actionable report for a facility manager.

**Structure your response in the following format using markdown:**

### 1. Executive Summary
Provide a brief, high-level overview of the building's performance during the specified period. State clearly whether the building performed efficiently (savings) or inefficiently (over-consumption).

### 2. Key Observations
- Analyze the total consumption vs. prediction. Explain what the net savings or overage means.
- Comment on the peak and lowest consumption points. Are they expected? Do they suggest opportunities?
- Discuss the number of anomalies. If high, express concern and suggest investigation. If low or zero, commend the stability.

### 3. Actionable Recommendations
- Based on your observations, provide 2-3 specific, practical recommendations.
- For example, if savings are negative (over-consumption), suggest investigating HVAC schedules or lighting during peak hours. If anomalies are frequent, recommend equipment diagnostics.
- Keep the recommendations targeted and easy to understand.

**Tone:** Professional, data-driven, and supportive. The goal is to empower the facility manager to make improvements.

**Data Summary to Analyze:**
${dataSummaryPrompt}
`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "Please generate the energy report analysis based on the provided data summary.",
        config: {
            systemInstruction: systemInstruction,
        }
    });

    return response.text;
};

// FIX: Added streamChatResponse function to power the chatbot widget.
const createDataSummaryForChat = (buildingId: number, buildingData: EnergyDataPoint[]): string => {
    if (buildingData.length === 0) {
        return `There is no energy data available for Building ID: ${buildingId}.`;
    }
    const latestPoint = buildingData[buildingData.length - 1];
    const summary = `
Current context for Building ID: ${buildingId}.
- The latest available data point is from: ${latestPoint.historical?.toLocaleString()}.
- Latest Actual Consumption: ${latestPoint.actual?.toFixed(1)} kWh.
- Latest Predicted Consumption: ${latestPoint.predicted?.toFixed(1)} kWh.
- The full historical dataset for the last few hours/days is also available if I need to analyze trends.
    `;
    return summary.trim();
};

/**
 * Generates a streaming chat response from the Gemini API based on a prompt and building data context.
 * @param prompt The user's message.
 * @param buildingId The ID of the building in context.
 * @param buildingData The energy data for the building.
 * @returns An async generator that yields text chunks of the AI's response.
 */
export async function* streamChatResponse(prompt: string, buildingId: number, buildingData: EnergyDataPoint[]): AsyncGenerator<string> {
    if (!process.env.API_KEY) {
        console.error("API_KEY environment variable not set.");
        yield "AI is unavailable: API key is not configured.";
        return;
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const dataSummary = createDataSummaryForChat(buildingId, buildingData);

        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: `You are GreenPulse AI, an expert energy consultant assistant for a facility manager.
                You are analyzing data for Building ID ${buildingId}.
                Use the provided data summary to answer questions. Be concise and helpful.
                Analyze trends, identify anomalies (significant deviation between actual and predicted usage), and offer actionable advice.
                When asked for summaries or analyses, refer to the data context.

                Current Data Summary:
                ${dataSummary}`,
            },
        });

        const responseStream = await chat.sendMessageStream({ message: prompt });

        for await (const chunk of responseStream) {
            yield chunk.text;
        }
    } catch (error) {
        console.error("Error streaming chat response:", error);
        yield "Sorry, I encountered an error while trying to respond.";
    }
}
