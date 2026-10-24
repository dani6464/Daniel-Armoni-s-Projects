function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Check if the sheet is completely empty. If yes, add headers first!
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Timestamp",                            // Column A
        "Participant",                          // Column B
        "Condition",                            // Column C
        "Language",                             // Column D
        "Start Time",                           // Column E
        "Submit Time",                          // Column F
        "Submit Appeared Time",                 // Column G
        "Total Chars Typed",                    // Column H
        "Prompts Sent",                         // Column I
        "Prompts (After Submit)",               // Column J
        "Total Slider Changes",                 // Column K
        "Verbosity Changes",                    // Column L
        "Tone Changes",                       // Column M
        "Self-Promotion Changes",               // Column N
        "Slider Changes History",               // Column O
        "Final Cover Letter"                    // Column P
      ]);
    }
    
    // Parse the JSON data sent from the website
    var data = JSON.parse(e.postData.contents);
    
    // Convert the detailed slider changes array into a JSON string so it fits in a single cell
    var sliderChangesHistory = "";
    if (data.sliderChanges && data.sliderChanges.length > 0) {
      sliderChangesHistory = JSON.stringify(data.sliderChanges);
    }
    
    // Append the data as a new row
    sheet.appendRow([
      new Date(),                               // Column A: Timestamp of submission
      data.participantNumber || "",             // Column B: Participant ID
      data.condition || "",                     // Column C: Condition (1, 2, or 3)
      data.language || "",                      // Column D: Language ('he' or 'en')
      data.startTime || "",                     // Column E: Task Start Time
      data.submitTime || "",                    // Column F: Task Submit Time
      data.submitAppearedTime || "",            // Column G: When "Ready to Submit" appeared
      data.totalCharactersTyped || 0,           // Column H: Total characters typed
      data.promptsSent || 0,                    // Column I: Total messages sent to AI
      data.promptsSentAfterSubmitAppeared || 0, // Column J: Messages sent after 5 minutes
      data.totalSliderChanges || 0,             // Column K: Total Slider Changes (All)
      data.verbosityChanges || 0,               // Column L: Verbosity Changes
      data.toneChanges || 0,                    // Column M: Tone Changes
      data.selfPromotionChanges || 0,           // Column N: Self-Promotion Changes
      sliderChangesHistory,                     // Column O: Raw JSON history of exact slider values
      data.finalCoverLetter || ""               // Column P: Final Cover Letter Text
    ]);
    
    return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
  } catch (error) {
    return ContentService.createTextOutput("Error: " + error.toString()).setMimeType(ContentService.MimeType.TEXT);
  }
}
