import type { InterventionData } from "../../redux/features/newInterventionSlice";

export type SmartImportResult = {
  values: Partial<InterventionData>;
  detectedFields: string[];
  sourceType: "NPS" | "SNOW" | "ISIS" | "SAFE" | "UNKNOWN";
};

const clean = (value: string | undefined) =>
  (value ?? "")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/^\s+|\s+$/g, "");

const meaningful = (value: string | undefined) => {
  const normalized = clean(value);
  return normalized && normalized !== "--" && normalized !== "-" ? normalized : "";
};

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const findAfterLabel = (text: string, labels: string[]): string => {
  for (const label of labels) {
    const escaped = escapeRegExp(label);
    const patterns = [
      new RegExp(`(?:^|\\n)\\s*${escaped}\\s*[\\t:]+\\s*([^\\n\\t]+)`, "im"),
      new RegExp(`(?:^|\\n)\\s*${escaped}\\s{2,}([^\\n]+)`, "im"),
      new RegExp(`${escaped}\\s*[\\t:]+\\s*([^\\n\\t]+)`, "i"),
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      const value = meaningful(match?.[1]);
      if (value) return value;
    }
  }
  return "";
};

const findTableValue = (text: string, label: string): string => {
  const lines = text.split(/\r?\n/);
  const target = label.toLowerCase();

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const cells = lines[lineIndex].split(/\t+/).map(clean);
    const index = cells.findIndex((cell) => cell.toLowerCase() === target);
    if (index < 0) continue;

    const sameLineValue = meaningful(cells[index + 1]);
    if (sameLineValue && !/^(Prénom|Code postal|Nom de la ville|N°|No |Adresse)/i.test(sameLineValue)) {
      return sameLineValue;
    }

    for (let nextIndex = lineIndex + 1; nextIndex < Math.min(lines.length, lineIndex + 4); nextIndex += 1) {
      const nextCells = lines[nextIndex].split(/\t+/).map(clean);
      if (!nextCells.some(Boolean)) continue;
      const value = meaningful(nextCells[index]);
      if (value) return value;
      break;
    }
  }
  return "";
};

const first = (...values: string[]) => values.find(Boolean) ?? "";

const detectSource = (text: string): SmartImportResult["sourceType"] => {
  const upper = text.toUpperCase();
  if (upper.includes("SNOW_TITLE") || upper.includes("SNOW_ID")) return "SNOW";
  if (upper.includes("WORK ITEM TREATMENT") || upper.includes("NPS_EXCEPTION_CD")) return "NPS";
  if (upper.includes("FISISINTV") || upper.includes("INFORMATIONS 'SERVICE ORDER'")) return "ISIS";
  if (upper.includes("FSAFEMLONU") || upper.includes("ORDER VIEWER LINKS")) return "SAFE";
  return "UNKNOWN";
};

const normalizeInfrastructure = (raw: string, text: string) => {
  const value = `${raw} ${text}`.toUpperCase();
  if (/\bFIBER\b|\bFIBRE\b|FTTH|UNIFIBER|BROWNFIELD/.test(value)) return "fiber";
  if (/\bCOPPER\b|VDSL|ADSL|CUIVRE/.test(value)) return "copper";
  return "";
};

const normalizeNetwork = (text: string) => {
  const upper = text.toUpperCase();
  if (upper.includes("MOBILE VIKINGS")) return "mobileVikings";
  if (upper.includes("SCARLET")) return "scarlet";
  if (/\bOLO\b/.test(upper) && !upper.includes("IS_OLO\tNO")) return "otherOlo";
  if (upper.includes("PROXIMUS") || upper.includes("PXS") || upper.includes("NPS")) return "proximus";
  return "";
};

const normalizeStatus = (raw: string) => {
  const upper = raw.toUpperCase();
  if (/DONE|TERMIN|CLOSED|RESOLVED/.test(upper)) return "completed";
  if (/WAIT|PENDING|HOLD|CURE CONTACT|INPROGRESS|IN PROGRESS/.test(upper)) return "on hold";
  if (/ROUTE|TRANSFER|TRANSMIS/.test(upper)) return "transferred";
  return "";
};

