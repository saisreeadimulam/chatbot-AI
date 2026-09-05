import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();
    console.log("Received message:", message);
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // System prompt for ARGO chatbot
    const systemPrompt = `You are the Official ARGO Global Ocean Data Chatbot 🌊.

CRITICAL RULES:
1. Answer STRICTLY using ARGO ocean dataset information (temperature, salinity, pressure, depth, float locations).
2. ALWAYS provide:
   - A short educational explanation (2-3 sentences)
   - A description of what visualization would be shown (you cannot actually generate charts, but describe them)
3. For data requests, describe the appropriate chart:
   - Temperature data → "I would show a line chart of temperature vs depth"
   - Salinity data → "I would display a heatmap of salinity distribution"
   - Pressure data → "I would plot a curve of pressure vs depth"
   - Location data → "I would show a world map with float positions marked"
   - Trends → "I would create a line chart showing changes over time"
4. Always include axis labels and units in your descriptions (°C, PSU, dbar, meters, etc.)
5. If question is outside ARGO dataset, respond: "I can only answer questions based on ARGO Ocean observation data. Please ask about ocean temperature, salinity, pressure, depth, or float locations."
6. Be professional, educational, and engaging for both students and researchers.`;

    // Call Lovable AI - text response
    const textResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
      }),
    });

    if (!textResponse.ok) {
      const errorText = await textResponse.text();
      console.error("AI gateway text error:", textResponse.status, errorText);
      
      if (textResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), 
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (textResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }), 
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error("AI gateway error");
    }

    const textData = await textResponse.json();
    const responseText = textData.choices?.[0]?.message?.content || "I couldn't process that question.";
    
    console.log("AI response generated successfully");

    // Generate visualization using Nano banana model
    let imageUrl = null;
    
    // Determine if visualization is needed based on keywords
    const needsVisualization = /temperature|salinity|pressure|depth|location|trend|chart|graph|map|plot|show|visualize/i.test(message);
    
    if (needsVisualization) {
      console.log("Generating visualization...");
      
      // Create a prompt for visualization
      const vizPrompt = `Create a professional oceanographic data visualization chart showing: ${message}. 
      Style: Scientific research quality, clear axis labels, ocean blue color scheme, grid lines, data points clearly visible.
      Include title, axis labels with units (°C for temperature, PSU for salinity, dbar for pressure, meters for depth).
      Make it look like a publication-ready scientific chart with clean design.`;
      
      const vizResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image-preview",
          messages: [
            { role: "user", content: vizPrompt }
          ],
          modalities: ["image", "text"],
        }),
      });

      if (vizResponse.ok) {
        const vizData = await vizResponse.json();
        imageUrl = vizData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        console.log("Visualization generated successfully");
      } else {
        console.error("Visualization generation failed:", await vizResponse.text());
      }
    }

    return new Response(
      JSON.stringify({ 
        response: responseText,
        imageUrl: imageUrl 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    console.error("Error in argo-chat:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
