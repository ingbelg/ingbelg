/* Welke soort pagina is dit? Eén plek voor de vernauwing van LandingData naar het juiste type. */
import type { LandingData } from '../types/pages';

export function pageKinds(page: LandingData) {
  const svc = page.kind === 'guide' || page.kind === 'overview' ? undefined : page;
  const guide = page.kind === 'guide' ? page : undefined;
  const overview = page.kind === 'overview' ? page : undefined;
  return {
    svc,
    guide,
    overview,
    isGuide: !svc,      // informatieve pagina (gids of overzicht)
    isArticle: !!guide, // gids met Article-schema
  };
}