const composeClientName = (text: string) => {
  const explicit = first(
    findAfterLabel(text, ["Nom du client", "CUSTOMER_NAME"]),
    findTableValue(text, "Nom de famille"),
  );
  if (explicit && !/^(Prénom|N\.P\.C\.)$/i.test(explicit)) {
    const firstName = first(findAfterLabel(text, ["CUST_FIRST_NAME"]), findTableValue(text, "Prénom"));
    if (firstName && !explicit.toLowerCase().includes(firstName.toLowerCase())) return clean(`${explicit} ${firstName}`);
    return explicit;
  }

  const lastName = findAfterLabel(text, ["CUST_LAST_NAME"]);
  const firstName = findAfterLabel(text, ["CUST_FIRST_NAME"]);
  return clean(`${lastName} ${firstName}`);
};

const parseStructuredAddress = (text: string) => {
  const street = first(
    findAfterLabel(text, ["ADDRESS_STREET_NAME", "Nom de la rue"]),
    findTableValue(text, "Nom de la rue"),
  );
  const number = first(
    findAfterLabel(text, ["ADDRESS_HOUSE_NUMBER", "N° de maison", "No de maison"]),
    findTableValue(text, "N° de maison"),
  );
  const alpha = first(
    findAfterLabel(text, ["N° de maison alphanumérique", "No de maison alphanumérique"]),
    findTableValue(text, "N° de maison alphanumérique"),
  );
  const zip = first(
    findAfterLabel(text, ["ADDRESS_ZIP_CODE", "Code postal"]),
    findTableValue(text, "Code postal"),
  );
  const city = first(
    findAfterLabel(text, ["ADDRESS_CITY_NAME", "Nom de la ville"]),
    findTableValue(text, "Nom de la ville"),
  );
  const box = first(
    findAfterLabel(text, ["ADDRESS_BOX", "Mail Box", "Boîte", "Boite"]),
    findTableValue(text, "Mail Box"),
  );
  const floor = first(
    findAfterLabel(text, ["ADDRESS_FLOOR", "Etage", "Étage"]),
    findTableValue(text, "Etage"),
  );
  const apartment = first(
    findAfterLabel(text, ["Appartement", "N° appartement", "No appartement"]),
    findTableValue(text, "Appartement"),
  );

  let mainAddress = "";
  const house = clean(`${number}${alpha}`);
  if (street || house) mainAddress = clean(`${street} ${house}`);
  if (zip || city) mainAddress = [mainAddress, clean(`${zip} ${city}`)].filter(Boolean).join("\n");

  if (!mainAddress) {
    const newAddressMatch = text.match(/Nouvelle adresse\s+(?:Point d'installation[^\n]*\n)?([\s\S]{0,550}?)(?=\n\s*(?:Quadrant|Actions d'ordre|Order Viewer Links|Stop Servicing|Manual TSI|Autres interventions))/i);
    const block = newAddressMatch?.[1] ?? "";
    const streetLine = block.match(/Nom de la rue\s+([^,\n]+)\s*,\s*N° de maison\s*([^\n,]+)/i);
    const postalLine = block.match(/Code postal\s+(\d+)\s*,\s*Nom de la ville\s+([^,\n]+)/i);
    if (streetLine) mainAddress = clean(`${streetLine[1]} ${streetLine[2]}`);
    if (postalLine) mainAddress = [mainAddress, clean(`${postalLine[1]} ${postalLine[2]}`)].filter(Boolean).join("\n");
  }

  const details = [
    box ? `Boîte : ${box}` : "",
    floor ? `Étage : ${floor}` : "",
    apartment ? `Appartement : ${apartment}` : "",
  ].filter(Boolean).join("\n");

  return { mainAddress, addressDetails: details };
};

const latestHumanJournalMessage = (text: string) => {
  const journalIndex = text.search(/\bJournal\b/i);
  if (journalIndex < 0) return "";
  const journal = text.slice(journalIndex);
  const regex = /(?:^|\n)(\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}:\d{2})\s+([^\n\t]+?)\s*[\t]+([^\n]+)/g;
  let match: RegExpExecArray | null;
  const messages: string[] = [];
  while ((match = regex.exec(journal))) {
    const author = clean(match[2]);
    const message = clean(match[3]);
    if (!/SYSTEM/i.test(author) && message && !/^\.:/.test(message)) messages.push(message);
  }
  return messages[0] ?? "";
};

const extractRemarks = (text: string) => {
  const blocks: string[] = [];
  const orderRemarks = findAfterLabel(text, ["Remarques ordre"]);
  const remarks = findAfterLabel(text, ["Remarques"]);
  if (orderRemarks) blocks.push(`Remarques ordre\n${orderRemarks}`);
  if (remarks && remarks !== orderRemarks) blocks.push(`Remarques\n${remarks}`);
  return blocks.join("\n\n");
};

