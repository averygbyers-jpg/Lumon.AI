import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json({ limit: "50mb" }));
app.use(express.static(__dirname));

// NEW: Add CORS headers for development
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

function calculateCompletenessScore(message, history) {
  let score = 0;
  const words = message.trim().split(/\s+/).length;
  
  // Word count scoring (0-40 points)
  if (words >= 30) score += 40;
  else if (words >= 20) score += 30;
  else if (words >= 10) score += 20;
  else score += 10;
  
  // Specificity markers (0-30 points)
  const specificityMarkers = [
    /brand|model|version|type|year/i,
    /symptom|problem|issue|error|warning/i,
    /when|where|how|what|why/i,
    /\d+/  // Contains numbers
  ];
  specificityMarkers.forEach(pattern => {
    if (pattern.test(message)) score += 7.5;
  });
  
  // Conversation depth (0-30 points)
  const userMessages = history.filter(m => m.role === "user").length;
  if (userMessages >= 3) score += 30;
  else if (userMessages === 2) score += 20;
  else if (userMessages === 1) score += 10;
  
  return Math.min(100, score);
}
function safeJsonParse(maybeText) {
  try {
    return JSON.parse(maybeText);
  } catch {
    return null;
  }
}

// -------------------------
// Chat completion endpoint
// -------------------------
app.post("/api/chat", async (req, res) => {
  try {
    console.log("📨 /api/chat received request");
    console.log("Request body keys:", Object.keys(req.body || {}));
    
    const {
      message,
      history = [],
      profile = {},
      prefs = {},
      session = {},
      ui = {},
      extendedCustomizations = {},
      attachments = [],
      formattingInstructions = "",
      systematicApproach = "",
    } = req.body || {};

    if ((!message || typeof message !== "string") && (!Array.isArray(attachments) || attachments.length === 0)) {
      console.error("❌ Missing message and attachments");
      return res.status(400).json({ error: "Missing 'message' or 'attachments' in body." });
    }

    console.log("✅ Message received:", message ? message.substring(0, 50) : "(image only)");
    console.log("📎 Attachments:", attachments.length > 0 ? `${attachments.length} file(s)` : "none");

    const name = profile.name || "";
    const goal = profile.goal || "";
    const experience = profile.experience || "beginner";
    const uniqueness = prefs.uniqueness || "balanced";
    const memories = req.body.memories || []; // Cross-conversation memories

    const problemTitle = session.problemTitle || "";
    const whyItMatters = session.whyItMatters || "";
    const timeHorizon = session.timeHorizon || "";
    const confidenceLevel = session.confidenceLevel || "beginner";

    let temperature = 0.7;
    if (uniqueness === "safe") {
      temperature = 0.3;
    } else if (uniqueness === "bold" || uniqueness === "unique") {
      temperature = 0.9;
    }

    const teachingStyle =
      experience === "beginner"
        ? "Explain things step by step with concrete examples."
        : experience === "advanced"
        ? "Be concise, move faster, and skip obvious basics unless asked."
        : "Be clear and structured without over-explaining.";

    const sessionSummary = problemTitle
      ? `Session focus: ${problemTitle}\nWhy it matters: ${whyItMatters || "not specified"}`
      : `No specific problem defined yet.`;

    const memoriesContext = memories && memories.length > 0
      ? `\nThings I know about you:\n${memories.map((m) => `- ${typeof m === "string" ? m : m.fact}`).join("\n")}`
      : "";

    const systemPrompt = `You are Lumon, a helpful AI assistant.
Keep responses under 300 words.
Be conversational and helpful.

User: ${name || "Friend"}
Experience level: ${experience}
Teaching style: ${teachingStyle}

${sessionSummary}${memoriesContext}${formattingInstructions ? "\n\n" + formattingInstructions : ""}${systematicApproach ? "\n\n" + systematicApproach : ""}`;

    console.log("🔄 Calling OpenAI with model: gpt-4o-mini");
    console.log("🌡️ Temperature:", temperature);

    const mappedHistory = (Array.isArray(history) ? history : [])
      .slice(-12)
      .map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content || "",
      }));

    // Build the user message with images
    let userMessageContent = message || "What is this?"; // Default prompt if only image sent
    
    if (Array.isArray(attachments) && attachments.length > 0) {
      // Build message with vision content
      const contentArray = [{ type: "text", text: message || "What is this?" }];
      
      attachments.forEach((att) => {
        if (att.type === "image" && att.data) {
          // Extract base64 data and MIME type from data URL
          // Format: "data:image/png;base64,iVBORw0KGgo..."
          const dataUrl = att.data;
          const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
          
          if (matches) {
            const mimeType = matches[1]; // e.g., "image/png"
            const base64Data = matches[2]; // The actual base64 content
            
            contentArray.push({
              type: "image_url",
              image_url: {
                url: dataUrl, // OpenAI accepts the full data URL
              },
            });
            console.log(`📸 Included image (${mimeType})`);
          }
        }
      });
      
      userMessageContent = contentArray;
    }

    let response;
    try {
      const messages = [
        { role: "system", content: systemPrompt },
        ...mappedHistory,
        { role: "user", content: userMessageContent },
      ];
      
      response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature,
        max_tokens: 2000,
        messages,
      });
      console.log("✅ OpenAI responded successfully");
    } catch (apiErr) {
      console.error("❌ OpenAI API error:");
      console.error("  Status:", apiErr.status);
      console.error("  Message:", apiErr.message);
      console.error("  Code:", apiErr.code);
      throw apiErr;
    }

    const text = response.choices?.[0]?.message?.content || "";
    console.log("🔍 Raw response (first 200 chars):", text.substring(0, 200));

    if (!text) {
      console.warn("⚠️ Empty response from OpenAI");
      return res.json({
        reply: "I'm having trouble generating a response. Please try again.",
      });
    }

    // NEW: Analyze if response contains options/suggestions the user should pick from
    // Look for patterns like bullet lists, numbered lists, or enumerated items
    const hasOptions = 
      /^[\s]*[-•*]\s+/m.test(text) ||  // bullet points
      /^[\s]*\d+[\.)]\s+/m.test(text) || // numbered list
      /\b(?:options?|choose|select|pick|here are|try|consider):/i.test(text); // explicit mention

    let quickPickOptions = [];
    if (hasOptions) {
      // Extract option items from the response
      const bulletMatches = text.match(/^[\s]*[-•*]\s+(.+?)(?=\n|$)/gm);
      const numberedMatches = text.match(/^[\s]*\d+[\.)]\s+(.+?)(?=\n|$)/gm);
      
      const matches = bulletMatches || numberedMatches || [];
      
      quickPickOptions = matches
        .slice(0, 8) // limit to 8 options max
        .map(line => {
          return line
            .replace(/^[\s]*[-•*]\s+/, '') // remove bullet
            .replace(/^[\s]*\d+[\.)]\s+/, '') // remove number
            .trim();
        })
        .filter(opt => {
          // Exclude questions (ending with ?)
          if (/\?$/.test(opt)) return false;
          // Keep only reasonable length options
          return opt.length > 0 && opt.length < 60;
        }); // Filter out questions and unreasonable lengths
      
      console.log("✅ Extracted quick pick options:", quickPickOptions);
    }

    res.json({
      reply: text,
      options: quickPickOptions.length > 0 ? quickPickOptions : undefined,
    });

  } catch (err) {
    console.error("❌ Chat endpoint error:", err?.message || err);
    res.status(500).json({
      error: "Failed to process chat request",
      detail: err?.message || "Unknown error",
    });
  }
});

