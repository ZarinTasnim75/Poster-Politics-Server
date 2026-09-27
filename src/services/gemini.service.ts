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
  const gridOptions: AILayoutConfig['gridStyle'][] = [
    'solid',
    'two-band',
    'three-band',
  ];

  const randomGrid =
    gridOptions[Math.floor(Math.random() * gridOptions.length)];

  const banglaOccasionMap: Record<string, string> = {
    'victory-day': 'মহান বিজয় দিবস',
    condolence: 'শোকবার্তা',
    campaign: 'জনস্বার্থে প্রচার',
  };

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const prompt = `
You are an expert Bangladeshi poster designer.

Your job is to provide poster design assistance while strictly preserving
user-provided information.

STRICT LANGUAGE RULES:
1. All AI-generated visible text MUST be written in Bengali (বাংলা) script.
2. NEVER generate English text for AI-generated visible poster content.
3. Translate the occasion into natural Bengali only when generating badgeText.
4. suggestedSubline MUST be written in Bengali.
5. badgeText MUST contain Bengali only.
6. suggestedSubline MUST contain Bengali only.
7. Do NOT transliterate English words into Bangla unless there is no natural Bengali equivalent.
8. Do not create political persuasion, endorsements, voting instructions, or campaign slogans.
9. Keep AI-generated text neutral and suitable for the selected poster occasion.

CRITICAL MAIN HEADLINE RULE:
1. The user's Main Headline is the most important text on the poster.
2. NEVER translate the Main Headline.
3. NEVER rewrite the Main Headline.
4. NEVER paraphrase the Main Headline.
5. NEVER correct the Main Headline.
6. NEVER shorten the Main Headline.
7. NEVER expand the Main Headline.
8. NEVER add or remove any words.
9. Preserve every Bengali character, English character, number,
   punctuation mark, symbol, space, and line exactly.
10. formattedHeadline MUST be an exact copy of the user's Main Headline.
11. Do not generate a replacement headline.

OCCASION TRANSLATION:
- victory-day → মহান বিজয় দিবস
- condolence → শোকবার্তা
- campaign → জনস্বার্থে প্রচার

The occasion values above are internal database values.
Never display the raw internal occasion value on the poster.

INPUT:
- Occasion: "${occasion}"
- Main Headline: "${headline}"
- Party / Organization: "${party}"

COLOR RULES:
1. Choose a coherent color palette appropriate for the selected occasion.
2. The colors must match the emotional and visual character of the occasion.

For "condolence":
- Use black, charcoal, dark grey, grey, white, or muted neutral colors.
- Prefer dark and neutral colors for the main background.
- Avoid bright, festive, neon, or highly saturated colors.
- Keep the design respectful, solemn, minimal, and subdued.

For "victory-day":
- Prefer deep green, red, white, and subtle gold accents.
- Keep the palette balanced and suitable for a national commemorative poster.

For "campaign":
- Use a professional, high-contrast palette.
- Avoid random colors that conflict with the selected occasion.

LAYOUT RULES:
1. Choose a gridStyle that works well with the selected occasion and content.
2. Keep the main headline visually prominent.
3. Choose a simple and readable layout.
4. motifStyle MUST be "floral".

RETURN ONLY VALID JSON.
Do not include markdown.
Do not include explanations.
Do not include additional fields.

Return exactly this schema:

{
  "badgeText": "বাংলায় সংক্ষিপ্ত অনুষ্ঠান বা উপলক্ষের নাম",
  "formattedHeadline": "EXACT COPY OF THE USER'S MAIN HEADLINE",
  "suggestedSubline": "বাংলায় সংক্ষিপ্ত সহায়ক লাইন",
  "primaryAccentColor": "#Hex",
  "secondaryAccentColor": "#Hex",
  "tertiaryAccentColor": "#Hex",
  "gridStyle": "solid | two-band | three-band",
  "motifStyle": "floral"
}

FINAL CHECK:
- formattedHeadline must exactly match the user's Main Headline.
- Do not translate the Main Headline.
- Do not modify the Main Headline.
- Do not invent a replacement headline.
- All AI-generated text must be Bengali.
- Colors must match the occasion.
- motifStyle must be "floral".
`;

    const result = await model.generateContent(prompt);

    const parsed: AILayoutConfig = JSON.parse(result.response.text());

    return {
      ...parsed,

      // NEVER trust the AI with the user's original headline.
      formattedHeadline: headline || 'শুভেচ্ছা ও অভিনন্দন',

      motifStyle: 'floral',
    };
  } catch (error) {
    console.error(
      'Gemini Design Assistance Error (using fallback):',
      error
    );

    return {
      badgeText:
        banglaOccasionMap[occasion] || 'শুভেচ্ছা বার্তা',

      // Preserve the user's headline even when Gemini fails.
      formattedHeadline:
        headline || 'শুভেচ্ছা ও অভিনন্দন',

      suggestedSubline:
        'শুভেচ্ছা ও সৌহার্দ্যের বার্তা',

      primaryAccentColor:
        occasion === 'condolence'
          ? '#2F2F2F'
          : occasion === 'victory-day'
            ? '#006A4E'
            : '#4F5B2A',

      secondaryAccentColor:
        occasion === 'condolence'
          ? '#6B6B6B'
          : occasion === 'victory-day'
            ? '#F42A41'
            : '#B8892D',

      tertiaryAccentColor:
        occasion === 'condolence'
          ? '#E5E5E5'
          : occasion === 'victory-day'
            ? '#FFD700'
            : '#D8C9A8',

      gridStyle: randomGrid,
      motifStyle: 'floral',
    };
  }
}