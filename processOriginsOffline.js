#!/usr/bin/env node

/**
 * Process Origins Script (Offline Version)
 * Adds origins to all 224k+ names using pattern matching only
 * Run with: node processOriginsOffline.js
 */

const fs = require('fs');
const path = require('path');

// Top 10 Origins
const TOP_10_ORIGINS = [
  'Hebrew',    // Biblical names
  'Greek',     // Classical names
  'Latin',     // Roman names
  'Germanic',  // German/English
  'Arabic',    // Islamic names
  'English',   // Anglo-Saxon
  'French',    // French names
  'Spanish',   // Hispanic names
  'Celtic',    // Irish/Scottish
  'Italian'    // Italian names
];

// Extended pattern-based origin detection
function detectOriginByPattern(name) {
  const nameLower = name.toLowerCase();

  // Hebrew patterns (expanded)
  if (/^(david|sarah|michael|daniel|rachel|samuel|ruth|hannah|jonathan|benjamin|elizabeth|jacob|joseph|mary|martha|miriam|nathaniel|rebecca|solomon|isaac|abraham|noah|adam|eve|leah|esther|joshua|caleb|elijah|ezra|deborah|judith|naomi|seth|aaron|moses|simon|matthias|matthew|mark|luke|john|james|peter|paul|saul|abel|cain|eli|gideon|samson|delilah|bathsheba|tamar|dinah|zilpah|bilhah|hagar|ishmael|jeremiah|isaiah|ezekiel|hosea|joel|amos|obadiah|jonah|micah|nahum|habakkuk|zephaniah|haggai|zechariah|malachi)$/i.test(name)) {
    return 'Hebrew';
  }

  // Arabic patterns (expanded)
  if (/^(muhammad|mohammed|mohamed|mohammad|muhammed|ahmed|ahmad|ali|omar|umar|hassan|hasan|hussein|hussain|fatima|fatimah|aisha|ayesha|khalid|abdullah|abdallah|ibrahim|yusuf|youssef|mustafa|mostafa|hamza|hamzah|zahra|zainab|zaynab|layla|leila|salma|tariq|rashid|rasheed|nasir|nasser|samir|samira|karim|kareem|jamal|jamil|farid|fareed|nadia|nadine|yasmin|yasmine|saeed|said|waleed|walid|hakim|hakeem|malik|amina|aminah|safiya|safiyah|khadija|khadijah|maryam|mariam|bilal|imran|sulaiman|suleiman|idris|harun|haroon|zakaria|zakariya|yahya|isa|musa|dawood|dawud|jibril|jibreel|ismail|ishaq|yaqub|yakub|nuh|hud|saleh|lut|shuaib|ayub|yunus|zakariyya|ilyas|alyasa|dhul-kifl|talha|zubair|zubayr|uthman|othman|abbas|hamza|jafar|jaafar|hasan|husayn|ruqayya|umm|kulthum|anas|bilal|ammar|yasir|sumayya|khabbab|suhayb|salman|hudhayfah|muadh|ubayy|zayd|usama|usamah|safwan|ikrimah|amr|khalid|sad|saad|said|abdur|abdul)$/i.test(name) ||
      nameLower.startsWith('abdul') || nameLower.startsWith('abu') || nameLower.includes('allah') || nameLower.includes('din') || nameLower.endsWith('ullah')) {
    return 'Arabic';
  }

  // Greek patterns (expanded)
  if (/^(alexander|alexis|alexandra|sophia|sophie|nicholas|nicolas|helen|helena|george|georgios|theodore|theo|peter|petros|andrew|andreas|philip|philippos|stephen|stefanos|christina|christine|catherine|katherine|athena|diana|demetrius|dimitri|penelope|aphrodite|apollo|zeus|hermes|hera|artemis|demeter|persephone|hades|poseidon|hestia|ares|achilles|odysseus|agamemnon|menelaus|paris|hector|priam|cassandra|andromache|hecuba|clytemnestra|electra|orestes|iphigenia|antigone|oedipus|jason|medea|theseus|ariadne|minos|daedalus|icarus|orpheus|eurydice|pandora|prometheus|atlas|cronos|rhea|gaia|uranus|nike|iris|eros|psyche|narcissus|echo|pygmalion|galatea|adonis|hercules|heracles|perseus|andromeda|bellerophon|pegasus|chiron|asclepius|hippocrates|socrates|plato|aristotle|democritus|pythagoras|euclid|archimedes|ptolemy|cleopatra|pericles|leonidas|lycurgus|solon|draco|homer|hesiod|aeschylus|sophocles|euripides|aristophanes|pindar|sappho|anacreon|herodotus|thucydides|xenophon|plutarch|strabo|pausanias|diodorus|polybius|livy|tacitus|suetonius|pliny|galen|hippocrates)$/i.test(name) ||
      name.endsWith('os') || name.endsWith('is') || name.endsWith('eus') || name.endsWith('ius') || name.endsWith('opoulos') || name.endsWith('opoulou')) {
    return 'Greek';
  }

  // Latin patterns (expanded)
  if (/^(marcus|mark|julius|julia|claudius|claudia|victoria|victor|felix|felicia|felicity|lucia|lucy|lucius|gloria|beatrice|beatrix|caesar|augustus|augusta|augustine|maximus|maxim|max|maximilian|valentina|valentine|valentin|aurora|luna|stella|clara|claire|clare|adrian|adriana|cecilia|cecily|benedict|benedicta|dominic|dominica|ignatius|ignatia|vincent|vincentia|laurence|lawrence|laura|lauren|martin|martina|patrick|patricia|paul|paula|pauline|paulina|sylvia|silvia|silvester|sylvester|quintus|quinta|octavius|octavia|septimus|septima|sextus|sexta|nonus|nona|decimus|decima|titus|tiberius|gaius|gnaeus|publius|lucius|aulus|spurius|servius|appius|manius|numerius|vibius|kaeso|tullus|hostus|agrippa|brutus|cassius|cato|cicero|crassus|fabius|flaccus|gracchus|horatius|livius|lucretius|marius|metellus|nero|paulus|piso|pompeius|porcius|rufus|scaevola|scipio|seneca|sulla|tacitus|valerius|varro|verres|vespasianus|vitellius|antonius|antonia|aurelia|camilla|cornelia|flavia|fulvia|livia|lucretia|pompeia|porcia|tullia|valeria|virginia)$/i.test(name) ||
      (name.endsWith('us') && name.length > 4) || (name.endsWith('ia') && name.length > 4) || name.endsWith('ius') || name.endsWith('ianus')) {
    return 'Latin';
  }

  // Spanish patterns (expanded)
  if (/^(carlos|carlo|maria|marie|jose|josef|juan|juana|juanita|miguel|miguela|antonio|antonia|francisco|francisca|manuel|manuela|pedro|petra|diego|luis|luisa|javier|javiera|roberto|roberta|fernando|fernanda|isabel|isabella|carmen|rosa|rosita|elena|helena|lucia|alejandro|alejandra|pablo|paula|sergio|sergia|andres|andrea|rafael|rafaela|ramon|ramona|ricardo|ricarda|eduardo|eduarda|alberto|alberta|enrique|enriqueta|jorge|georgina|victor|victoria|gabriel|gabriela|santiago|santiago|domingo|dominica|gonzalo|gonzala|rodrigo|rodrigue|alfonso|alfonsa|beatriz|catalina|cristina|dolores|esperanza|felicidad|guadalupe|ines|inmaculada|josefa|josefina|leonor|margarita|mercedes|montserrat|natalia|nuria|paloma|patricia|pilar|remedios|rocio|soledad|teresa|trinidad|veronica|yolanda|agustin|agustina|alvaro|bernardo|bernardino|cristobal|cristina|emilio|emilia|esteban|estefania|felipe|felipa|fernando|fernanda|francisco|francisca|guillermo|guillermina|ignacio|ignacia|jaime|joaquin|joaquina|julian|juliana|lorenzo|lorenza|marcos|marco|mateo|matia|nicolas|nicolasa|oscar|osvaldo|pablo|pascual|pascuala|patricio|patricia|raul|raquel|salvador|salvadora|sebastian|sebastiana|tomas|tomasa|vicente|vicenta)$/i.test(name) ||
      name.endsWith('ez') || name.endsWith('az') || name.endsWith('oz') || name.endsWith('iz') || name.endsWith('ito') || name.endsWith('ita') || name.endsWith('illo') || name.endsWith('illa')) {
    return 'Spanish';
  }

  // Italian patterns (expanded)
  if (/^(giovanni|gianni|gian|gianna|marco|francesco|francesca|franco|giuseppe|giuseppina|peppe|peppa|antonio|antonia|antonella|antonello|roberto|roberta|stefano|stefania|isabella|isabel|lucia|luciano|luciana|francesca|francesco|giulia|giulio|giuliana|giuliano|chiara|chiaro|alessandra|alessandro|alessia|alessio|valentina|valentino|lorenzo|lorenza|matteo|mattia|leonardo|leonarda|andrea|andreas|alberto|alberta|carlo|carla|carlotta|carolina|daniele|daniela|davide|david|edoardo|eduarda|emanuele|emanuela|enrico|enrica|fabio|fabia|federico|federica|filippo|filippa|gabriele|gabriella|giacomo|giacoma|giorgio|giorgia|giovanni|giovanna|luca|lucia|luigi|luigia|mario|maria|massimo|massima|michele|michela|nicola|nicoletta|paolo|paola|pietro|pietra|raffaele|raffaella|riccardo|riccarda|roberto|roberta|salvatore|salvatora|sergio|sergia|simone|simona|tommaso|tommasina|vincenzo|vincenza|vittorio|vittoria|angelo|angela|anna|annabella|antonino|antonina|benedetto|benedetta|bruno|bruna|claudio|claudia|dario|daria|domenico|domenica|enzo|enza|flavio|flavia|franco|franca|gino|gina|guido|guida|italo|italia|livio|livia|lucio|lucia|mario|maria|nino|nina|ottavio|ottavia|paolo|paola|piero|piera|quinto|quinta|renzo|renza|romano|romana|sandro|sandra|sergio|sergia|tito|tita|ugo|uga|valerio|valeria|walter|waltera)$/i.test(name) ||
      name.endsWith('ino') || name.endsWith('ina') || name.endsWith('ello') || name.endsWith('ella') || name.endsWith('etto') || name.endsWith('etta') || name.endsWith('ucci') || name.endsWith('uccia')) {
    return 'Italian';
  }

  // French patterns (expanded)
  if (/^(pierre|pierrette|jean|jeanne|jeanette|jacques|jacqueline|louis|louise|louisette|francois|francoise|henri|henriette|henry|michel|michelle|micheline|marie|mariette|marion|charlotte|charles|charlene|sophie|sofia|claire|clara|clarisse|amelie|amelia|camille|camilla|julie|julien|juliette|antoine|antoinette|laurent|laurence|laure|nicolas|nicole|nicolette|bernard|bernadette|claude|claudette|claudine|daniel|danielle|denis|denise|dominique|emmanuel|emmanuelle|etienne|fabien|fabienne|gabriel|gabrielle|georges|georgette|gerard|geraldine|gregoire|helene|helena|isabelle|isabel|jacques|jacqueline|jerome|laetitia|lucien|lucienne|marc|marcel|marcelle|marguerite|margot|mathieu|mathilde|maurice|mauricette|maxime|monique|nathalie|natalie|olivier|olivia|pascal|pascale|patrick|patrice|patricia|philippe|philippine|raphael|raphaelle|rene|renee|robert|roberte|sebastien|sebastienne|serge|sergine|sylvie|sylvain|sylvaine|thierry|thomas|valerie|valentin|valentine|vincent|vincente|xavier|xaviere|yves|yvette|yvonne|alain|alaine|alexandre|alexandrine|andre|andree|benoit|benoite|bertrand|bertrande|brigitte|bruno|brune|cedric|celine|christian|christiane|christophe|christine|didier|diane|eric|erica|fernand|fernande|florent|florence|francis|francine|frederic|frederique|gaston|gastonne|gilles|gillette|guillaume|guillemette|guy|guyenne|hugues|huguette|jacques|jacqueline|jean-baptiste|jean-claude|jean-francois|jean-luc|jean-marc|jean-michel|jean-paul|jean-pierre|joel|joelle|julien|julienne|lionel|lionelle|luc|lucie|ludovic|ludovine|marcel|marcelline|martin|martine|matthieu|matthias|maurice|mauricienne|nicolas|nicolette)$/i.test(name) ||
      name.endsWith('ette') || name.endsWith('elle') || name.endsWith('eux') || name.endsWith('euse') || name.endsWith('ais') || name.endsWith('aise') || name.endsWith('ois') || name.endsWith('oise') || name.endsWith('ard') || name.endsWith('arde')) {
    return 'French';
  }

  // Celtic patterns (expanded)
  if (/^(liam|william|sean|shawn|shaun|patrick|padraig|paddy|patty|brian|bryan|briana|brianna|kevin|caoimhin|ryan|rian|connor|conor|conner|dylan|dillon|aidan|aiden|aedan|bridget|brigid|brigitte|siobhan|chevonne|fiona|fionna|maeve|meave|medb|aisling|ashling|niamh|neve|colin|collin|cillian|killian|declan|kieran|ciaran|keiran|brendan|brenden|rory|ruairi|eamon|eamonn|owen|eoin|ian|iain|fergus|finley|finlay|finn|fionn|garrett|gareth|glenn|glen|gordon|graham|graeme|grant|gregor|hamish|hugh|keith|kenneth|kenny|malcolm|neil|niall|neal|ross|roy|ruairi|scott|shane|shayne|stewart|stuart|tadhg|teague|tiernan|trevor|angus|alan|allan|allen|arthur|blair|bruce|cameron|campbell|craig|donald|donal|douglas|duncan|ewan|ewen|fraser|frazer|gavin|gordon|graham|graeme|grant|gregor|hamish|ian|iain|jack|jamie|james|kenneth|kenny|lachlan|lochlan|logan|magnus|murray|murdoch|neil|niall|neal|norman|ranald|ronald|rory|ruairi|ross|roy|scott|sinclair|stuart|stewart|wallace|william|ailbhe|alby|ailish|alice|ailis|aine|anya|aoibhe|eva|aoife|eva|caoimhe|keeva|cara|ciara|keira|kyra|clodagh|deirdre|dervla|eilis|eilish|elizabeth|emer|eimear|ena|ina|grainne|grania|grace|kathleen|caitlin|katelyn|katie|mairead|margaret|maire|mary|maureen|moira|maura|molly|niamh|neve|nora|norah|nuala|orla|orlaith|patricia|patsy|roisin|rosheen|rose|sinead|sheena|jane|siobhan|chevonne|tara|una|oona)$/i.test(name) ||
      nameLower.startsWith('mac') || nameLower.startsWith('mc') || nameLower.startsWith("o'") || nameLower.startsWith('fitz')) {
    return 'Celtic';
  }

  // Germanic patterns (expanded)
  if (/^(william|wilhelm|willy|bill|robert|roberto|rupert|richard|rick|ricky|dick|henry|heinrich|hendrik|harry|albert|alberto|albrecht|frederick|frederic|fred|freddy|fritz|otto|otis|emma|emmy|emmeline|alice|alicia|alison|matilda|matilde|tilda|gertrude|gertie|trudy|hildegard|hilda|brunhilde|brunhilda|siegfried|sigfried|ludwig|louis|lewis|karl|carl|carlo|charles|charlie|conrad|konrad|kurt|curt|dietrich|dieter|dirk|ernst|ernest|ernie|franz|frank|franklin|friedrich|fritz|georg|george|gerhard|gerard|gerry|gustav|gustave|gus|gunther|gunter|hans|hansel|heinrich|henry|helmut|herman|hermann|horst|hugo|hugh|joachim|joaquin|johann|johannes|john|johannes|josef|joseph|joe|karl|carl|klaus|claus|kurt|curt|lothar|luther|manfred|manny|matthias|matthew|max|maximilian|norbert|norbie|oskar|oscar|otto|otis|peter|pieter|rainer|rayner|reinhard|reynard|rudolf|rudolph|rudy|siegfried|sigfried|stefan|stephan|stephen|ulrich|ulric|viktor|victor|walter|walt|werner|verner|wilhelm|william|wolfgang|wolf|adelheid|adelaide|adele|agnes|agatha|alberta|alberte|anna|anne|annie|anneliese|annalise|barbara|barb|babs|beatrix|beatrice|bertha|berthe|birgit|bridget|brigitte|brunhilde|brunhilda|charlotte|lotte|lottie|christa|christina|christine|clara|claire|clare|dorothea|dorothy|dora|edith|edie|elisabeth|elizabeth|elsa|else|elise|emma|emmy|erika|erica|erna|ernie|eva|eve|evelyn|franziska|frances|fanny|frieda|frida|peace|gerda|gerta|gertrude|gertie|greta|margaret|gretchen|gudrun|gudr|hannah|hanna|anna|hedwig|hedy|heidi|adelaide|helga|olga|hilda|hilde|hildegard|ilse|elsie|elsa|ingrid|inga|inge|irma|erma|irmgard|irmgarde|johanna|joanna|joan|karin|karen|katharina|katherine|kate|lieselotte|lotte|lottie|louise|louisa|lulu|margarete|margaret|maggie|maria|mary|marie|martha|marta|mathilde|matilda|monika|monica|petra|peter|renate|renata|rosemarie|rosemary|rose|ruth|ruthie|sabine|sabrina|sigrid|siri|sophia|sophie|stefanie|stephanie|steffie|susanne|susan|sue|therese|teresa|terry|ursula|ursa|uta|utah|verena|veronica|vera|viktoria|victoria|vicky|waltraud|wallie)$/i.test(name) ||
      name.endsWith('bert') || name.endsWith('berta') || name.endsWith('wald') || name.endsWith('walda') || name.endsWith('gard') || name.endsWith('garda') || name.endsWith('hardt') || name.endsWith('helm') || name.endsWith('hold') || name.endsWith('hilde')) {
    return 'Germanic';
  }

  // English patterns (check last to avoid conflicts)
  if (/^(john|johnny|jack|james|jamie|jim|jimmy|thomas|tom|tommy|edward|eddie|ted|teddy|george|georgia|charles|charlie|chuck|elizabeth|liz|lizzy|beth|betty|eliza|margaret|maggie|meg|peggy|susan|sue|susie|jennifer|jenny|jen|ashley|ashlee|ash|brandon|brady|tyler|ty|madison|maddie|maddy|taylor|jordan|jordie|mason|hunter|ethan|emma|emily|emma|olivia|oliver|ollie|sophia|sophie|ava|avery|isabella|bella|mia|charlotte|charlie|amelia|amy|harper|evelyn|eve|abigail|abby|emily|emma|ella|elizabeth|liz|camila|luna|grace|gracie|chloe|penelope|penny|layla|riley|zoey|zoe|nora|lily|lillian|eleanor|ellie|hannah|hanna|lillian|lily|addison|addie|aubrey|audrey|stella|natalie|nat|zoe|zoey|leah|hazel|violet|aurora|rory|savannah|anna|audrey|brooklyn|brooke|bella|claire|skylar|sky|lucy|paisley|everly|anna|caroline|carol|nova|genesis|jenny|emilia|emily|kennedy|ken|samantha|sam|maya|willow|will|kinsley|naomi|nomi|sarah|sara|allison|allie|gabriella|gabby|madelyn|maddie|cora|ruby|eva|eve|serenity|serena|autumn|adeline|addie|hailey|haley|gianna|gia|valentina|val|isla|eliana|ellie|quinn|nevaeh|heaven|ivy|emery|emory|peyton|payton|melanie|mel|aubree|aubrey|claire|clara|piper|pipes|nora|cora|genesis|jenny|alice|allie|athena|sadie|lydia|alexa|lexi|arianna|ari|juliana|julia|faith|alexandra|alex|arya|rylee|riley|molly|raelynn|rae|jessica|jess|elena|ellie|bailey|brielle|bri|jade|mary|mila|reagan|ray|annabelle|anna|sage|jasmine|jazz|charlie|amaya|maya|amira|mira|rose|rosie|adalynn|addie|alaina|lainey|alana|lana|harmony|summer|hope|sydney|syd|jocelyn|josie|kimberly|kim|esther|ester|ariel|ari|hadley|london|londyn|juliette|julie|diana|di|khloe|kallie|callie|morgan|rachel|rach|daniela|dani|reese|gracie|rose|katherine|kate|harmony|vanessa|nessa)$/i.test(name)) {
    return 'English';
  }

  // Default to English for Anglo-Saxon style names
  return 'English';
}