// -------------------------
// Image generation endpoint
// -------------------------
app.post("/api/image", async (req, res) => {
  try {
    const { prompt } = req.body || {};
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Missing 'prompt' in body." });
    }

    const image = await openai.images.generate({
      model: "gpt-image-1",
      prompt,
      size: "1024x1024",
    });

    const imageUrl = image.data?.[0]?.url;
    if (!imageUrl) {
      throw new Error("No image URL returned from OpenAI.");
    }

    res.json({ imageUrl });
  } catch (err) {
    console.error(
      "OpenAI image error:",
      err?.status,
      err?.message,
      err?.response?.data
    );
    res.status(500).json({
      error: err?.message || "Failed to generate image.",
      detail: err?.response?.data || null,
    });
  }
});

// NEW: Generate User Input Coach suggestions (buttons above input bar)
app.post("/api/coaching/suggestions", async (req, res) => {
  try {
    console.log("📨 /api/coaching/suggestions received request");
    console.log("Request body:", JSON.stringify(req.body).substring(0, 200));
    
    const { message, history = [], topic = "" } = req.body || {};

    if (!message || typeof message !== "string") {
      console.error("❌ Missing message");
      return res.status(400).json({ error: "Missing 'message'" });
    }

    console.log("✅ Message received:", message.substring(0, 50));

    const systemPrompt = `You are a detail-gathering assistant. Based on the user's vague problem, generate 4-8 SHORT button labels that represent specific areas, components, or aspects they might clarify.

Example:
User says: "broken tractor"
You respond with buttons like: ["mower deck", "steering wheel", "tires", "engine", "transmission", "brakes", "seat belt"]

User says: "my car won't start"
Buttons: ["battery", "starter motor", "fuel pump", "ignition switch", "engine lights", "battery terminals"]

Generate ONLY button labels (2-4 words max each). Return as JSON array.

Topic context: ${topic || "general problem"}
User message: "${message.replace(/"/g, '\\"')}"`;

    const mappedHistory = (Array.isArray(history) ? history : [])
      .slice(-12)
      .map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content || "",
      }));

    // For suggestion generation, we use a fixed low temperature for more deterministic output
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      messages: [
        { role: "system", content: systemPrompt },
        ...mappedHistory,
        { role: "user", content: message },
      ],
    });

    const text = response.choices?.[0]?.message?.content || "";
    const buttons = safeJsonParse(text) || [];

    console.log("✅ Suggestions generated:", buttons);

    res.json({ buttons });
  } catch (err) {
    console.error(
      "OpenAI coaching suggestions error:",
      err?.status,
      err?.message,
      err?.response?.data
    );    res.status(500).json({
      error: err?.message || "Failed to generate suggestions.",
      detail: err?.response?.data || null,
    });
  }
});

