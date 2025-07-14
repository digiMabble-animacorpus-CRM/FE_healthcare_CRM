

import { languageData } from "@/assets/data/languageData";
import {
  LanguageType,
} from "@/types/data";

export const getAllLanguages = (): LanguageType[] => {
  return languageData;
};