const buildAdditionalInformation = (text: string, sourceType: SmartImportResult["sourceType"]) => {
  const sections: string[] = [];
  const workItemId = findAfterLabel(text, ["Work Item ID", "FK_WORKITEM"]);
  const snowId = findAfterLabel(text, ["SNOW_ID"]);
  const ticket = findAfterLabel(text, ["Ticket", "TICKET_NUM"]);
  const language = findAfterLabel(text, ["CUST_LANGUAGE", "Code de langue de communication"]);
  const area = findAfterLabel(text, ["AREA"]);
  const localNet = findAfterLabel(text, ["LOCAL_NET", "subArea"]);
  const remarks = extractRemarks(text);

  sections.push(`Source : ${sourceType}`);
  if (workItemId) sections.push(`Work Item ID : ${workItemId}`);
  if (snowId) sections.push(`SNOW ID : ${snowId}`);
  if (ticket) sections.push(`Ticket : ${ticket}`);
  if (language) sections.push(`Langue client : ${language}`);
  if (area) sections.push(`Area : ${area}`);
  if (localNet) sections.push(`Réseau local : ${localNet}`);
  if (remarks) sections.push(remarks);

  const previousInterventions = text.match(/Autres interventions d'ordre[\s\S]*?(?=Envoi Notification|Mise à jour intervention|$)/i)?.[0];
  if (previousInterventions) sections.push(clean(previousInterventions.replace(/\t+/g, " | ")));

  return sections.join("\n\n");
};

export const parseSmartImport = (rawText: string): SmartImportResult => {
  const text = rawText.replace(/\r/g, "").replace(/\uFFFD/g, "'");
  const sourceType = detectSource(text);
  const address = parseStructuredAddress(text);

  const interventionId = first(
    findAfterLabel(text, ["INTERVENTION_ID", "ID d'intervention", "Identifyer"]),
    findTableValue(text, "ID d'intervention"),
  );
  const oagID = first(
    findAfterLabel(text, ["OAG_ID", "OAG ID / PO ID", "Provisioning Order Id"]),
    findTableValue(text, "OAG ID / PO ID"),
  );
  const snowReference = first(findAfterLabel(text, ["SNOW_ID"]), findAfterLabel(text, ["Ticket"]));
  const description = first(
    findAfterLabel(text, ["INTERVENTION_DESCRIPTION", "NPS_EXC_DESCRIPTION", "Descriptions", "SNOW_TITLE"]),
    findTableValue(text, "Descriptions"),
  );
  const clientID = first(
    findAfterLabel(text, ["CUSTOMER_ID", "CUST_NUM", "ID client"]),
    findTableValue(text, "ID client"),
  );
  const phone = first(
    findAfterLabel(text, ["N° de GSM", "Numéro de contact", "CUST_PHONE", "PHONE"]),
    findTableValue(text, "N° de GSM"),
    findTableValue(text, "Numéro de contact"),
  );
  const lomKey = first(findAfterLabel(text, ["LOM Key", "LOM_KEY"]), findTableValue(text, "LOM Key"));
  const rawTechnology = findAfterLabel(text, ["TECHNOLOGY", "Access TYPE"]);
  const rawStatus = first(findAfterLabel(text, ["Status", "Statut", "NPS_STATUS"]), findTableValue(text, "Statut"));
  const comment = first(latestHumanJournalMessage(text), findAfterLabel(text, ["Remarques"]));

  const values: Partial<InterventionData> = {
    interventionId,
    oagID,
    snowReference,
    interventionDescription: description,
    clientID,
    clientName: composeClientName(text),
    mainAddress: address.mainAddress,
    addressDetails: address.addressDetails,
    LOMKey: lomKey,
    phone,
    infrastructure: normalizeInfrastructure(rawTechnology, text),
    network: normalizeNetwork(text),
    status: normalizeStatus(rawStatus),
    comment,
    additionalInformation: buildAdditionalInformation(text, sourceType),
    isSnow: sourceType === "SNOW" || Boolean(snowReference),
    displayAllFields: true,
  };

  const filteredValues = Object.fromEntries(
    Object.entries(values).filter(([, value]) =>
      typeof value === "string" ? Boolean(value.trim()) : value !== undefined,
    ),
  ) as Partial<InterventionData>;

  return {
    values: filteredValues,
    detectedFields: Object.keys(filteredValues),
    sourceType,
  };
};