// NEW: Generate smart sentence from button selections
app.post("/api/coaching/build-sentence", async (req, res) => {
  try {
    console.log("📨 /api/coaching/build-sentence received request");
    
    const { buttons = [], topic = "", original = "" } = req.body || {};

    if (!Array.isArray(buttons) || buttons.length === 0) {
      console.error("❌ Missing buttons array");
      return res.status(400).json({ error: "Missing buttons array" });
    }

    console.log("✅ Buttons received:", buttons);

    const systemPrompt = `You are a sentence-building assistant. Convert the user's selected button labels into a single, grammatically correct sentence that they could ask an expert for help.

Selected areas/components: ${buttons.join(", ")}
Original message: "${original || "problem statement"}"
Topic: ${topic || "general"}

Generate ONE clear, professional sentence (15-40 words) that naturally combines these elements into a question or problem statement.
Do NOT include "I have" or "I am having trouble with" - start directly with relevant context or make it conversational.

Return ONLY the sentence, no quotes, no extra text.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.6,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Build a sentence from these: ${buttons.join(", ")}` },
      ],
    });

    const sentence = (response.choices?.[0]?.message?.content || "").trim();

    console.log("✅ Generated sentence:", sentence);

    if (!sentence) {
      const fallback = buttons.join(" and ") + " are giving me problems.";
      console.log("⚠️ Using fallback sentence:", fallback);
      return res.json({ sentence: fallback });
    }

    res.json({ sentence });
  } catch (err) {
    console.error("❌ Sentence builder error:", err?.message);
    res.status(500).json({
      error: err?.message || "Failed to build sentence.",
      detail: err?.response?.data || null,
    });
  }
});

