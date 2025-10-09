import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async () => {
  // Default to Spanish for Colombian market
  const locale = 'es';

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
    timeZone: 'America/Bogota',
    now: new Date()
  };
});
