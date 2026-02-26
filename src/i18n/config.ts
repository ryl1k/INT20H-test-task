import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import uk from "./locales/uk.json";
import pl from "./locales/pl.json";
import es from "./locales/es.json";
import it from "./locales/it.json";
import fr from "./locales/fr.json";
import de from "./locales/de.json";

const resources = {
  en: { translation: en },
  uk: { translation: uk },
  pl: { translation: pl },
  es: { translation: es },
  it: { translation: it },
  fr: { translation: fr },
  de: { translation: de }
};

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    resources,
    lng: localStorage.getItem("language") ?? "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    },
    initImmediate: false
  });
}

export default i18n;