// NEW: Generate Quick Picks suggestions (clickable options bar above input)
app.post("/api/quick-picks", async (req, res) => {
  try {
    console.log("📨 /api/quick-picks received request");
    
    const { message, history = [], topic = "" } = req.body || {};

    if (!message || typeof message !== "string") {
      console.error("❌ Missing message");
      return res.status(400).json({ error: "Missing 'message'" });
    }

    console.log("✅ Message received:", message.substring(0, 50));

    const systemPrompt = `You are an intelligent conversation guide. Based on the user's message, generate 5 SHORT, CLEAN button labels that represent the TOP-LEVEL main options they might choose.

IMPORTANT RULES:
1. Generate EXACTLY 5 options (no more, no less)
2. Each option should be 2-5 words maximum, clear and actionable
3. Options should be BROAD categories (A, B, C level) NOT detailed sub-options
4. NO markdown, asterisks, special characters, or formatting
5. NO numbered lists in the response - just the clean array
6. Each option must be a natural, standalone choice
7. Return ONLY a JSON array: ["option1", "option2", "option3", "option4", "option5"]

Examples that are CORRECT:
Input: "My lawn mower won't start"
Output: ["John Deere", "Craftsman", "Toro", "Husqvarna", "Something else"]

Input: "I need help fixing my car"
Output: ["Engine problem", "Electrical issue", "Brake problem", "Transmission issue", "Something else"]

Input: "${message.replace(/"/g, '\\"')}"

Return ONLY the JSON array, nothing else.`;

    const mappedHistory = (Array.isArray(history) ? history : [])
      .slice(-8)
      .map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content || "",
      }));

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.5,
      messages: [
        { role: "system", content: systemPrompt },
        ...mappedHistory,
        { role: "user", content: message },
      ],
    });

    const text = response.choices?.[0]?.message?.content || "";
    const options = safeJsonParse(text) || [];

    console.log("✅ Quick picks generated:", options);

    res.json({ options });
  } catch (err) {
    console.error(
      "OpenAI quick picks error:",
      err?.status,
      err?.message,
      err?.response?.data
    );
    res.status(500).json({
      error: err?.message || "Failed to generate quick picks.",
      detail: err?.response?.data || null,
    });
  }
});