// Process a chunk file
async function processChunk(chunkFile) {
  console.log(`\nProcessing ${chunkFile}...`);

  const filePath = path.join('public', 'data', chunkFile);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${chunkFile} - file not found`);
    return;
  }

  // Load chunk
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const names = data.names || [];

  console.log(`Found ${names.length} names in ${chunkFile}`);

  let updatedCount = 0;

  // Process each name
  for (const name of names) {
    const nameStr = name.name || name;
    const origin = detectOriginByPattern(nameStr);

    if (typeof name === 'object') {
      if (!name.origin || name.origin === 'Unknown') {
        name.origin = origin;
        name.originProcessed = true;
        updatedCount++;
      }
    }
  }

  // Save updated chunk
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`Updated ${chunkFile} - Added origins to ${updatedCount} names`);

  return updatedCount;
}

// Main function
async function main() {
  console.log('='.repeat(60));
  console.log('Origin Processing Script (Offline)');
  console.log('Processing all names with pattern matching');
  console.log('='.repeat(60));

  const startTime = Date.now();
  let totalProcessed = 0;

  // Process each chunk
  const chunks = [
    'names-core.json',     // 945 names
    'names-chunk1.json',   // 29k names
    'names-chunk2.json',   // ~40k names
    'names-chunk3.json',   // ~60k names
    'names-chunk4.json'    // ~95k names
  ];

  for (const chunk of chunks) {
    try {
      const processed = await processChunk(chunk);
      totalProcessed += processed;
    } catch (error) {
      console.error(`Error processing ${chunk}:`, error);
    }
  }

  const duration = Math.round((Date.now() - startTime) / 1000);

  // Final summary
  console.log('\n' + '='.repeat(60));
  console.log('PROCESSING COMPLETE');
  console.log(`Total names processed: ${totalProcessed}`);
  console.log(`Time taken: ${duration} seconds`);
  console.log('='.repeat(60));
}

// Run the script
main().catch(console.error);