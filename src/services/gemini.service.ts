import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface AILayoutConfig {
  formattedHeadline: string;
  suggestedSubline: string;
  primaryAccentColor: string;
  secondaryAccentColor: string;
  tertiaryAccentColor: string;
  badgeText: string;
  gridStyle: 'solid' | 'two-band' | 'three-band';
  motifStyle: 'floral';
}

export async function generatePosterDesignConfig(
  headline: string,
  occasion: string,
  party: string
): Promise<AILayoutConfig> {
  const gridOptions: AILayoutConfig['gridStyle'][] = ['solid', 'two-band', 'three-band'];
  const randomGrid = gridOptions[Math.floor(Math.random() * gridOptions.length)];

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.8-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });

    const prompt = `
      You are an expert Bangladeshi political poster designer.

      🚨 STRICT RULES:
      1. ALL TEXT OUTPUT MUST BE STRICTLY IN BANGLA SCRIPT (বাংলা লিপি).
      2. TOP HEADLINE (badgeText): Translate/format the selected occasion "${occasion}" into short, elegant BANGLA (e.g. "Victory Day" -> "মহান বিজয় দিবস", "Eid" -> "পবিত্র ঈদ মোবারক", "Condolence" -> "শোক বার্তা" , "Publicity" -> "প্রচার" ).
      3. MIDDLE BIG HEADLINE (formattedHeadline): Translate/format "${headline}" into powerful, bold political BANGLA for the center of the poster.

      Input Provided:
      - Selected Occasion (for Top Badge): "${occasion}"
      - Raw Main Headline (for Middle Big Headline): "${headline}"
      - Party / Organization: "${party}"

      Return valid JSON with this exact schema:
      {
        "badgeText": "Occasion translated into Bangla script for top badge",
        "formattedHeadline": "Main headline translated into big Bangla script for middle",
        "suggestedSubline": "Short supporting slogan in Bangla script",
        "primaryAccentColor": "#Hex",
        "secondaryAccentColor": "#Hex",
        "tertiaryAccentColor": "#Hex",
        "gridStyle": "solid | two-band | three-band",
        "motifStyle": "floral"
      }
    `;

    const result = await model.generateContent(prompt);
    const parsed: AILayoutConfig = JSON.parse(result.response.text());

    return {
      ...parsed,
      motifStyle: 'floral',
    };
  } catch (error) {
    console.error('Gemini Design Assistance Error (using fallback):', error);

    return {
      badgeText: occasion || 'শুভেচ্ছা বার্তা', 
      formattedHeadline: headline || 'শুভেচ্ছা ও অভিনন্দন', 
      suggestedSubline: 'একত্রে দেশ গড়ার অঙ্গীকার',
      primaryAccentColor: '#006A4E',
      secondaryAccentColor: '#F42A41',
      tertiaryAccentColor: '#FFD700',
      gridStyle: randomGrid,
      motifStyle: 'floral',
    };
  }
}