// NEW: Prompt Coach Suggestions endpoint
app.post("/api/prompt-coach", async (req, res) => {
  try {
    console.log("📨 /api/prompt-coach received request");
    
    const { message = "", history = [], conversationDepth = 0, strictnessLevel = 0.5, lastUpdateDepth = 0 } = req.body || {};

    // Analyze conversation state
    const userMessages = (Array.isArray(history) ? history : []).filter(m => m.role === "user");
    const messageLength = (message || "").trim().length;
    const isVague = messageLength < 20 || /^[a-z]$|^yes|^no|^ok|^help|^what/i.test(message);
    const conversationCount = userMessages.length;
    
    // DECIDE WHETHER TO UPDATE SUGGESTIONS
    // Update if: conversation has advanced significantly (depth change > 1), or context changed substantially
    const depthChange = conversationDepth - lastUpdateDepth;
    const shouldUpdate = depthChange > 1 || conversationCount <= 1;
    
    if (!shouldUpdate && conversationCount > 1) {
      console.log("✅ Suggestions still fresh, skipping update");
      return res.json({ 
        suggestions: [],
        shouldUpdate: false,
        shouldAutoOpen: false
      });
    }
    
    // Determine which suggestion set to use based on context
    let statementsPrompt = "";
    let questionsPrompt = "";
    
    if (conversationCount === 0) {
      // First message - help them articulate their problem
      statementsPrompt = `Generate 5-6 SHORT sentence starters (2-4 words max) to help someone describe their initial problem. These should be natural statement beginnings.
      
Examples: "My problem is", "I'm struggling with", "My goal is", "I'm trying to", "The problem is", "I need help with"

Return ONLY a JSON array of sentence starters, no descriptions.`;

      questionsPrompt = `Generate 4-5 SHORT open questions (3-8 words max) that help someone clarify their initial problem or goal. These should be probing but not intrusive.
      
Examples: "What problem are you trying to solve?", "What's your main goal right now?", "What area do you need help with?", "What's holding you back?"

Return ONLY a JSON array of questions, no descriptions.`;

    } else if (conversationCount < 3) {
      // Early conversation - deepen the problem description
      statementsPrompt = `Generate 5-6 SHORT sentence starters (2-4 words max) to help add context and depth. These should feel like natural continuations.
      
Examples: "I'm struggling with", "What I mean is", "My problem is", "More specifically", "The real issue", "For context"

Return ONLY a JSON array of sentence starters, no descriptions.`;

      questionsPrompt = `Generate 4-5 SHORT clarifying questions (3-8 words max) based on what the user said so far.
      
Examples: "Can you give me an example?", "What have you already tried?", "How long has this been happening?", "What's the biggest challenge?"

Return ONLY a JSON array of questions, no descriptions.`;

    } else {
      // Ongoing conversation - help progress toward solution
      statementsPrompt = `Generate 5-6 SHORT sentence starters (2-4 words max) that move toward solutions or deeper understanding.
      
Examples: "My problem is", "I'm struggling with", "I've already tried", "The obstacle is", "What would help", "One thing I"

Return ONLY a JSON array of sentence starters, no descriptions.`;

      questionsPrompt = `Generate 4-5 SHORT strategic questions (3-8 words max) that probe deeper into potential solutions or obstacles.
      
Examples: "What's your biggest obstacle right now?", "Have you considered trying...?", "What would success look like?", "What resources do you have?"

Return ONLY a JSON array of questions, no descriptions.`;
    }

    const mappedHistory = (Array.isArray(history) ? history : [])
      .slice(-6)
      .map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content || "",
      }));

    // Generate both statements and questions in parallel
    const [statementsRes, questionsRes] = await Promise.all([
      openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.6,
        messages: [
          { role: "system", content: statementsPrompt },
          ...mappedHistory,
        ],
      }),
      openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.6,
        messages: [
          { role: "system", content: questionsPrompt },
          ...mappedHistory,
        ],
      })
    ]);

    const statementsText = statementsRes.choices?.[0]?.message?.content || "";
    const questionsText = questionsRes.choices?.[0]?.message?.content || "";
    
    const statements = safeJsonParse(statementsText) || [];
    const questions = safeJsonParse(questionsText) || [];
    
    // Filter and clean
    const cleanStatements = statements
      .filter(s => s && typeof s === 'string' && s.length > 0)
      .map(s => s.replace(/[*_]/g, '').trim())
      .slice(0, 6);

    const cleanQuestions = questions
      .filter(q => q && typeof q === 'string' && q.length > 0)
      .map(q => q.replace(/[*_]/g, '').trim())
      .slice(0, 5);

    // Faster strictness progression: reaches stricter levels much quicker
    // Formula: 0.3 + (interactions * 0.025) means 0.5 after 8, 0.7 after 16, 0.9 after 24
    const adjustedStrictness = Math.min(1, 0.3 + (conversationCount * 0.025));
    const shouldAutoOpen = isVague && adjustedStrictness > (0.2 + conversationCount * 0.08);
    
    console.log("✅ Prompt coach generated:", cleanStatements.length, "statements +", cleanQuestions.length, "questions | autoOpen:", shouldAutoOpen);

    res.json({ 
      statements: cleanStatements,
      questions: cleanQuestions,
      shouldAutoOpen,
      shouldUpdate: true,
      isVague,
      conversationDepth: conversationCount
    });
  } catch (err) {
    console.error("❌ Prompt coach error:", err?.status, err?.message);
    res.status(500).json({
      error: err?.message || "Failed to generate suggestions.",
      statements: [],
      questions: [],
      shouldAutoOpen: false,
      shouldUpdate: false
    });
  }
});

