# 📝 Sloka Data Collection Template

## How to Add Slokas from Bhajan Mala

Visit [https://www.bhajanmala.com/nodes/125](https://www.bhajanmala.com/nodes/125) and copy the sloka text in all languages.

## JSON Template

Add each sloka to `scripts/data/slokas-sample.json` using this template. (The app itself loads `public/data/slokas-complete.json` at runtime.)

```json
{
  "id": 1,
  "number": 1,
  "section": "dhyanam",
  "text": {
    "sanskrit": "PASTE SANSKRIT TEXT HERE",
    "tamil": "PASTE TAMIL TEXT HERE", 
    "telugu": "PASTE TELUGU TEXT HERE",
    "kannada": "PASTE KANNADA TEXT HERE",
    "malayalam": "PASTE MALAYALAM TEXT HERE",
    "hindi": "PASTE HINDI TEXT HERE",
    "english": "PASTE TRANSLITERATION HERE (NOT MEANING)"
  },
  "audio": {
    "file": "sloka_01.mp3",
    "startTime": 0,
    "endTime": 15.5,
    "duration": 15.5
  }
}
```

## Important Notes

### English Field
✅ **DO**: Use transliteration (pronunciation)
```
"english": "shuklaambaradharam vishnum shashinvarnam chaturbhujam"
```

❌ **DON'T**: Use meaning/translation
```
"english": "I meditate on Lord Vishnu who is dressed in white..."
```

### Section Field
Use one of these values:
- `"dhyanam"` - Introduction/meditation slokas (usually first 8-10)
- `"main"` - Main body with 1000 names (bulk of slokas)
- `"phalasruti"` - Conclusion/benefits slokas (last 5-10)

### Audio Timing
After you split the audio, measure:
- **startTime**: When sloka begins (in seconds)
- **endTime**: When sloka ends (in seconds)
- **duration**: endTime - startTime

## Quick Data Entry Spreadsheet

Create a spreadsheet to organize before adding to JSON:

| Sloka | Section | Sanskrit | Tamil | Telugu | Kannada | Malayalam | Hindi | English | Audio File | Start | End | Duration |
|-------|---------|----------|-------|--------|---------|-----------|-------|---------|------------|-------|-----|----------|
| 1     | dhyanam | ...      | ...   | ...    | ...     | ...       | ...   | ...     | sloka_01.mp3 | 0   | 15.5 | 15.5    |
| 2     | dhyanam | ...      | ...   | ...    | ...     | ...       | ...   | ...     | sloka_02.mp3 | 15.5 | 29.8 | 14.3   |

## Bulk Conversion Tool (Optional)

If you have all data in a spreadsheet (CSV), use this Node.js script to convert:

```javascript
// csv-to-json.js
const fs = require('fs');
const csv = require('csv-parser');

const slokas = [];

fs.createReadStream('slokas.csv')
  .pipe(csv())
  .on('data', (row) => {
    slokas.push({
      id: parseInt(row.Sloka),
      number: parseInt(row.Sloka),
      section: row.Section,
      text: {
        sanskrit: row.Sanskrit,
        tamil: row.Tamil,
        telugu: row.Telugu,
        kannada: row.Kannada,
        malayalam: row.Malayalam,
        hindi: row.Hindi,
        english: row.English
      },
      audio: {
        file: `sloka_${row.Sloka.padStart(2, '0')}.mp3`,
        startTime: parseFloat(row.Start),
        endTime: parseFloat(row.End),
        duration: parseFloat(row.Duration)
      }
    });
  })
  .on('end', () => {
    const output = {
      metadata: {
        title: "Vishnu Sahasranamam",
        totalSlokas: slokas.length,
        source: "Bhajan Mala",
        languages: ["sanskrit", "tamil", "telugu", "kannada", "malayalam", "hindi", "english"],
        note: "English is transliteration (pronunciation guide) for kids learning"
      },
      slokas: slokas
    };
    
    fs.writeFileSync('scripts/data/slokas-sample.json', JSON.stringify(output, null, 2));
    console.log(`✓ Converted ${slokas.length} slokas to JSON`);
  });
```

Run with:
```bash
npm install csv-parser
node csv-to-json.js
```

## Validation Checklist

Before finalizing the JSON:

- [ ] All 109 slokas added
- [ ] All language fields populated
- [ ] English is transliteration, not meaning
- [ ] Section field is correct (dhyanam/main/phalasruti)
- [ ] Audio file names match (sloka_01.mp3, sloka_02.mp3, etc.)
- [ ] Timestamps are accurate
- [ ] No typos in Sanskrit/regional scripts
- [ ] JSON is valid (use [jsonlint.com](https://jsonlint.com/))

## Testing

After adding slokas, test the app:

```bash
npm run dev
```

Check:
1. Does the sloka text display correctly in all languages?
2. Do language switches work?
3. Is the transliteration readable for kids?
4. Are section badges showing correctly?

## Need Help with Typing?

If typing in regional scripts is difficult:

1. **Google Input Tools**: [https://www.google.com/inputtools/](https://www.google.com/inputtools/)
2. **Copy-paste** from Bhajan Mala website
3. Use **Google Translate** to verify text accuracy (paste and check)

## Sample Entry (Reference)

```json
{
  "id": 1,
  "number": 1,
  "section": "dhyanam",
  "text": {
    "sanskrit": "शुक्लाम्बरधरं विष्णुं शशिवर्णं चतुर्भुजम् ।\nप्रसन्नवदनं ध्यायेत् सर्वविघ्नोपशान्तये ॥",
    "tamil": "ஶுக்லாம்பரதரம் விஷ்ணும் ஶஶிவர்ணம் சதுர்புஜம் |\nப்ரஸன்னவதனம் த்யாயேத் ஸர்வவிக்னோபஶாந்தயே ||",
    "telugu": "శుక్లాంబరధరం విష్ణుం శశివర్ణం చతుర్భుజమ్ |\nప్రసన్నవదనం ధ్యాయేత్ సర్వవిఘ్నోపశాంతయే ||",
    "kannada": "ಶುಕ್ಲಾಂಬರಧರಂ ವಿಷ್ಣುಂ ಶಶಿವರ್ಣಂ ಚತುರ್ಭುಜಮ್ |\nಪ್ರಸನ್ನವದನಂ ಧ್ಯಾಯೇತ್ ಸರ್ವವಿಘ್ನೋಪಶಾಂತಯೇ ||",
    "malayalam": "ശുക്ലാംബരധരം വിഷ്ണും ശശിവര്‍ണം ചതുര്‍ഭുജം |\nപ്രസന്നവദനം ധ്യായേത് സര്‍വവിഘ്‌നോപശാന്തയേ ||",
    "hindi": "शुक्लाम्बरधरं विष्णुं शशिवर्णं चतुर्भुजम् |\nप्रसन्नवदनं ध्यायेत् सर्वविघ्नोपशान्तये ||",
    "english": "shuklaambaradharam vishnum shashinvarnam chaturbhujam\nprasannavadanam dhyaayet sarvavighnopaashaantaye"
  },
  "audio": {
    "file": "sloka_01.mp3",
    "startTime": 0,
    "endTime": 15.5,
    "duration": 15.5
  }
}
```
