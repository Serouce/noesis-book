/**
 * Editorial Russian typographic filter (Stripe Press × Arzamas standard):
 * Binds short prepositions, conjunctions, particles, and scientific units with non-breaking spaces (\u00A0)
 * so ragged right edges never leave orphan 1–2 letter words at the end of a line.
 */
const PREP_REGEX =
  /(^|[\s(«„—])(в|во|без|до|из|к|ко|на|по|о|об|от|под|при|про|с|со|у|за|над|для|и|а|но|да|или|ли|бы|же|то|не|ни|как|что|чем)\s+/gi;

const UNIT_REGEX = /(\d)\s+(нм|мс|мкм|мм|см|мВ|мА|Гц|ТГц|Вт|млрд|млн|тыс\.|сут\.|мин|сек|стр\.|%|°)/g;

const FOLIO_REGEX = /(стр\.|Гл\.|Табл\.|Акт|№)\s+(\d+|I{1,3}|IV|V|VI{0,3})/g;

export function ruTypo(text: string): string {
  // Run preposition pass twice to handle consecutive short words (e.g. "и не в")
  const pass1 = text.replace(PREP_REGEX, '$1$2\u00A0');
  const pass2 = pass1.replace(PREP_REGEX, '$1$2\u00A0');
  return pass2.replace(UNIT_REGEX, '$1\u00A0$2').replace(FOLIO_REGEX, '$1\u00A0$2');
}