// NEW: Transform Question to Statement endpoint
app.post("/api/transform-question", async (req, res) => {
  try {
    const { question = "", userMessage = "" } = req.body || {};

    if (!question) {
      return res.status(400).json({ error: "Missing question" });
    }

    const systemPrompt = `You are a conversation guide. Transform a question into an incomplete statement starter that prompts the user to complete it.

The statement should:
1. Echo/acknowledge the question
2. Be a natural sentence starter (4-8 words max)
3. END WITH A SPACE - leave the completion open for the user
4. Use first person ("I", "My", "This", "The")
5. NOT complete the answer - just guide toward it

Examples:
Question: "Is your lawn mower a push mower or riding mower?"
Statement: "My lawn mower is a "

Question: "What have you already tried?"
Statement: "I've already tried "

Question: "How long has this been happening?"
Statement: "This has been happening for "

Question: "What's your main goal?"
Statement: "My main goal is "

Question: "${question.replace(/"/g, '\\"')}"

Return ONLY the incomplete statement with trailing space, nothing else.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.5,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage || "help" },
      ],
    });

    let statement = (response.choices?.[0]?.message?.content || "").trim();

    if (!statement) {
      return res.json({ statement: question });
    }
    
    // Ensure it ends with a space for user input
    if (!statement.endsWith(" ")) {
      statement += " ";
    }

    res.json({ statement });
  } catch (err) {
    console.error("❌ Transform question error:", err?.status, err?.message);
    res.status(500).json({ error: "Failed to transform question", statement: "" });
  }
});

// Extract memories from a conversation
app.post("/api/extract-memories", async (req, res) => {
  try {
    const { messages, existingMemories } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.json({ memories: [] });
    }

    // Only extract if conversation has enough substance (at least 4 messages)
    if (messages.length < 4) {
      return res.json({ memories: [] });
    }

    // Format conversation for analysis
    const conversationText = messages
      .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
      .join("\n");

    const existingMemoriesText = existingMemories && existingMemories.length > 0
      ? `Existing memories:\n${existingMemories.map((m) => `- ${m.fact}`).join("\n")}\n\n`
      : "";

    const extractionPrompt = `You are a memory extraction assistant. Analyze this conversation and extract 2-4 key facts about the user that Lumon should remember across conversations.

${existingMemoriesText}Rules:
- Extract personal facts the user explicitly shared (preferences, goals, experiences, habits, interests)
- Ignore generic responses or Lumon's suggestions
- Write each fact as a short statement (under 20 words)
- Don't duplicate existing memories
- Focus on memorable, personally relevant information
- Return valid JSON only

Conversation:
${conversationText}

Return a JSON array like: ["User prefers concise explanations", "User is learning machine learning"]`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      messages: [
        {
          role: "user",
          content: extractionPrompt,
        },
      ],
    });

    const responseText = response.choices?.[0]?.message?.content || "[]";
    
    // Try to parse as JSON
    let extractedMemories = [];
    try {
      extractedMemories = JSON.parse(responseText);
      if (!Array.isArray(extractedMemories)) {
        extractedMemories = [];
      }
    } catch (e) {
      // If not valid JSON, try to extract array-like content
      const arrayMatch = responseText.match(/\[.*\]/s);
      if (arrayMatch) {
        try {
          extractedMemories = JSON.parse(arrayMatch[0]);
        } catch (e2) {
          extractedMemories = [];
        }
      }
    }

    res.json({ memories: extractedMemories.slice(0, 4) }); // Cap at 4 new memories
  } catch (err) {
    console.error("❌ Extract memories error:", err?.status, err?.message);
    res.status(500).json({ error: "Failed to extract memories", memories: [] });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
